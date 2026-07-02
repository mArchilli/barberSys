<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesBarberiaContext;
use App\Http\Requests\StoreCorteRequest;
use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CorteController extends Controller
{
    use ResolvesBarberiaContext;

    public function index(Request $request, ?Barberia $barberia = null): Response
    {
        $barberia = $this->resolveBarberia($request, $barberia);
        $user = $request->user();

        $servicios = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price']);

        $mediosPago = MedioPago::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $cortesHoy = Corte::where('barberia_id', $barberia->id)
            ->where('barbero_id', $user->id)
            ->whereDate('performed_at', now()->toDateString())
            ->with(['servicio:id,name', 'cliente:id,name', 'medioPago:id,name'])
            ->latest('id')
            ->get(['id', 'servicio_id', 'cliente_id', 'medio_pago_id', 'price', 'performed_at']);

        $page = $user->isBarber() ? 'Barber/Cortes/Index' : 'Owner/Cortes/Index';

        return Inertia::render($page, [
            'servicios'  => $servicios,
            'mediosPago' => $mediosPago,
            'cortesHoy'  => $cortesHoy,
            'routes'     => [
                'store'  => $user->isBarber()
                    ? route('barber.cortes.store')
                    : route('owner.barberias.cortes.store', $barberia->id),
                'search' => $user->isBarber()
                    ? route('barber.clientes.search')
                    : route('owner.barberias.clientes.search', $barberia->id),
            ],
        ]);
    }

    public function store(StoreCorteRequest $request, ?Barberia $barberia = null)
    {
        $barberia = $this->resolveBarberia($request, $barberia);
        $user = $request->user();

        $servicio = Servicio::where('barberia_id', $barberia->id)->findOrFail($request->servicio_id);
        $medioPago = MedioPago::where('barberia_id', $barberia->id)->findOrFail($request->medio_pago_id);

        if ($request->filled('cliente_id')) {
            $cliente = Cliente::where('barberia_id', $barberia->id)->findOrFail($request->cliente_id);
        } else {
            $cliente = Cliente::create([
                'barberia_id' => $barberia->id,
                'name'        => $request->cliente_nombre,
            ]);
        }

        Corte::create([
            'barberia_id'   => $barberia->id,
            'barbero_id'    => Auth::id(),
            'servicio_id'   => $servicio->id,
            'cliente_id'    => $cliente->id,
            'medio_pago_id' => $medioPago->id,
            'price'         => $request->price,
            'performed_at'  => $request->performed_at,
        ]);

        return $user->isBarber()
            ? redirect()->route('barber.cortes.index')->with('success', 'Corte cargado correctamente.')
            : redirect()->route('owner.barberias.cortes.index', $barberia->id)->with('success', 'Corte cargado correctamente.');
    }
}
