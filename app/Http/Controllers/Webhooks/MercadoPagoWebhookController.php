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
        $mpPayment = $mp->getPayment($paymentId);

        $subscription = $this->resolveSubscription($mpPayment->external_reference ?? null);

        if (! $subscription) {
            // Pago que no corresponde a una suscripción nuestra: se ignora.
            return;
        }

        $payment = SubscriptionPayment::updateOrCreate(
            ['mp_payment_id' => (string) $mpPayment->id],
            [
                'subscription_id' => $subscription->id,
                'amount' => (float) $mpPayment->transaction_amount,
                'status' => (string) $mpPayment->status,
                'paid_at' => $mpPayment->date_approved ? Carbon::parse($mpPayment->date_approved) : null,
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

    private function handlePreapproval(string $preapprovalId, MercadoPagoSubscriptionService $mp): void
    {
        $preapproval = $mp->getPreapproval($preapprovalId);

        $subscription = Subscription::where('mp_preapproval_id', $preapprovalId)->first();

        if (! $subscription) {
            return;
        }

        $newStatus = match ($preapproval->status) {
            'authorized' => 'active',
            'paused' => 'past_due',
            'cancelled' => 'cancelled',
            default => null,
        };

        if ($newStatus !== null && $subscription->status !== $newStatus) {
            $subscription->update(['status' => $newStatus]);
        }
    }

    /**
     * Los pagos generados por un preapproval heredan su external_reference,
     * que seteamos con el id de la subscription al crearlo.
     */
    private function resolveSubscription(?string $externalReference): ?Subscription
    {
        if (! $externalReference || ! ctype_digit($externalReference)) {
            return null;
        }

        return Subscription::find((int) $externalReference);
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
