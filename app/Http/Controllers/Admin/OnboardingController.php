<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\BusinessMetricsService;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(private readonly BusinessMetricsService $metrics)
    {
    }

    public function index(): Response
    {
        $owners = $this->metrics->newOwnersOnboarding();

        return Inertia::render('Admin/Onboarding/Index', [
            'owners' => $owners->map(function (array $row) {
                /** @var User $owner */
                $owner = $row['owner'];

                return [
                    'owner_id'            => $owner->id,
                    'owner_name'          => $owner->name,
                    'owner_email'         => $owner->email,
                    'owner_phone'         => $owner->phone,
                    'created_at'          => $owner->created_at->toDateString(),
                    'dias_desde_registro' => $row['dias_desde_registro'],
                    'has_servicio'        => $row['has_servicio'],
                    'first_servicio_at'   => $row['first_servicio_at'],
                    'has_medio_pago'      => $row['has_medio_pago'],
                    'first_medio_pago_at' => $row['first_medio_pago_at'],
                    'has_barbero'         => $row['has_barbero'],
                    'first_barbero_at'    => $row['first_barbero_at'],
                    'has_corte'           => $row['has_corte'],
                    'first_corte_at'      => $row['first_corte_at'],
                    'activado'            => $row['has_corte'],
                ];
            }),
        ]);
    }
}
