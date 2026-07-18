<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ActivateSubscriptionRequest;
use App\Http\Requests\Owner\UpgradePlanRequest;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use App\Services\PlanLimitService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class SubscriptionController extends Controller
{
    public function __construct(private PlanLimitService $planLimitService) {}

    public function index()
    {
        $owner = Auth::user();
        $subscription = $owner->subscription()->with('plan')->firstOrFail();
        $mp = new MercadoPagoSubscriptionService;

        $payments = $subscription->payments()
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'paid_at' => optional($payment->paid_at)->toDateString(),
                // invoice_status manda: mientras esté 'solicitado' la factura NO
                // está lista (autorización asíncrona de AFIP pendiente). El front
                // sólo muestra la factura como lista en 'autorizado'.
                'invoice_status' => $payment->invoice_status,
                'cae' => $payment->cae,
            ]);

        // Planes publicados a los que el owner puede cambiarse por autoservicio.
        $availablePlans = Plan::where('active', true)
            ->where('is_custom', false)
            ->where('id', '!=', $subscription->plan_id)
            ->orderBy('price')
            ->get(['id', 'name', 'price', 'annual_price', 'max_barberias', 'max_barberos', 'included_items']);

        return Inertia::render('Owner/Suscripcion/Index', [
            'subscription' => [
                'plan_name' => $subscription->plan->name,
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'trial_ends_at' => optional($subscription->trial_ends_at)->toDateString(),
                'trial_days_left' => $subscription->trialDaysLeft(),
                // Monto real del PRÓXIMO cobro (mensual o el cargo anual completo).
                'charge_amount' => $mp->chargeAmountFor($subscription),
                'list_price' => $subscription->effectivePrice(),
                'coupon' => $subscription->coupon_discount_snapshot,
                'has_preapproval' => $subscription->hasPreapproval(),
                'next_payment_date' => optional($subscription->mp_next_payment_date)->toDateString(),
                // Precios mensual-equivalente de AMBOS ciclos del plan propio
                // (sin descuento de cupón), para el selector de activación
                // (punto 6): mostrar el ahorro antes de que el owner elija.
                // 'annual' viene null si el plan no tiene precio anual cargado
                // (ej. Plan 4 a medida sin custom_annual_price todavía).
                'pricing' => [
                    'monthly' => (float) ($subscription->custom_price ?? $subscription->plan->price),
                    'annual' => ($subscription->custom_annual_price ?? $subscription->plan->annual_price) !== null
                        ? (float) ($subscription->custom_annual_price ?? $subscription->plan->annual_price)
                        : null,
                ],
            ],
            'billing' => [
                'cuit' => $owner->cuit,
                'razon_social' => $owner->razon_social,
            ],
            'payments' => $payments,
            'availablePlans' => $availablePlans,
            'currentUsage' => [
                'barberias' => $this->planLimitService->currentBarberias($owner),
                'barberos' => $this->planLimitService->currentBarberos($owner),
            ],
            'mpConfigured' => MercadoPagoSubscriptionService::isConfigured(),
        ]);
    }

    /**
     * Crea el Plan de MercadoPago para esta suscripción y redirige al owner a
     * su checkout hosteado para autorizar el débito automático. Los datos
     * fiscales del formulario son opcionales: sin ellos la factura sale a
     * consumidor final.
     *
     * Nunca creamos el preapproval nosotros mismos (ver docblock de
     * createPreapprovalPlan): redirigimos al init_point del PLAN y dejamos
     * que MercadoPago aloje todo el checkout — Pelito no toca datos de
     * tarjeta. El preapproval resultante se resuelve después, en retorno()
     * o en el webhook, buscando por mp_preapproval_plan_id.
     */
    public function activate(ActivateSubscriptionRequest $request, MercadoPagoSubscriptionService $mp)
    {
        $owner = Auth::user();
        $subscription = $owner->subscription()->with('plan')->firstOrFail();

        if ($subscription->hasPreapproval()) {
            return redirect()->route('owner.suscripcion.index')
                ->with('success', 'Tu suscripción ya tiene el débito automático activado.');
        }

        if (! MercadoPagoSubscriptionService::isConfigured()) {
            return back()->withErrors([
                'mercadopago' => 'El pago online no está disponible en este momento. Escribinos y lo resolvemos.',
            ]);
        }

        $owner->update([
            'cuit' => $request->cuit,
            'razon_social' => $request->razon_social,
        ]);

        $subscription->update(['billing_cycle' => $request->billing_cycle]);
        $subscription->refresh();

        try {
            $plan = $mp->createPreapprovalPlan(
                $subscription,
                MercadoPagoSubscriptionService::publicRouteUrl('owner.suscripcion.retorno')
            );
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'mercadopago' => 'No pudimos iniciar la activación con MercadoPago. Probá de nuevo en unos minutos.',
            ]);
        }

        $subscription->update(['mp_preapproval_plan_id' => $plan->id]);

        // Redirección externa al checkout de MP (Inertia::location fuerza un
        // full page visit en lugar de una visita XHR de Inertia).
        return Inertia::location($plan->init_point);
    }

    /**
     * back_url del plan: MP redirige acá después de que el owner autoriza (o
     * abandona) el checkout. Buscamos el preapproval resultante por
     * mp_preapproval_plan_id — el checkout hosteado no expone
     * external_reference, así que esta es la única forma de encontrarlo. Si
     * todavía no aparece (el owner puede haber abandonado el checkout, o la
     * búsqueda puede tardar unos segundos en reflejarlo), no es un error: el
     * webhook es la fuente de verdad final y lo resuelve después.
     *
     * Reintenta la búsqueda mientras la suscripción no esté `active` — no
     * alcanza con chequear "¿ya tiene mp_preapproval_id?", porque puede haber
     * quedado enlazada a un intento cancelado (ver docblock de
     * findPreapprovalByPlan): reintentar acá permite que una segunda visita
     * se autocorrija sin depender solo del webhook.
     */
    public function retorno(MercadoPagoSubscriptionService $mp)
    {
        $subscription = Auth::user()->subscription()->firstOrFail();

        if (! $subscription->hasPreapprovalPlan() || $subscription->status === 'active') {
            return redirect()->route('owner.suscripcion.index');
        }

        try {
            $preapproval = $mp->findPreapprovalByPlan($subscription->mp_preapproval_plan_id);

            if ($preapproval !== null) {
                $subscription->update([
                    'mp_preapproval_id' => $preapproval->id,
                    'mp_payer_email' => $preapproval->payer_email ?: null,
                    'mp_next_payment_date' => $preapproval->next_payment_date
                        ? Carbon::parse($preapproval->next_payment_date)
                        : null,
                    'status' => $preapproval->status === 'authorized' ? 'active' : $subscription->status,
                ]);
            }
        } catch (Throwable $e) {
            // Si MP no responde ahora, el webhook actualizará el estado después.
            report($e);
        }

        return redirect()->route('owner.suscripcion.index')
            ->with('success', 'Listo, procesamos tu autorización con MercadoPago.');
    }

    /**
     * Cambio de plan por autoservicio. Server-side se valida que el uso
     * actual (barberías/barberos activos) entre en los límites del plan
     * nuevo — nunca es una restricción solo visual (regla de CLAUDE.md).
     *
     * El ciclo de cobro (billing_cycle) NO cambia acá — un upgrade cambia el
     * plan, no el ciclo. Para billing_cycle=annual el nuevo monto se aplica
     * recién en la próxima renovación (ver CLAUDE.md); para monthly se
     * actualiza el preapproval de inmediato, como siempre.
     */
    public function upgrade(UpgradePlanRequest $request, MercadoPagoSubscriptionService $mp)
    {
        $owner = Auth::user();
        $subscription = $owner->subscription()->with('plan')->firstOrFail();
        $newPlan = Plan::findOrFail($request->plan_id);

        $usageErrors = $this->usageBlockingChange($subscription, $newPlan);
        if ($usageErrors !== null) {
            return back()->withErrors(['plan_id' => $usageErrors]);
        }

        try {
            DB::transaction(function () use ($subscription, $newPlan, $mp) {
                // custom_price/custom_annual_price eran un precio negociado
                // para el plan anterior: al cambiar de plan rige el precio de
                // catálogo del plan nuevo. Los overrides de límites
                // (custom_max_*) se conservan.
                $subscription->update([
                    'plan_id' => $newPlan->id,
                    'custom_price' => null,
                    'custom_annual_price' => null,
                ]);

                // Suscripción anual: NO se actualiza el monto del preapproval
                // de inmediato con prorrateo — el owner ya pagó el cargo
                // anual completo del plan viejo. El nuevo monto se aplica
                // recién en la próxima renovación anual (limitación
                // deliberada, ver CLAUDE.md). plan_id ya quedó actualizado
                // arriba, así que el resto de la app (límites, features) ve
                // el plan nuevo desde ya.
                if ($subscription->hasPreapproval() && ! $subscription->isAnnual()) {
                    $mp->updateAmount(
                        $subscription->mp_preapproval_id,
                        $mp->chargeAmountFor($subscription->fresh(['plan', 'payments']))
                    );
                }
            });
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'plan_id' => 'No pudimos actualizar el monto en MercadoPago. El cambio de plan no se aplicó — probá de nuevo en unos minutos.',
            ]);
        }

        return redirect()->route('owner.suscripcion.index')
            ->with('success', "Cambiaste al plan {$newPlan->name}.");
    }

    /**
     * Mensaje de error si el uso actual excede los límites del plan destino
     * (considerando los overrides custom de la suscripción), o null si el
     * cambio es viable.
     */
    private function usageBlockingChange(Subscription $subscription, Plan $newPlan): ?string
    {
        $owner = $subscription->owner;

        $maxBarberias = $subscription->custom_max_barberias ?? $newPlan->max_barberias;
        $maxBarberos = $subscription->custom_max_barberos ?? $newPlan->max_barberos;

        $barberias = $this->planLimitService->currentBarberias($owner);
        $barberos = $this->planLimitService->currentBarberos($owner);

        if ($maxBarberias !== null && $barberias > $maxBarberias) {
            return "Tenés {$barberias} barberías activas y el plan {$newPlan->name} permite {$maxBarberias}. Cerrá barberías antes de cambiar.";
        }

        if ($maxBarberos !== null && $barberos > $maxBarberos) {
            return "Tenés {$barberos} barberos activos y el plan {$newPlan->name} permite {$maxBarberos}. Dá de baja barberos antes de cambiar.";
        }

        return null;
    }
}
