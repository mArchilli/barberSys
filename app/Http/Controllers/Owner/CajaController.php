<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\ResolvesDay;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\CerrarCajaRequest;
use App\Http\Requests\Owner\ReabrirCajaRequest;
use App\Models\Barberia;
use App\Models\CajaCierre;
use App\Models\CajaCierreDetalle;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CajaController extends Controller
{
    use ResolvesDay;

    public function index(Request $request, Barberia $barberia): Response
    {
        $day = $this->resolveDay($request);
        $dayIso = $day->toDateString();
        $hoy = now()->startOfDay()->toDateString();

        $mediosPago = MedioPago::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $servicios = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price']);

        $movimientos = Corte::where('barberia_id', $barberia->id)
            ->whereDate('performed_at', $dayIso)
            ->with(['servicio:id,name', 'cliente:id,name', 'medioPago:id,name'])
            ->orderByDesc('id')
            ->get(['id', 'servicio_id', 'cliente_id', 'medio_pago_id', 'price', 'performed_at']);

        $expectedPorMedio = $this->expectedPorMedio($barberia, $dayIso);

        $cierre = CajaCierre::where('barberia_id', $barberia->id)
            ->where('day', $dayIso)
            ->with(['detalles.medioPago:id,name', 'closedBy:id,name'])
            ->first();

        // closed_at null representa "abierta": tanto una caja que nunca se
        // cerró como una reabierta (que sigue teniendo su fila y sus
        // detalles, para no perder los conteos ya cargados).
        $cerrado = $cierre !== null && $cierre->closed_at !== null;

        return Inertia::render('Owner/Caja/Index', [
            'day' => $dayIso,
            'esHoy' => $dayIso === $hoy,
            'resumen' => [
                'totalFacturado' => (float) $movimientos->sum('price'),
                'cantidadCortes' => $movimientos->count(),
            ],
            'movimientos' => $movimientos->map(fn (Corte $corte) => [
                'id' => $corte->id,
                'servicio' => $corte->servicio,
                'cliente' => $corte->cliente,
                'medioPago' => $corte->medioPago,
                'price' => (float) $corte->price,
            ]),
            'mediosPago' => $mediosPago->map(fn (MedioPago $medio) => [
                'id' => $medio->id,
                'name' => $medio->name,
                'expectedAmount' => (float) ($expectedPorMedio[$medio->id] ?? 0),
            ]),
            'servicios' => $servicios,
            'cerrado' => $cerrado,
            'cierre' => $cierre ? [
                'closedAt' => $cierre->closed_at,
                'closedByName' => $cierre->closedBy?->name,
                'detalles' => $cierre->detalles->map(fn (CajaCierreDetalle $detalle) => [
                    'medioPagoId' => $detalle->medio_pago_id,
                    'medioPagoName' => $detalle->medioPago->name,
                    'expectedAmount' => (float) $detalle->expected_amount,
                    'countedAmount' => $detalle->counted_amount === null ? null : (float) $detalle->counted_amount,
                    'difference' => $detalle->difference === null ? null : (float) $detalle->difference,
                ])->values(),
            ] : null,
            'routes' => [
                'index' => route('owner.barberias.caja.index', $barberia->id),
                'cerrar' => route('owner.barberias.caja.cerrar', $barberia->id),
                'reabrir' => route('owner.barberias.caja.reabrir', $barberia->id),
                'search' => route('owner.barberias.clientes.search', $barberia->id),
            ],
        ]);
    }

    public function cerrar(CerrarCajaRequest $request, Barberia $barberia): RedirectResponse
    {
        $dayIso = $request->validated('day');

        // Puede existir ya (de un cierre anterior reabierto): en ese caso se
        // actualiza en el mismo lugar en vez de crear una fila nueva, así los
        // detalles conservan su vínculo con caja_cierre_id.
        $cajaCierre = CajaCierre::where('barberia_id', $barberia->id)
            ->where('day', $dayIso)
            ->first();

        if ($cajaCierre && $cajaCierre->closed_at !== null) {
            return back()->with('error', 'La caja de ese día ya está cerrada.');
        }

        $mediosPago = MedioPago::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->get(['id']);

        $expectedPorMedio = $this->expectedPorMedio($barberia, $dayIso);
        $conteos = $request->validated('conteos') ?? [];

        DB::transaction(function () use ($barberia, $dayIso, $mediosPago, $expectedPorMedio, $conteos, &$cajaCierre) {
            if ($cajaCierre) {
                $cajaCierre->update([
                    'closed_by' => Auth::id(),
                    'closed_at' => now(),
                ]);
            } else {
                $cajaCierre = CajaCierre::create([
                    'barberia_id' => $barberia->id,
                    'day' => $dayIso,
                    'closed_by' => Auth::id(),
                    'closed_at' => now(),
                ]);
            }

            foreach ($mediosPago as $medio) {
                $expected = (float) ($expectedPorMedio[$medio->id] ?? 0);
                $countedRaw = $conteos[$medio->id] ?? null;
                $counted = ($countedRaw === null || $countedRaw === '') ? null : (float) $countedRaw;

                CajaCierreDetalle::updateOrCreate(
                    ['caja_cierre_id' => $cajaCierre->id, 'medio_pago_id' => $medio->id],
                    [
                        'expected_amount' => $expected,
                        'counted_amount' => $counted,
                        'difference' => $counted === null ? null : round($counted - $expected, 2),
                    ]
                );
            }
        });

        return redirect()
            ->route('owner.barberias.caja.index', ['barberia' => $barberia->id, 'day' => $dayIso])
            ->with('success', 'Caja cerrada correctamente.');
    }

    // Reabrir solo limpia closed_by/closed_at: la fila y sus detalles quedan
    // intactos para que el owner no tenga que volver a tipear los conteos ya
    // cargados si solo necesita corregir un corte puntual. El siguiente
    // cerrar() reutiliza esta misma fila (ver arriba).
    public function reabrir(ReabrirCajaRequest $request, Barberia $barberia): RedirectResponse
    {
        $dayIso = $request->validated('day');

        $cierre = CajaCierre::where('barberia_id', $barberia->id)
            ->where('day', $dayIso)
            ->first();

        abort_if(! $cierre || $cierre->closed_at === null, 404);

        $cierre->update([
            'closed_by' => null,
            'closed_at' => null,
        ]);

        return redirect()
            ->route('owner.barberias.caja.index', ['barberia' => $barberia->id, 'day' => $dayIso])
            ->with('success', 'Caja reabierta. Los conteos que ya cargaste siguen ahí — corregí lo que haga falta y volvé a cerrar cuando quieras.');
    }

    private function expectedPorMedio(Barberia $barberia, string $dayIso)
    {
        return Corte::where('cortes.barberia_id', $barberia->id)
            ->whereDate('cortes.performed_at', $dayIso)
            ->join('medios_pago', 'medios_pago.id', '=', 'cortes.medio_pago_id')
            ->selectRaw('medios_pago.id as medio_pago_id, SUM(cortes.price) as total')
            ->groupBy('medios_pago.id')
            ->pluck('total', 'medio_pago_id');
    }
}
