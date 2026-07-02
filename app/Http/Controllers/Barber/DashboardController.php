<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Concerns\ResolvesPeriod;
use App\Http\Controllers\Controller;
use App\Models\Corte;
use App\Services\ComisionCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesPeriod;

    public function index(Request $request, ComisionCalculator $comisionCalculator): Response
    {
        $user = $request->user();
        $inicio = $this->resolvePeriod($request);
        $fin = $inicio->copy()->endOfMonth();

        // El Global Scope ya limita a la barbería del barbero; acá además
        // restringimos a sus propios cortes, nunca los de otros barberos.
        $baseQuery = fn () => Corte::where('cortes.barbero_id', $user->id)
            ->whereBetween('cortes.performed_at', [$inicio->toDateString(), $fin->toDateString()]);

        $totalFacturado = (float) $baseQuery()->sum('cortes.price');
        $totalCortes = (int) $baseQuery()->count();

        $porServicio = $baseQuery()
            ->join('servicios', 'servicios.id', '=', 'cortes.servicio_id')
            ->selectRaw('servicios.id as id, servicios.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('servicios.id', 'servicios.name')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('Barber/Dashboard', [
            'period' => ['month' => $inicio->format('Y-m')],
            'totalFacturado' => $totalFacturado,
            'totalCortes' => $totalCortes,
            'porServicio' => $porServicio->map(fn ($fila) => [
                'id' => $fila->id,
                'name' => $fila->name,
                'total' => (float) $fila->total,
                'cantidad' => (int) $fila->cantidad,
            ]),
            // Liquidación estimada propia únicamente: nunca se exponen datos
            // de otros barberos, gastos o neto de la barbería a este rol.
            'liquidacion' => [
                'salaryType' => $user->salary_type,
                'monto' => $comisionCalculator->calcular($user, $inicio, $fin),
            ],
        ]);
    }
}
