<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\ResolvesPeriod;
use App\Http\Controllers\Controller;
use App\Models\Barberia;
use App\Models\Corte;
use App\Models\Gasto;
use App\Models\GastoRegistro;
use App\Models\User;
use App\Services\ComisionCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanzasController extends Controller
{
    use ResolvesPeriod;

    public function index(Request $request, Barberia $barberia, ComisionCalculator $comisionCalculator): Response
    {
        $inicio = $this->resolvePeriod($request);
        $fin = $inicio->copy()->endOfMonth();

        $totalFacturado = (float) Corte::where('barberia_id', $barberia->id)
            ->whereBetween('performed_at', [$inicio->toDateString(), $fin->toDateString()])
            ->sum('price');

        // Un barbero cuenta para el sueldo de este período si estaba activo en
        // algún momento durante [$inicio, $fin], sin importar su estado actual:
        // activo hoy, o desactivado después de que terminó este período.
        $barberos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('created_at', '<=', $fin)
            ->where(fn ($q) => $q->where('active', true)->orWhere('deactivated_at', '>', $fin))
            ->orderBy('name')
            ->get();

        $sueldosPorBarbero = $barberos->map(fn ($barbero) => [
            'id'             => $barbero->id,
            'name'           => $barbero->name,
            'total'          => $comisionCalculator->calcular($barbero, $inicio, $fin),
            'salary_type'    => $barbero->salary_type,
            'salary_amount'  => $barbero->salary_amount !== null ? (float) $barbero->salary_amount : null,
            'commission_pct' => $barbero->commission_pct !== null ? (float) $barbero->commission_pct : null,
        ])->sortByDesc('total')->values();

        $totalSueldos = (float) $sueldosPorBarbero->sum('total');

        $sueldosPorBarbero = $sueldosPorBarbero->map(fn ($fila) => [
            ...$fila,
            'pct' => $totalSueldos > 0 ? round(($fila['total'] / $totalSueldos) * 100, 1) : 0,
        ]);

        $totalGastos = (float) GastoRegistro::where('barberia_id', $barberia->id)
            ->where('month', $inicio->toDateString())
            ->where('is_deleted_for_month', false)
            ->sum('amount');

        // Solo días con al menos un corte cargado; no es un toggle de vista
        // diaria (sueldos y gastos siguen siendo mensuales), es el desglose
        // día a día de la facturación ya incluida en $totalFacturado.
        $porDia = Corte::where('barberia_id', $barberia->id)
            ->whereBetween('performed_at', [$inicio->toDateString(), $fin->toDateString()])
            ->selectRaw('performed_at as date, SUM(price) as total, COUNT(*) as cantidad')
            ->groupBy('performed_at')
            ->orderByDesc('performed_at')
            ->get()
            ->map(fn ($fila) => [
                'date' => $fila->date,
                'total' => (float) $fila->total,
                'cantidad' => (int) $fila->cantidad,
            ]);

        $gastos = Gasto::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->with(['registros' => fn ($q) => $q->where('month', $inicio->toDateString())])
            ->get()
            ->map(function ($gasto) {
                $registro = $gasto->registros->first();

                return [
                    'id'           => $gasto->id,
                    'name'         => $gasto->name,
                    'amount'       => (float) $gasto->amount,
                    'type'         => $gasto->type,
                    'is_recurring' => $gasto->is_recurring,
                    'registro'     => $registro ? [
                        'id'                    => $registro->id,
                        'amount'                => (float) $registro->amount,
                        'is_deleted_for_month'  => $registro->is_deleted_for_month,
                    ] : null,
                ];
            });

        return Inertia::render('Owner/Barberias/Finanzas', [
            'period'            => ['month' => $inicio->format('Y-m')],
            'totalFacturado'    => $totalFacturado,
            'totalSueldos'      => $totalSueldos,
            'totalGastos'       => $totalGastos,
            'neto'              => $totalFacturado - $totalSueldos - $totalGastos,
            'sueldosPorBarbero' => $sueldosPorBarbero,
            'gastos'            => $gastos,
            'porDia'            => $porDia,
        ]);
    }
}
