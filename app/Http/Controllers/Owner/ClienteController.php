<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\ResolvesBarberiaContext;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreClienteRequest;
use App\Http\Requests\Owner\UpdateClienteRequest;
use App\Models\Barberia;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    use ResolvesBarberiaContext;

    public function index(Barberia $barberia): Response
    {
        $clientes = Cliente::where('barberia_id', $barberia->id)
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'active']);

        return Inertia::render('Owner/Clientes/Index', [
            'clientes' => $clientes,
        ]);
    }

    public function store(StoreClienteRequest $request, Barberia $barberia)
    {
        $cliente = Cliente::create([
            'barberia_id' => $barberia->id,
            'name'        => $request->name,
            'phone'       => $request->phone,
        ]);

        if ($request->wantsJson()) {
            return response()->json($cliente->only(['id', 'name', 'phone']));
        }

        return redirect()
            ->route('owner.barberias.clientes.index', $barberia->id)
            ->with('success', 'Cliente creado correctamente.');
    }

    public function edit(Barberia $barberia, Cliente $cliente): Response
    {
        $this->authorizeCliente($cliente, $barberia);

        return Inertia::render('Owner/Clientes/Edit', [
            'cliente' => $cliente->only(['id', 'name', 'phone', 'active']),
        ]);
    }

    public function update(UpdateClienteRequest $request, Barberia $barberia, Cliente $cliente)
    {
        $this->authorizeCliente($cliente, $barberia);

        $cliente->update([
            'name'   => $request->name,
            'phone'  => $request->phone,
            'active' => $request->active,
        ]);

        return redirect()
            ->route('owner.barberias.clientes.index', $barberia->id)
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function deactivate(Barberia $barberia, Cliente $cliente)
    {
        $this->authorizeCliente($cliente, $barberia);
        $cliente->update(['active' => false]);

        return redirect()
            ->route('owner.barberias.clientes.index', $barberia->id)
            ->with('success', 'Cliente desactivado.');
    }

    public function search(Request $request, ?Barberia $barberia = null)
    {
        $barberia = $this->resolveBarberia($request, $barberia);

        $q = trim($request->string('q'));

        $clientes = Cliente::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->when($q !== '', fn($query) => $query->where('name', 'like', "%{$q}%"))
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name', 'phone']);

        return response()->json($clientes);
    }

    private function authorizeCliente(Cliente $cliente, Barberia $barberia): void
    {
        if ($cliente->barberia_id !== $barberia->id) {
            abort(403);
        }
    }
}
