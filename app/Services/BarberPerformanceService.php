<?php

namespace App\Services;

use App\Models\Corte;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Cálculo de facturación/cortes históricos (o acotados a un período) de un
 * barbero puntual dentro de una barbería puntual, con sus rankings de
 * servicios y clientes frecuentes. Usado tanto para el perfil de un barbero
 * gestionado por el owner (BarberoController@show) como para la propia
 * actividad del owner-como-barbero (card "Mi rendimiento" del Dashboard y
 * MiRendimientoController).
 */
class BarberPerformanceService
{
    public function historico(int $barberoId, int $barberiaId): array
    {
        return $this->calcular($barberoId, $barberiaId);
    }

    public function porPeriodo(int $barberoId, int $barberiaId, Carbon $start, Carbon $end): array
    {
        return $this->calcular($barberoId, $barberiaId, $start, $end);
    }

    private function calcular(int $barberoId, int $barberiaId, ?Carbon $start = null, ?Carbon $end = null): array
    {
        $cortesQuery = function () use ($barberiaId, $barberoId, $start, $end) {
            $query = Corte::where('cortes.barberia_id', $barberiaId)->where('cortes.barbero_id', $barberoId);

            if ($start && $end) {
                $query->whereDate('cortes.performed_at', '>=', $start->toDateString())
                    ->whereDate('cortes.performed_at', '<=', $end->toDateString());
            }

            return $query;
        };

        $totalFacturado = (float) $cortesQuery()->sum('price');
        $totalCortes = (int) $cortesQuery()->count();
        $activoDesde = $cortesQuery()->min('performed_at');

        $porServicio = $cortesQuery()
            ->join('servicios', 'servicios.id', '=', 'cortes.servicio_id')
            ->selectRaw('servicios.id as id, servicios.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('servicios.id', 'servicios.name')
            ->orderByDesc('cantidad')
            ->get();

        $clientesFrecuentes = $cortesQuery()
            ->join('clientes', 'clientes.id', '=', 'cortes.cliente_id')
            ->selectRaw('clientes.id as id, clientes.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('clientes.id', 'clientes.name')
            ->orderByDesc('cantidad')
            ->limit(10)
            ->get();

        return [
            'totalFacturado' => $totalFacturado,
            'totalCortes' => $totalCortes,
            'activoDesde' => $activoDesde,
            'porServicio' => $this->mapPorCantidad($porServicio, $totalCortes),
            'clientesFrecuentes' => $this->mapPorCantidad($clientesFrecuentes, $totalCortes),
        ];
    }

    private function mapPorCantidad(Collection $filas, int $totalCortes): array
    {
        return $filas->map(fn ($fila) => [
            'id' => $fila->id,
            'name' => $fila->name,
            'total' => (float) $fila->total,
            'cantidad' => (int) $fila->cantidad,
            'pct' => $totalCortes > 0 ? round(($fila->cantidad / $totalCortes) * 100, 1) : 0,
        ])->all();
    }
}
