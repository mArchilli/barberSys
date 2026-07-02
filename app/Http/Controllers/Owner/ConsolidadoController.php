<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\EnsuresMultipleBarberias;
use App\Http\Controllers\Concerns\ResolvesPeriod;
use App\Http\Controllers\Controller;
use App\Models\Corte;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsolidadoController extends Controller
{
    use EnsuresMultipleBarberias, ResolvesPeriod;

    public function index(Request $request): Response|RedirectResponse
    {
        if ($redirect = $this->redirectIfConsolidadoNoAplica($request)) {
            return $redirect;
        }

        $owner = $request->user();
        $inicio = $this->resolvePeriod($request);
        $fin = $inicio->copy()->endOfMonth();

        $barberias = $owner->barberias()->where('active', true)->orderBy('name')->get(['id', 'name']);

        // No bypasea el Global Scope de Corte (sigue activo sobre este query),
        // pero además filtra explícitamente por owner_id vía join: el
        // consolidado cruza varias barberías a la vez y no debe depender del
        // comportamiento particular del scope para el rol owner.
        $facturacionPorBarberia = Corte::query()
            ->join('barberias', 'barberias.id', '=', 'cortes.barberia_id')
            ->where('barberias.owner_id', $owner->id)
            ->whereBetween('cortes.performed_at', [$inicio->toDateString(), $fin->toDateString()])
            ->selectRaw('cortes.barberia_id as barberia_id, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('cortes.barberia_id')
            ->get()
            ->keyBy('barberia_id');

        $comparativa = $barberias->map(function ($barberia) use ($facturacionPorBarberia) {
            $fila = $facturacionPorBarberia->get($barberia->id);

            return [
                'id' => $barberia->id,
                'name' => $barberia->name,
                'total' => (float) ($fila->total ?? 0),
                'cantidad' => (int) ($fila->cantidad ?? 0),
            ];
        })->sortByDesc('total')->values();

        return Inertia::render('Owner/Barberias/Consolidado', [
            'period' => ['month' => $inicio->format('Y-m')],
            'totalFacturado' => (float) $comparativa->sum('total'),
            'totalCortes' => (int) $comparativa->sum('cantidad'),
            'comparativa' => $comparativa,
        ]);
    }
}
