<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\ResolvesDay;
use App\Http\Controllers\Concerns\ResolvesPeriod;
use App\Http\Controllers\Controller;
use App\Models\Barberia;
use App\Models\Corte;
use App\Models\GastoRegistro;
use App\Models\User;
use App\Services\ComisionCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesPeriod, ResolvesDay;

    public function index(Request $request, Barberia $barberia, ComisionCalculator $comisionCalculator): Response
    {
        $range = $this->resolvePeriodRange($request);
        $start = $range->start;
        $end = $range->end;

        $baseQuery = fn () => Corte::where('cortes.barberia_id', $barberia->id)
            ->whereBetween('cortes.performed_at', [$start->toDateString(), $end->toDateString()]);

        $totalFacturado = (float) $baseQuery()->sum('cortes.price');
        $totalCortes = (int) $baseQuery()->count();

        // Dotación actual de la barbería: no es un evento con fecha, así que no
        // se recalcula según el rango (mes o día) seleccionado.
        $barberosActivos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
            ->count();

        $rankingBarberosEnabled = $barberia->owner->subscription?->hasFeature('ranking_barberos') ?? false;

        $porBarbero = $rankingBarberosEnabled
            ? $baseQuery()
                ->join('users', 'users.id', '=', 'cortes.barbero_id')
                ->selectRaw('users.id as id, users.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('total')
                ->get()
            : collect();

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

        // "Mi rendimiento" solo se muestra si el owner alguna vez cargó cortes a su
        // propio nombre en esta barbería (fuera del período), para que la sección no
        // aparezca/desaparezca según el mes seleccionado.
        $ownerActuaComoBarbero = Corte::where('barberia_id', $barberia->id)
            ->where('barbero_id', $barberia->owner_id)
            ->exists();

        $miRendimiento = null;

        if ($ownerActuaComoBarbero) {
            $miFacturado = (float) $baseQuery()->where('cortes.barbero_id', $barberia->owner_id)->sum('cortes.price');
            $miCortes = (int) $baseQuery()->where('cortes.barbero_id', $barberia->owner_id)->count();

            $miRendimiento = [
                'totalFacturado' => $miFacturado,
                'totalCortes' => $miCortes,
                'pct' => $totalFacturado > 0 ? round(($miFacturado / $totalFacturado) * 100, 1) : 0,
            ];
        }

        // El Neto (y el mes que lo etiqueta) queda fijado al mes que contiene el
        // rango seleccionado, sin importar el toggle Mes/Día: no varía con la
        // vista diaria, igual que "Barberos activos".
        $mesContexto = $start->copy()->startOfMonth();
        $finMesContexto = $mesContexto->copy()->endOfMonth();

        $totalFacturadoMes = (float) Corte::where('barberia_id', $barberia->id)
            ->whereBetween('performed_at', [$mesContexto->toDateString(), $finMesContexto->toDateString()])
            ->sum('price');

        // Mismo cálculo que FinanzasController: facturación − sueldos − gastos.
        $barberos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('created_at', '<=', $finMesContexto)
            ->where(fn ($q) => $q->where('active', true)->orWhere('deactivated_at', '>', $finMesContexto))
            ->get();

        $totalSueldos = (float) $barberos->sum(fn ($barbero) => $comisionCalculator->calcular($barbero, $mesContexto, $finMesContexto));

        $totalGastos = (float) GastoRegistro::where('barberia_id', $barberia->id)
            ->where('month', $mesContexto->toDateString())
            ->where('is_deleted_for_month', false)
            ->sum('amount');

        $neto = $totalFacturadoMes - $totalSueldos - $totalGastos;

        return Inertia::render('Owner/Barberias/Dashboard', [
            'period' => [
                'mode' => $range->mode,
                'month' => $mesContexto->format('Y-m'),
                'day' => $range->mode === 'day' ? $start->format('Y-m-d') : null,
                'diaEsHoy' => $range->mode === 'day' ? $start->isToday() : false,
            ],
            'totalFacturado' => $totalFacturado,
            'totalCortes' => $totalCortes,
            'barberosActivos' => $barberosActivos,
            'rankingBarberosEnabled' => $rankingBarberosEnabled,
            'porBarbero' => $this->mapFilas($porBarbero, $totalFacturado),
            'porServicio' => $this->mapFilas($porServicio, $totalFacturado),
            'porMedioPago' => $this->mapFilas($porMedioPago, $totalFacturado),
            'miRendimiento' => $miRendimiento,
            'neto' => $neto,
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
