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

        $barberos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
            ->orderBy('name')
            ->get();

        $sueldosPorBarbero = $barberos->map(fn ($barbero) => [
            'id'    => $barbero->id,
            'name'  => $barbero->name,
            'total' => $comisionCalculator->calcular($barbero, $inicio, $fin),
        ])->sortByDesc('total')->values();

        $totalSueldos = (float) $sueldosPorBarbero->sum('total');

        $totalGastos = (float) GastoRegistro::where('barberia_id', $barberia->id)
            ->where('month', $inicio->toDateString())
            ->where('is_deleted_for_month', false)
            ->sum('amount');

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
        ]);
    }
}
