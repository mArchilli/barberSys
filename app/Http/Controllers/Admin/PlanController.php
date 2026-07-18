<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePlanRequest;
use App\Http\Requests\Admin\UpdatePlanRequest;
use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::withCount(['subscriptions as active_subscribers_count' => function ($query) {
            $query->where('status', 'active');
        }])
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans->map(fn (Plan $plan) => [
                'id'                       => $plan->id,
                'name'                     => $plan->name,
                'slug'                     => $plan->slug,
                'max_barberias'            => $plan->max_barberias,
                'max_barberos'             => $plan->max_barberos,
                'price'                    => $plan->price,
                'annual_price'             => $plan->annual_price,
                'is_custom'                => $plan->is_custom,
                'active'                   => $plan->active,
                'active_subscribers_count' => $plan->active_subscribers_count,
                'included_items'           => $plan->included_items ?? [],
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Plans/Create', [
            'knownFeatures' => Plan::KNOWN_FEATURES,
        ]);
    }

    public function store(StorePlanRequest $request)
    {
        Plan::create($request->validated());

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'Plan creado.');
    }

    public function edit(Plan $plan): Response
    {
        return Inertia::render('Admin/Plans/Edit', [
            'plan' => [
                'id'            => $plan->id,
                'name'          => $plan->name,
                'slug'          => $plan->slug,
                'max_barberias' => $plan->max_barberias,
                'max_barberos'  => $plan->max_barberos,
                'price'         => $plan->price,
                'annual_price'  => $plan->annual_price,
                'is_custom'     => $plan->is_custom,
                'active'        => $plan->active,
                'features'      => $plan->features ?? [],
                'included_items' => $plan->included_items ?? [],
            ],
            'knownFeatures'   => Plan::KNOWN_FEATURES,
            'subscriberUsage' => $this->subscriberUsage($plan),
        ]);
    }

    public function update(UpdatePlanRequest $request, Plan $plan)
    {
        $plan->update($request->validated());

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'Plan actualizado.');
    }

    /**
     * Uso real de los owners suscriptos a este plan, para que Edit.jsx pueda
     * advertir (sin bloquear el guardado) si el nuevo límite dejaría a algún
     * owner por encima de lo permitido. CheckPlanLimits ya impide crear
     * recursos nuevos por encima del límite vigente, así que esto es solo
     * informativo para el admin.
     *
     * Se excluyen del cálculo por dimensión los owners cuya suscripción ya
     * tiene un override custom (custom_max_barberias/custom_max_barberos),
     * porque para ellos el límite del plan no aplica.
     */
    private function subscriberUsage(Plan $plan): array
    {
        $subscriptions = Subscription::where('plan_id', $plan->id)
            ->with('owner:id,name')
            ->get();

        $ownerIds = $subscriptions->pluck('owner_id');

        $barberiaCounts = Barberia::where('active', true)
            ->whereIn('owner_id', $ownerIds)
            ->selectRaw('owner_id, count(*) as total')
            ->groupBy('owner_id')
            ->pluck('total', 'owner_id');

        $barberoCounts = User::where('users.role', 'barber')
            ->where('users.active', true)
            ->join('barberias', 'barberias.id', '=', 'users.barberia_id')
            ->whereIn('barberias.owner_id', $ownerIds)
            ->selectRaw('barberias.owner_id as owner_id, count(*) as total')
            ->groupBy('barberias.owner_id')
            ->pluck('total', 'owner_id');

        return $subscriptions
            ->map(fn (Subscription $subscription) => [
                'owner_id'             => $subscription->owner_id,
                'owner_name'           => $subscription->owner->name,
                'barberias_count'      => (int) ($barberiaCounts[$subscription->owner_id] ?? 0),
                'barberos_count'       => (int) ($barberoCounts[$subscription->owner_id] ?? 0),
                'custom_max_barberias' => $subscription->custom_max_barberias,
                'custom_max_barberos'  => $subscription->custom_max_barberos,
            ])
            ->values()
            ->all();
    }
}
