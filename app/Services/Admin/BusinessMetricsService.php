<?php

namespace App\Services\Admin;

use App\Models\Barberia;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\Subscription;
use App\Models\User;
use App\Scopes\BelongsToBarberiaScope;
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

    /**
     * Owners registrados en los últimos $days días, con su checklist de activación
     * (servicio, medio de pago, barbero, corte) y el owner con más días sin activar
     * (sin corte cargado) primero.
     */
    public function newOwnersOnboarding(int $days = 30): Collection
    {
        $since = Carbon::now()->subDays($days);

        $recentOwnerIds = User::where('role', 'owner')
            ->where('created_at', '>=', $since)
            ->pluck('id');

        if ($recentOwnerIds->isEmpty()) {
            return collect();
        }

        // Bypass documentado del BelongsToBarberiaScope (excepción admin, ver CLAUDE.md).
        // Primer registro cargado por owner, en una sola query agregada
        // (MIN + GROUP BY) por señal — filtrada por barberias.owner_id IN
        // (los owners del rango) ANTES de agregar, para que el MIN/GROUP BY
        // corra solo sobre sus barberías, no sobre toda la tabla cortes/
        // servicios/medios_pago (irrelevante para el resultado y, con el
        // dataset creciendo, cada vez más caro de barrer entero).
        $firstServicios = Servicio::withoutGlobalScope(BelongsToBarberiaScope::class)
            ->join('barberias', 'barberias.id', '=', 'servicios.barberia_id')
            ->whereIn('barberias.owner_id', $recentOwnerIds)
            ->selectRaw('barberias.owner_id as owner_id, MIN(servicios.created_at) as first_at')
            ->groupBy('barberias.owner_id');

        $firstMediosPago = MedioPago::withoutGlobalScope(BelongsToBarberiaScope::class)
            ->join('barberias', 'barberias.id', '=', 'medios_pago.barberia_id')
            ->whereIn('barberias.owner_id', $recentOwnerIds)
            ->selectRaw('barberias.owner_id as owner_id, MIN(medios_pago.created_at) as first_at')
            ->groupBy('barberias.owner_id');

        $firstCortes = Corte::withoutGlobalScope(BelongsToBarberiaScope::class)
            ->join('barberias', 'barberias.id', '=', 'cortes.barberia_id')
            ->whereIn('barberias.owner_id', $recentOwnerIds)
            ->selectRaw('barberias.owner_id as owner_id, MIN(cortes.created_at) as first_at')
            ->groupBy('barberias.owner_id');

        // User no tiene BelongsToBarberiaScope (ver comentario en OwnerController::index).
        $firstBarberos = User::where('role', 'barber')
            ->join('barberias', 'barberias.id', '=', 'users.barberia_id')
            ->whereIn('barberias.owner_id', $recentOwnerIds)
            ->selectRaw('barberias.owner_id as owner_id, MIN(users.created_at) as first_at')
            ->groupBy('barberias.owner_id');

        return User::where('users.role', 'owner')
            ->whereIn('users.id', $recentOwnerIds)
            ->leftJoinSub($firstServicios, 'first_servicios', 'first_servicios.owner_id', '=', 'users.id')
            ->leftJoinSub($firstMediosPago, 'first_medios_pago', 'first_medios_pago.owner_id', '=', 'users.id')
            ->leftJoinSub($firstBarberos, 'first_barberos', 'first_barberos.owner_id', '=', 'users.id')
            ->leftJoinSub($firstCortes, 'first_cortes', 'first_cortes.owner_id', '=', 'users.id')
            ->select(
                'users.*',
                'first_servicios.first_at as first_servicio_at',
                'first_medios_pago.first_at as first_medio_pago_at',
                'first_barberos.first_at as first_barbero_at',
                'first_cortes.first_at as first_corte_at'
            )
            ->orderByRaw('(first_cortes.first_at IS NULL) DESC')
            ->orderBy('users.created_at')
            ->get()
            ->map(fn (User $owner) => [
                'owner'               => $owner,
                'dias_desde_registro' => (int) $owner->created_at->diffInDays(Carbon::now()),
                'has_servicio'        => $owner->first_servicio_at !== null,
                'first_servicio_at'   => $owner->first_servicio_at,
                'has_medio_pago'      => $owner->first_medio_pago_at !== null,
                'first_medio_pago_at' => $owner->first_medio_pago_at,
                'has_barbero'         => $owner->first_barbero_at !== null,
                'first_barbero_at'    => $owner->first_barbero_at,
                'has_corte'           => $owner->first_corte_at !== null,
                'first_corte_at'      => $owner->first_corte_at,
            ]);
    }

    public function ownersNearPlanLimit(float $threshold = 0.8): Collection
    {
        $owners = User::where('role', 'owner')
            ->whereHas('subscription')
            ->with('subscription.plan')
            ->withCount(['barberias' => fn ($q) => $q->where('active', true)])
            ->get();

        // Barberos activos por owner en una única consulta agregada (mismo
        // patrón que ya usa Admin\OwnerController::index): User no tiene
        // owner_id directo, se llega vía barberias.owner_id.
        $barberoCounts = User::where('role', 'barber')
            ->where('users.active', true)
            ->join('barberias', 'barberias.id', '=', 'users.barberia_id')
            ->selectRaw('barberias.owner_id as owner_id, count(*) as total')
            ->groupBy('barberias.owner_id')
            ->pluck('total', 'owner_id');

        return $owners
            ->map(function (User $owner) use ($barberoCounts) {
                // subscription.plan ya viene eager loaded arriba: llamar a
                // estos métodos del modelo NO dispara queries nuevas (a
                // diferencia de PlanLimitService::maxBarberias/maxBarberos,
                // que re-consultaban la suscripción desde cero por owner).
                $maxBarberias = $owner->subscription->maxBarberias();
                $maxBarberos = $owner->subscription->maxBarberos();
                $currentBarberias = $owner->barberias_count;
                $currentBarberos = (int) ($barberoCounts[$owner->id] ?? 0);

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
