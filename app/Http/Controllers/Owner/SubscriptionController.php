<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ActivateSubscriptionRequest;
use App\Http\Requests\Owner\UpgradePlanRequest;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use App\Services\PlanLimitService;
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
            ->get(['id', 'name', 'price', 'max_barberias', 'max_barberos', 'included_items']);

        return Inertia::render('Owner/Suscripcion/Index', [
            'subscription' => [
                'plan_name' => $subscription->plan->name,
                'status' => $subscription->status,
                'trial_ends_at' => optional($subscription->trial_ends_at)->toDateString(),
                'trial_days_left' => $subscription->trialDaysLeft(),
                'monthly_amount' => $mp->monthlyAmountFor($subscription),
                'list_price' => $subscription->effectivePrice(),
                'coupon' => $subscription->coupon_discount_snapshot,
                'has_preapproval' => $subscription->hasPreapproval(),
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
     * Crea el preapproval en MercadoPago y redirige al owner al init_point
     * para autorizar el débito automático. Los datos fiscales del formulario
     * son opcionales: sin ellos la factura sale a consumidor final.
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

        try {
            $preapproval = $mp->createPreapproval(
                $subscription,
                $owner->email,
                route('owner.suscripcion.retorno')
            );
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'mercadopago' => 'No pudimos iniciar la activación con MercadoPago. Probá de nuevo en unos minutos.',
            ]);
        }

        $subscription->update([
            'mp_preapproval_id' => $preapproval->id,
            'mp_payer_email' => $owner->email,
        ]);

        // Redirección externa al checkout de MP (Inertia::location fuerza un
        // full page visit en lugar de una visita XHR de Inertia).
        return Inertia::location($preapproval->init_point);
    }

    /**
     * back_url del preapproval: MP redirige acá después de que el owner
     * autoriza (o cancela) el débito. La fuente de verdad del estado es la
     * API (se consulta el preapproval); el webhook confirma después.
     */
    public function retorno(MercadoPagoSubscriptionService $mp)
    {
        $subscription = Auth::user()->subscription()->firstOrFail();

        if (! $subscription->hasPreapproval()) {
            return redirect()->route('owner.suscripcion.index');
        }

        try {
            $preapproval = $mp->getPreapproval($subscription->mp_preapproval_id);

            if ($preapproval->status === 'authorized' && $subscription->status !== 'active') {
                $subscription->update(['status' => 'active']);
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
                // custom_price era un precio negociado para el plan anterior:
                // al cambiar de plan rige el precio de catálogo del plan nuevo.
                // Los overrides de límites (custom_max_*) se conservan.
                $subscription->update([
                    'plan_id' => $newPlan->id,
                    'custom_price' => null,
                ]);

                if ($subscription->hasPreapproval()) {
                    $mp->updateAmount(
                        $subscription->mp_preapproval_id,
                        $mp->monthlyAmountFor($subscription->fresh(['plan', 'payments']))
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
