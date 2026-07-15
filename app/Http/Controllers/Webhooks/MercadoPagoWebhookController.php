<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\SystemErrorLog;
use App\Services\Invoicing\InvoicingServiceInterface;
use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Receptor de notificaciones de MercadoPago (ruta pública, excluida de CSRF
 * en bootstrap/app.php). Seguridad: NUNCA se confía en el payload recibido —
 * cada notificación se verifica consultando el recurso contra la API de MP
 * con nuestras credenciales. Idempotente: el mismo evento puede llegar
 * repetido y no duplica pagos (unique sobre mp_payment_id).
 */
class MercadoPagoWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        MercadoPagoSubscriptionService $mp,
        InvoicingServiceInterface $invoicing
    ) {
        // MP notifica con body JSON {type, data.id} (webhooks) o query params
        // ?topic=...&id=... (IPN legado) — se aceptan ambos formatos.
        $type = $request->input('type', $request->query('topic'));
        $resourceId = $request->input('data.id', $request->query('id'));

        if (! $type || ! $resourceId) {
            return response()->json(['status' => 'ignored']);
        }

        try {
            match ($type) {
                'payment' => $this->handlePayment((string) $resourceId, $mp, $invoicing),
                'subscription_preapproval' => $this->handlePreapproval((string) $resourceId, $mp),
                default => null,
            };
        } catch (Throwable $e) {
            SystemErrorLog::create([
                'exception_class' => get_class($e),
                'message' => 'Fallo procesando webhook de MercadoPago: '.$e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => $request->fullUrl(),
                'user_id' => null,
                'context' => ['type' => $type, 'resource_id' => $resourceId],
            ]);

            // Non-2xx: MP reintenta la notificación más tarde.
            return response()->json(['status' => 'error'], 500);
        }

        return response()->json(['status' => 'ok']);
    }

    private function handlePayment(
        string $paymentId,
        MercadoPagoSubscriptionService $mp,
        InvoicingServiceInterface $invoicing
    ): void {
        // JSON crudo (no el recurso tipado del SDK): necesitamos
        // point_of_interaction.transaction_data.subscription_id/plan_id, que
        // el deserializador del SDK descarta por no estar declarados en
        // TransactionData. Ver docblock de getPaymentRaw().
        $mpPayment = $mp->getPaymentRaw($paymentId);

        $subscription = $this->resolveSubscriptionFromPayment($mpPayment);

        if (! $subscription) {
            // Pago que no corresponde a una suscripción nuestra: se ignora.
            return;
        }

        $payment = SubscriptionPayment::updateOrCreate(
            ['mp_payment_id' => (string) $mpPayment['id']],
            [
                'subscription_id' => $subscription->id,
                'amount' => (float) $mpPayment['transaction_amount'],
                'status' => (string) $mpPayment['status'],
                'paid_at' => ($mpPayment['date_approved'] ?? null) ? Carbon::parse($mpPayment['date_approved']) : null,
            ]
        );

        if ($payment->isApproved()) {
            if ($subscription->status !== 'active') {
                $subscription->update(['status' => 'active']);
            }

            $this->syncAmountIfDiscountWindowEnded($subscription, $mp);

            // Nunca lanza: un fallo de facturación no rompe el cobro (queda
            // en system_error_logs para reintento).
            $invoicing->issueInvoiceFor($payment);
        } elseif ($payment->status === 'rejected' && $subscription->status === 'active') {
            $subscription->update(['status' => 'past_due']);
        }
    }

    /**
     * A diferencia del flujo "sin plan" original, el checkout hosteado del
     * Plan no permite pasarle external_reference — así que la primera vez
     * que sabemos el mp_preapproval_id real es acá, resolviendo la
     * Subscription por mp_preapproval_plan_id (seteado al activar, ver
     * SubscriptionController::activate()) y completándolo recién ahora.
     *
     * Puede haber más de un preapproval para el mismo plan (un intento
     * cancelado dentro del checkout + un reintento exitoso — ver docblock de
     * findPreapprovalByPlan). Si `retorno()` llegó a enlazar el cancelado
     * antes de que este webhook confirmara el bueno, un preapproval que
     * llega `authorized` siempre gana y sobreescribe — nunca al revés, para
     * no pisar una suscripción ya activa con una notificación vieja o de un
     * intento distinto.
     */
    private function handlePreapproval(string $preapprovalId, MercadoPagoSubscriptionService $mp): void
    {
        $preapproval = $mp->getPreapproval($preapprovalId);

        $subscription = Subscription::where('mp_preapproval_id', $preapprovalId)
            ->orWhere('mp_preapproval_plan_id', $preapproval->preapproval_plan_id)
            ->first();

        if (! $subscription) {
            return;
        }

        $newStatus = match ($preapproval->status) {
            'authorized' => 'active',
            'paused' => 'past_due',
            'cancelled' => 'cancelled',
            default => null,
        };

        $isSamePreapproval = $subscription->mp_preapproval_id === $preapproval->id;
        $adoptsThisPreapproval = $subscription->mp_preapproval_id === null
            || $isSamePreapproval
            || $preapproval->status === 'authorized';

        if ($adoptsThisPreapproval) {
            $subscription->fill([
                'mp_preapproval_id' => $preapproval->id,
                'mp_payer_email' => $preapproval->payer_email ?: $subscription->mp_payer_email,
                'mp_next_payment_date' => $preapproval->next_payment_date
                    ? Carbon::parse($preapproval->next_payment_date)
                    : $subscription->mp_next_payment_date,
            ]);

            if ($newStatus !== null) {
                $subscription->status = $newStatus;
            }
        }

        if ($subscription->isDirty()) {
            $subscription->save();
        }
    }

    /**
     * Un pago generado por el cobro recurrente de una suscripción trae, en
     * point_of_interaction.transaction_data, el id del preapproval que lo
     * originó (`subscription_id`, pese al nombre, ES el preapproval_id) y el
     * plan (`plan_id`). external_reference viene null (el checkout hosteado
     * del Plan no lo admite) — esta es la única correlación disponible.
     *
     * Se intenta primero por mp_preapproval_id (caso normal: el webhook de
     * subscription_preapproval ya lo enlazó) y se cae a mp_preapproval_plan_id
     * como resguardo ante una posible condición de carrera si este webhook de
     * pago llega antes que el de la suscripción — en ese caso, de paso,
     * autocompleta mp_preapproval_id para que no quede pendiente.
     */
    private function resolveSubscriptionFromPayment(array $mpPayment): ?Subscription
    {
        $transactionData = $mpPayment['point_of_interaction']['transaction_data'] ?? null;
        $preapprovalId = $transactionData['subscription_id'] ?? null;
        $planId = $transactionData['plan_id'] ?? null;

        if (! $preapprovalId && ! $planId) {
            return null;
        }

        $subscription = $preapprovalId
            ? Subscription::where('mp_preapproval_id', $preapprovalId)->first()
            : null;

        if (! $subscription && $planId) {
            $subscription = Subscription::where('mp_preapproval_plan_id', $planId)->first();

            if ($subscription && $preapprovalId && ! $subscription->mp_preapproval_id) {
                $subscription->update(['mp_preapproval_id' => $preapprovalId]);
            }
        }

        return $subscription;
    }

    /**
     * Cupón con duration_months: cuando el cobro recién registrado completa
     * la ventana de descuento, se actualiza el preapproval al precio pleno.
     * Se hace solo en la transición exacta (count == duration) para no llamar
     * a MP en cada pago.
     */
    private function syncAmountIfDiscountWindowEnded(
        Subscription $subscription,
        MercadoPagoSubscriptionService $mp
    ): void {
        $snapshot = $subscription->coupon_discount_snapshot;
        $duration = $snapshot['duration_months'] ?? null;

        if ($duration === null || ! $subscription->hasPreapproval()) {
            return;
        }

        if ($subscription->approvedPaymentsCount() === (int) $duration) {
            $mp->updateAmount(
                $subscription->mp_preapproval_id,
                $mp->monthlyAmountFor($subscription)
            );
        }
    }
}
