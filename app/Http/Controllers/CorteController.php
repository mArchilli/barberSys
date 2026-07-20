<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesBarberiaContext;
use App\Http\Requests\Owner\UpdateCorteRequest;
use App\Http\Requests\StoreCorteRequest;
use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->deUnDiaPorBarbero($user->id)
            ->with(['servicio:id,name', 'cliente:id,name', 'medioPago:id,name'])
            ->latest('id')
            ->get(['id', 'servicio_id', 'cliente_id', 'medio_pago_id', 'price', 'performed_at']);

        $page = $user->isBarber() ? 'Barber/Cortes/Index' : 'Owner/Cortes/Index';

        return Inertia::render($page, [
            'servicios' => $servicios,
            'mediosPago' => $mediosPago,
            'cortesHoy' => $cortesHoy,
            'routes' => [
                'store' => $user->isBarber()
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

        $servicio = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->servicio_id);
        $medioPago = MedioPago::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->medio_pago_id);

        DB::transaction(function () use ($request, $barberia, $user, $servicio, $medioPago) {
            if ($request->filled('cliente_id')) {
                $cliente = Cliente::where('barberia_id', $barberia->id)
                    ->where('active', true)
                    ->findOrFail($request->cliente_id);

                $contactoFaltante = [];

                if (blank($cliente->phone) && $request->filled('cliente_phone')) {
                    $contactoFaltante['phone'] = $request->cliente_phone;
                }

                if (blank($cliente->email) && $request->filled('cliente_email')) {
                    $contactoFaltante['email'] = $request->cliente_email;
                }

                if ($contactoFaltante !== []) {
                    $cliente->update($contactoFaltante);
                }
            } else {
                $cliente = Cliente::create([
                    'barberia_id' => $barberia->id,
                    'name' => $request->cliente_nombre,
                    'phone' => $request->cliente_phone,
                    'email' => $request->cliente_email,
                ]);
            }

            Corte::create([
                'barberia_id' => $barberia->id,
                'barbero_id' => $user->id,
                'servicio_id' => $servicio->id,
                'cliente_id' => $cliente->id,
                'medio_pago_id' => $medioPago->id,
                'price' => $request->price,
                'performed_at' => $request->performed_at,
            ]);
        });

        if ($request->boolean('quick_entry')) {
            return back()->with('success', 'Corte cargado correctamente.');
        }

        return $user->isBarber()
            ? redirect()->route('barber.cortes.index')->with('success', 'Corte cargado correctamente.')
            : redirect()->route('owner.barberias.cortes.index', $barberia->id)->with('success', 'Corte cargado correctamente.');
    }

    // Este controller es compartido entre owner y barber (index/store), pero
    // update() es exclusivamente una corrección de conciliación de caja: el
    // owner ajusta un corte que no necesariamente cargó él. No es una
    // capacidad general de "editar mi propio corte" para el barbero, así que
    // se valida el rol explícitamente en vez de confiar solo en el middleware
    // de la ruta (que hoy la registra únicamente bajo el grupo owner).
    public function update(UpdateCorteRequest $request, Barberia $barberia, Corte $corte): RedirectResponse
    {
        abort_unless($request->user()->isOwner(), 403);
        abort_if($corte->barberia_id !== $barberia->id, 403);

        $servicio = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->servicio_id);
        $cliente = Cliente::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->cliente_id);
        $medioPago = MedioPago::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->medio_pago_id);

        $corte->update([
            'servicio_id' => $servicio->id,
            'cliente_id' => $cliente->id,
            'medio_pago_id' => $medioPago->id,
            'price' => $request->price,
        ]);

        return back()->with('success', 'Corte corregido correctamente.');
    }
}
