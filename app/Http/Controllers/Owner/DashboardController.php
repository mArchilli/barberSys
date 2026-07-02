<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\ResolvesPeriod;
use App\Http\Controllers\Controller;
use App\Models\Barberia;
use App\Models\Corte;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesPeriod;

    public function index(Request $request, Barberia $barberia): Response
    {
        $inicio = $this->resolvePeriod($request);
        $fin = $inicio->copy()->endOfMonth();

        $baseQuery = fn () => Corte::where('cortes.barberia_id', $barberia->id)
            ->whereBetween('cortes.performed_at', [$inicio->toDateString(), $fin->toDateString()]);

        $totalFacturado = (float) $baseQuery()->sum('cortes.price');
        $totalCortes = (int) $baseQuery()->count();

        $porBarbero = $baseQuery()
            ->join('users', 'users.id', '=', 'cortes.barbero_id')
            ->selectRaw('users.id as id, users.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->get();

        $porServicio = $baseQuery()
            ->join('servicios', 'servicios.id', '=', 'cortes.servicio_id')
            ->selectRaw('servicios.id as id, servicios.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('servicios.id', 'servicios.name')
            ->orderByDesc('total')
            ->get();

        $porMedioPago = $baseQuery()
            ->join('medios_pago', 'medios_pago.id', '=', 'cortes.medio_pago_id')
            ->selectRaw('medios_pago.id as id, medios_pago.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('medios_pago.id', 'medios_pago.name')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('Owner/Barberias/Dashboard', [
            'period' => ['month' => $inicio->format('Y-m')],
            'totalFacturado' => $totalFacturado,
            'totalCortes' => $totalCortes,
            'porBarbero' => $this->mapFilas($porBarbero, $totalFacturado),
            'porServicio' => $this->mapFilas($porServicio, $totalFacturado),
            'porMedioPago' => $this->mapFilas($porMedioPago, $totalFacturado),
        ]);
    }

    private function mapFilas(\Illuminate\Support\Collection $filas, float $totalFacturado): array
    {
        return $filas->map(fn ($fila) => [
            'id' => $fila->id,
            'name' => $fila->name,
            'total' => (float) $fila->total,
            'cantidad' => (int) $fila->cantidad,
            'pct' => $totalFacturado > 0 ? round(((float) $fila->total / $totalFacturado) * 100, 1) : 0,
        ])->all();
    }
}
