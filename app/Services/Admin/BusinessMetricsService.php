<?php

namespace App\Services\Admin;

use App\Models\Barberia;
use App\Models\Corte;
use App\Models\Subscription;
use App\Models\User;
use App\Scopes\BelongsToBarberiaScope;
use App\Services\PlanLimitService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Todas las queries de este servicio corren en contexto admin (namespace Admin,
 * Fase 9) y leen datos across todos los tenants con fines de reporting de negocio.
 * Es otra excepción documentada al BelongsToBarberiaScope, en el mismo espíritu
 * que App\Http\Controllers\Admin\OwnerController — ver excepción en CLAUDE.md.
 * El scope ya no aplica ningún filtro cuando el usuario autenticado es admin,
 * pero igual se bypassea explícitamente sobre Corte para dejarlo documentado
 * en el código, siguiendo el mismo patrón que OwnerController::show.
 */
class BusinessMetricsService
{
    public function __construct(private readonly PlanLimitService $planLimitService)
    {
    }

    public function activeClientsCount(): int
    {
        return Subscription::where('status', 'active')->count();
    }

    public function trialClientsCount(): int
    {
        return Subscription::where('status', 'trial')->count();
    }

    public function mrr(): float
    {
        return $this->activeSubscriptionsWithPlan()
            ->sum(fn (Subscription $subscription) => $subscription->effectivePrice());
    }

    public function mrrByPlan(): Collection
    {
        return $this->activeSubscriptionsWithPlan()
            ->groupBy('plan_id')
            ->map(function (Collection $subscriptions) {
                /** @var Subscription $first */
                $first = $subscriptions->first();

                return [
                    'plan_id'             => $first->plan_id,
                    'plan_name'           => $first->plan->name,
                    'subscriptions_count' => $subscriptions->count(),
                    'mrr'                 => $subscriptions->sum(
                        fn (Subscription $subscription) => $subscription->effectivePrice()
                    ),
                ];
            })
            ->values();
    }

    public function trialsExpiringSoon(int $days = 7): Collection
    {
        $until = Carbon::now()->addDays($days)->endOfDay();

        return Subscription::where('status', 'trial')
            ->whereNotNull('trial_ends_at')
            ->whereBetween('trial_ends_at', [Carbon::now()->startOfDay(), $until])
            ->with(['owner:id,name,email', 'plan:id,name'])
            ->orderBy('trial_ends_at')
            ->get();
    }

    public function inactiveOwners(int $days = 14): Collection
    {
        $since = Carbon::now()->subDays($days);

        // Bypass documentado del BelongsToBarberiaScope (excepción admin, ver CLAUDE.md).
        // Última fecha de corte por barbería en una sola query agregada (MAX + GROUP BY),
        // en vez de consultar el último corte barbería por barbería.
        $lastCortes = Corte::withoutGlobalScope(BelongsToBarberiaScope::class)
            ->selectRaw('barberia_id, MAX(performed_at) as last_corte_at')
            ->groupBy('barberia_id');

        return Barberia::query()
            ->where('barberias.active', true)
            ->with('owner:id,name,email')
            ->leftJoinSub($lastCortes, 'last_cortes', 'last_cortes.barberia_id', '=', 'barberias.id')
            ->where(function ($query) use ($since) {
                $query->whereNull('last_cortes.last_corte_at')
                    ->orWhere('last_cortes.last_corte_at', '<', $since);
            })
            ->select('barberias.*', 'last_cortes.last_corte_at')
            ->orderBy('last_cortes.last_corte_at')
            ->get()
            ->map(fn (Barberia $barberia) => [
                'barberia_id'   => $barberia->id,
                'barberia_name' => $barberia->name,
                'owner'         => $barberia->owner,
                'last_corte_at' => $barberia->last_corte_at,
            ]);
    }

    public function ownersNearPlanLimit(float $threshold = 0.8): Collection
    {
        return User::where('role', 'owner')
            ->whereHas('subscription')
            ->with('subscription.plan')
            ->get()
            ->map(function (User $owner) {
                $maxBarberias = $this->planLimitService->maxBarberias($owner);
                $maxBarberos = $this->planLimitService->maxBarberos($owner);
                $currentBarberias = $this->planLimitService->currentBarberias($owner);
                $currentBarberos = $this->planLimitService->currentBarberos($owner);

                $barberiasRatio = $maxBarberias ? $currentBarberias / $maxBarberias : 0;
                $barberosRatio = $maxBarberos ? $currentBarberos / $maxBarberos : 0;

                return [
                    'owner'              => $owner,
                    'plan_name'          => $owner->subscription->plan->name,
                    'barberias_label'    => $currentBarberias . '/' . ($maxBarberias ?? '∞'),
                    'barberos_label'     => $currentBarberos . '/' . ($maxBarberos ?? '∞'),
                    'ratio'              => max($barberiasRatio, $barberosRatio),
                ];
            })
            ->filter(fn (array $row) => $row['ratio'] >= $threshold)
            ->sortByDesc('ratio')
            ->values();
    }

    private function activeSubscriptionsWithPlan(): Collection
    {
        return Subscription::where('status', 'active')->with('plan')->get();
    }
}
