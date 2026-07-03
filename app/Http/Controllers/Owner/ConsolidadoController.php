<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\EnsuresMultipleBarberias;
use App\Http\Controllers\Concerns\ResolvesPeriod;
use App\Http\Controllers\Controller;
use App\Models\Corte;
use App\Models\GastoRegistro;
use App\Models\User;
use App\Services\ComisionCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsolidadoController extends Controller
{
    use EnsuresMultipleBarberias, ResolvesPeriod;

    public function index(Request $request, ComisionCalculator $comisionCalculator): Response|RedirectResponse
    {
        if ($redirect = $this->redirectIfConsolidadoNoAplica($request)) {
            return $redirect;
        }

        $owner = $request->user();
        $inicio = $this->resolvePeriod($request);
        $fin = $inicio->copy()->endOfMonth();

        // Para el período seleccionado incluye barberías activas hoy, y también
        // las cerradas cuyo cierre ocurrió después de que terminó ese período
        // (es decir, que estuvieron abiertas durante todo el período consultado).
        // Así los meses anteriores al cierre conservan su historial tal como
        // ocurrió, sin recalcular ni excluir retroactivamente.
        $barberias = $owner->barberias()
            ->where(fn ($q) => $q->where('active', true)->orWhere('deactivated_at', '>', $fin))
            ->orderBy('name')
            ->get(['id', 'name']);

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

        $gastosPorBarberia = GastoRegistro::query()
            ->join('barberias', 'barberias.id', '=', 'gasto_registros.barberia_id')
            ->where('barberias.owner_id', $owner->id)
            ->where('gasto_registros.month', $inicio->toDateString())
            ->where('gasto_registros.is_deleted_for_month', false)
            ->selectRaw('gasto_registros.barberia_id as barberia_id, SUM(gasto_registros.amount) as total')
            ->groupBy('gasto_registros.barberia_id')
            ->get()
            ->keyBy('barberia_id');

        // Los sueldos no se pueden agregar con un simple SUM en SQL porque la
        // comisión depende de commission_pct por barbero: se calculan uno por
        // uno con ComisionCalculator y después se agrupan por barbería.
        $sueldosPorBarberia = User::query()
            ->join('barberias', 'barberias.id', '=', 'users.barberia_id')
            ->where('barberias.owner_id', $owner->id)
            ->where('users.role', 'barber')
            ->where('users.created_at', '<=', $fin)
            ->where(fn ($q) => $q->where('users.active', true)->orWhere('users.deactivated_at', '>', $fin))
            ->get(['users.*'])
            ->groupBy('barberia_id')
            ->map(fn ($barberos) => $barberos->sum(fn ($barbero) => $comisionCalculator->calcular($barbero, $inicio, $fin)));

        $comparativa = $barberias->map(function ($barberia) use ($facturacionPorBarberia, $gastosPorBarberia, $sueldosPorBarberia) {
            $facturado = (float) ($facturacionPorBarberia->get($barberia->id)->total ?? 0);
            $gastos = (float) ($gastosPorBarberia->get($barberia->id)->total ?? 0);
            $sueldos = (float) ($sueldosPorBarberia->get($barberia->id) ?? 0);

            return [
                'id' => $barberia->id,
                'name' => $barberia->name,
                'total' => $facturado,
                'cantidad' => (int) ($facturacionPorBarberia->get($barberia->id)->cantidad ?? 0),
                'sueldos' => $sueldos,
                'gastos' => $gastos,
                'neto' => $facturado - $sueldos - $gastos,
            ];
        })->sortByDesc('total')->values();

        return Inertia::render('Owner/Barberias/Consolidado', [
            'period' => ['month' => $inicio->format('Y-m')],
            'totalFacturado' => (float) $comparativa->sum('total'),
            'totalCortes' => (int) $comparativa->sum('cantidad'),
            'totalSueldos' => (float) $comparativa->sum('sueldos'),
            'totalGastos' => (float) $comparativa->sum('gastos'),
            'totalNeto' => (float) $comparativa->sum('neto'),
            'comparativa' => $comparativa,
        ]);
    }
}
