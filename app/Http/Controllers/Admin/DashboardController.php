<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\Admin\BusinessMetricsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly BusinessMetricsService $metrics)
    {
    }

    public function index(): Response
    {
        $trialsExpiringSoon = $this->metrics->trialsExpiringSoon();
        $inactiveOwners = $this->metrics->inactiveOwners();
        $ownersNearPlanLimit = $this->metrics->ownersNearPlanLimit();

        return Inertia::render('Admin/Dashboard', [
            'activeClientsCount'     => $this->metrics->activeClientsCount(),
            'trialClientsCount'      => $this->metrics->trialClientsCount(),
            'mrr'                    => $this->metrics->mrr(),
            'mrrByPlan'              => $this->metrics->mrrByPlan(),
            'trialsExpiringSoonCount' => $trialsExpiringSoon->count(),
            'trialsExpiringSoon'     => $trialsExpiringSoon->map(fn (Subscription $s) => [
                'owner_id'      => $s->owner_id,
                'owner_name'    => $s->owner->name,
                'plan_name'     => $s->plan->name,
                'trial_ends_at' => optional($s->trial_ends_at)->toDateString(),
            ]),
            'inactiveOwners' => $inactiveOwners->map(fn (array $row) => [
                'owner_id'      => $row['owner']->id,
                'owner_name'    => $row['owner']->name,
                'barberia_name' => $row['barberia_name'],
                'last_corte_at' => $row['last_corte_at'],
            ]),
            'ownersNearPlanLimit' => $ownersNearPlanLimit->map(fn (array $row) => [
                'owner_id'   => $row['owner']->id,
                'owner_name' => $row['owner']->name,
                'plan_name'  => $row['plan_name'],
                'barberias'  => $row['barberias_label'],
                'barberos'   => $row['barberos_label'],
            ]),
        ]);
    }
}
