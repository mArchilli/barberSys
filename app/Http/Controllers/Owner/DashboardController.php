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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesDay, ResolvesPeriod;

    public function index(Request $request, Barberia $barberia, ComisionCalculator $comisionCalculator): Response
    {
        $hoy = Carbon::today();
        $range = $this->resolvePeriodRange($request);
        $start = $range->start->copy()->startOfDay();
        $end = $range->end->copy()->endOfDay();

        // Los presets del período actual muestran datos acumulados hasta hoy,
        // sin dibujar días futuros vacíos en la evolución.
        if ($end->isAfter($hoy->copy()->endOfDay())) {
            $end = $hoy->copy()->endOfDay();
        }

        if ($start->isAfter($end)) {
            $start = $hoy->copy();
            $end = $hoy->copy()->endOfDay();
            $range->mode = 'day';
        }

        $baseQuery = fn () => Corte::where('cortes.barberia_id', $barberia->id)
            ->whereDate('cortes.performed_at', '>=', $start->toDateString())
            ->whereDate('cortes.performed_at', '<=', $end->toDateString());

        $totalFacturado = (float) $baseQuery()->sum('cortes.price');
        $totalCortes = (int) $baseQuery()->count();
        $ticketPromedio = $totalCortes > 0 ? round($totalFacturado / $totalCortes, 2) : 0;

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
                ->limit(5)
                ->get()
            : collect();

        $porServicio = $baseQuery()
            ->join('servicios', 'servicios.id', '=', 'cortes.servicio_id')
            ->selectRaw('servicios.id as id, servicios.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('servicios.id', 'servicios.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $porMedioPago = $baseQuery()
            ->join('medios_pago', 'medios_pago.id', '=', 'cortes.medio_pago_id')
            ->selectRaw('medios_pago.id as id, medios_pago.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('medios_pago.id', 'medios_pago.name')
            ->orderByDesc('total')
            ->get();

        $mesGestion = $start->copy()->startOfMonth();
        $finMesGestion = $mesGestion->copy()->endOfMonth();

        $totalFacturadoMes = (float) Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', '>=', $mesGestion->toDateString())
            ->whereDate('performed_at', '<=', $finMesGestion->toDateString())
            ->sum('price');

        $barberosDelMes = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('created_at', '<=', $finMesGestion)
            ->where(function ($query) use ($mesGestion) {
                $query->whereNull('deactivated_at')
                    ->orWhere('deactivated_at', '>=', $mesGestion);
            })
            ->get();

        $totalSueldos = (float) $barberosDelMes
            ->sum(fn ($barbero) => $comisionCalculator->calcular($barbero, $mesGestion, $finMesGestion));

        $totalGastos = (float) GastoRegistro::where('barberia_id', $barberia->id)
            ->where('month', $mesGestion->toDateString())
            ->where('is_deleted_for_month', false)
            ->sum('amount');

        $netoEstimado = $totalFacturadoMes - $totalSueldos - $totalGastos;

        $facturacionHoy = (float) Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', $hoy->toDateString())
            ->sum('price');

        $cortesHoy = (int) Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', $hoy->toDateString())
            ->count();

        $porMedioPagoHoy = Corte::where('cortes.barberia_id', $barberia->id)
            ->whereDate('cortes.performed_at', $hoy->toDateString())
            ->join('medios_pago', 'medios_pago.id', '=', 'cortes.medio_pago_id')
            ->selectRaw('medios_pago.id as id, medios_pago.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('medios_pago.id', 'medios_pago.name')
            ->orderByDesc('total')
            ->get();

        $ultimoMovimientoHoy = Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', $hoy->toDateString())
            ->latest('created_at')
            ->value('created_at');

        $actividadReciente = Corte::where('barberia_id', $barberia->id)
            ->with([
                'barbero:id,name',
                'servicio:id,name',
                'cliente:id,name',
                'medioPago:id,name',
            ])
            ->orderByDesc('performed_at')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(fn (Corte $corte) => [
                'id' => $corte->id,
                'date' => $corte->performed_at->toDateString(),
                'createdAt' => $corte->created_at?->toIso8601String(),
                'barbero' => $corte->barbero?->name ?? 'Sin barbero',
                'servicio' => $corte->servicio?->name ?? 'Servicio eliminado',
                'cliente' => $corte->cliente?->name ?? 'Sin cliente',
                'medioPago' => $corte->medioPago?->name ?? 'Sin medio de pago',
                'total' => (float) $corte->price,
            ])
            ->all();

        $diasPeriodo = (int) $start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay()) + 1;
        $finPeriodoAnterior = $start->copy()->subDay()->endOfDay();
        $inicioPeriodoAnterior = $finPeriodoAnterior->copy()->subDays($diasPeriodo - 1)->startOfDay();
        $facturacionPeriodoAnterior = (float) Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', '>=', $inicioPeriodoAnterior->toDateString())
            ->whereDate('performed_at', '<=', $finPeriodoAnterior->toDateString())
            ->sum('price');

        $alertas = $this->buildAlerts(
            totalFacturado: $totalFacturado,
            totalCortes: $totalCortes,
            facturacionAnterior: $facturacionPeriodoAnterior,
            cortesHoy: $cortesHoy,
            netoEstimado: $netoEstimado,
            barberosActivos: $barberosActivos,
        );

        $totalPorMedioPagoHoy = (float) $porMedioPagoHoy->sum('total');

        return Inertia::render('Owner/Barberias/Dashboard', [
            'period' => [
                'mode' => $range->mode,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
                'today' => $hoy->toDateString(),
                'currentMonth' => $hoy->format('Y-m'),
                'managementMonth' => $mesGestion->format('Y-m'),
            ],
            'kpis' => [
                'facturacion' => $totalFacturado,
                'neto' => $netoEstimado,
                'cortes' => $totalCortes,
                'ticketPromedio' => $ticketPromedio,
                'hoy' => $facturacionHoy,
            ],
            'evolucionFacturacion' => $this->buildEvolution($barberia, $start, $end),
            'porMedioPago' => $this->mapFilas($porMedioPago, $totalFacturado),
            'rankingBarberosEnabled' => $rankingBarberosEnabled,
            'porBarbero' => $this->mapFilas($porBarbero, $totalFacturado),
            'porServicio' => $this->mapFilas($porServicio, $totalFacturado),
            'cierreCaja' => [
                'total' => $facturacionHoy,
                'cortes' => $cortesHoy,
                'ticketPromedio' => $cortesHoy > 0 ? round($facturacionHoy / $cortesHoy, 2) : 0,
                'ultimoMovimientoAt' => $ultimoMovimientoHoy
                    ? Carbon::parse($ultimoMovimientoHoy)->toIso8601String()
                    : null,
                'mediosPago' => $this->mapFilas($porMedioPagoHoy, $totalPorMedioPagoHoy),
            ],
            'gestion' => [
                'month' => $mesGestion->format('Y-m'),
                'facturacion' => $totalFacturadoMes,
                'sueldos' => $totalSueldos,
                'gastos' => $totalGastos,
                'neto' => $netoEstimado,
            ],
            'actividadReciente' => $actividadReciente,
            'alertas' => $alertas,
        ]);
    }

    private function buildEvolution(Barberia $barberia, Carbon $start, Carbon $end): array
    {
        $dailyRows = Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', '>=', $start->toDateString())
            ->whereDate('performed_at', '<=', $end->toDateString())
            ->selectRaw('performed_at as date, SUM(price) as total, COUNT(*) as cantidad')
            ->groupBy('performed_at')
            ->orderBy('performed_at')
            ->get()
            ->mapWithKeys(fn ($row) => [substr((string) $row->date, 0, 10) => $row]);

        $days = (int) $start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay()) + 1;
        $granularity = $days <= 31 ? 'day' : ($days <= 180 ? 'week' : 'month');
        $buckets = [];

        if ($granularity === 'day') {
            for ($cursor = $start->copy()->startOfDay(); $cursor->lte($end); $cursor->addDay()) {
                $buckets[] = $this->evolutionBucket($dailyRows, $cursor, $cursor);
            }
        } elseif ($granularity === 'week') {
            for ($cursor = $start->copy()->startOfDay(); $cursor->lte($end); $cursor->addDays(7)) {
                $bucketEnd = $cursor->copy()->addDays(6);

                if ($bucketEnd->gt($end)) {
                    $bucketEnd = $end->copy();
                }

                $buckets[] = $this->evolutionBucket($dailyRows, $cursor, $bucketEnd);
            }
        } else {
            for ($cursor = $start->copy()->startOfMonth(); $cursor->lte($end); $cursor->addMonth()) {
                $bucketStart = $cursor->copy()->startOfMonth();
                $bucketEnd = $cursor->copy()->endOfMonth();

                if ($bucketStart->lt($start)) {
                    $bucketStart = $start->copy();
                }

                if ($bucketEnd->gt($end)) {
                    $bucketEnd = $end->copy();
                }

                $buckets[] = $this->evolutionBucket($dailyRows, $bucketStart, $bucketEnd);
            }
        }

        return [
            'granularity' => $granularity,
            'items' => $buckets,
        ];
    }

    private function evolutionBucket(Collection $dailyRows, Carbon $start, Carbon $end): array
    {
        $total = 0.0;
        $cantidad = 0;

        foreach ($dailyRows as $date => $row) {
            if ($date >= $start->toDateString() && $date <= $end->toDateString()) {
                $total += (float) $row->total;
                $cantidad += (int) $row->cantidad;
            }
        }

        return [
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'total' => $total,
            'cantidad' => $cantidad,
        ];
    }

    private function buildAlerts(
        float $totalFacturado,
        int $totalCortes,
        float $facturacionAnterior,
        int $cortesHoy,
        float $netoEstimado,
        int $barberosActivos,
    ): array {
        $alerts = [];

        if ($netoEstimado < 0) {
            $alerts[] = [
                'type' => 'danger',
                'title' => 'Neto estimado negativo',
                'message' => 'Los sueldos y gastos del mes superan la facturación acumulada.',
            ];
        }

        if ($totalCortes === 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Sin actividad en el período',
                'message' => 'Todavía no hay cortes cargados para el filtro seleccionado.',
            ];
        } elseif ($facturacionAnterior > 0) {
            $variacion = round((($totalFacturado - $facturacionAnterior) / $facturacionAnterior) * 100, 1);

            if ($variacion <= -20) {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => 'Facturación en descenso',
                    'message' => "La facturación bajó {$this->absolutePercentage($variacion)}% frente al período anterior comparable.",
                ];
            } elseif ($variacion >= 20) {
                $alerts[] = [
                    'type' => 'success',
                    'title' => 'Buen ritmo de facturación',
                    'message' => "La facturación creció {$this->absolutePercentage($variacion)}% frente al período anterior comparable.",
                ];
            }
        }

        if ($cortesHoy === 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Caja sin movimientos hoy',
                'message' => 'Aún no se registraron cortes en la jornada actual.',
            ];
        }

        if ($barberosActivos === 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Sin barberos activos',
                'message' => 'No hay miembros activos del equipo asignados a esta barbería.',
            ];
        }

        if ($alerts === []) {
            $alerts[] = [
                'type' => 'success',
                'title' => 'Todo en orden',
                'message' => 'No detectamos desvíos importantes en la operación actual.',
            ];
        }

        return $alerts;
    }

    private function absolutePercentage(float $value): string
    {
        return number_format(abs($value), 1, ',', '.');
    }

    private function mapFilas(Collection $filas, float $totalFacturado): array
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
