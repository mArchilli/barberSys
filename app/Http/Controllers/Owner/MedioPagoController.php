<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreMedioPagoRequest;
use App\Http\Requests\Owner\UpdateMedioPagoRequest;
use App\Models\Barberia;
use App\Models\MedioPago;
use Inertia\Inertia;
use Inertia\Response;

class MedioPagoController extends Controller
{
    public function index(Barberia $barberia): Response
    {
        $mediosPago = MedioPago::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Owner/MediosPago/Index', [
            'mediosPago' => $mediosPago,
        ]);
    }

    public function create(Barberia $barberia): Response
    {
        return Inertia::render('Owner/MediosPago/Create');
    }

    public function store(StoreMedioPagoRequest $request, Barberia $barberia)
    {
        MedioPago::create([
            'barberia_id' => $barberia->id,
            'name'        => $request->name,
        ]);

        return redirect()->route('owner.barberias.medios-pago.index', $barberia->id);
    }

    public function edit(Barberia $barberia, MedioPago $medioPago): Response
    {
        $this->authorizeMedioPago($medioPago, $barberia);

        return Inertia::render('Owner/MediosPago/Edit', [
            'medioPago' => $medioPago->only(['id', 'name', 'active']),
        ]);
    }

    public function update(UpdateMedioPagoRequest $request, Barberia $barberia, MedioPago $medioPago)
    {
        $this->authorizeMedioPago($medioPago, $barberia);

        $medioPago->update([
            'name'   => $request->name,
            'active' => $request->active,
        ]);

        return redirect()->route('owner.barberias.medios-pago.index', $barberia->id);
    }

    public function deactivate(Barberia $barberia, MedioPago $medioPago)
    {
        $this->authorizeMedioPago($medioPago, $barberia);
        $medioPago->update(['active' => false]);

        return redirect()->route('owner.barberias.medios-pago.index', $barberia->id);
    }

    private function authorizeMedioPago(MedioPago $medioPago, Barberia $barberia): void
    {
        if ($medioPago->barberia_id !== $barberia->id) {
            abort(403);
        }
    }
}
