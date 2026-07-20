<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Barberia;
use App\Models\Corte;
use App\Services\BarberPerformanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MiRendimientoController extends Controller
{
    public function __construct(private BarberPerformanceService $barberPerformanceService) {}

    /**
     * Historial completo de la propia actividad del owner como barbero en
     * esta barbería puntual. Al igual que el Consolidado, no es una
     * restricción de permisos: si el owner nunca cargó un corte a su nombre
     * acá, no hay nada que mostrar, así que se lo redirige en vez de abortar.
     */
    public function index(Barberia $barberia): Response|RedirectResponse
    {
        $owner = Auth::user();

        $tieneActividad = Corte::where('barberia_id', $barberia->id)
            ->where('barbero_id', $owner->id)
            ->exists();

        if (! $tieneActividad) {
            return redirect()->route('owner.barberias.dashboard', $barberia->id);
        }

        $stats = $this->barberPerformanceService->historico($owner->id, $barberia->id);

        return Inertia::render('Owner/MiRendimiento/Index', [
            'owner' => [
                'id'    => $owner->id,
                'name'  => $owner->name,
                'email' => $owner->email,
            ],
            'stats' => [
                'totalFacturado' => $stats['totalFacturado'],
                'totalCortes'    => $stats['totalCortes'],
                'activoDesde'    => $stats['activoDesde'],
            ],
            'porServicio'        => $stats['porServicio'],
            'clientesFrecuentes' => $stats['clientesFrecuentes'],
        ]);
    }
}
