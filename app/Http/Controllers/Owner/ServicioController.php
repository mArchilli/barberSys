<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreServicioRequest;
use App\Http\Requests\Owner\UpdateServicioRequest;
use App\Models\Barberia;
use App\Models\Servicio;
use Inertia\Inertia;
use Inertia\Response;

class ServicioController extends Controller
{
    public function index(Barberia $barberia): Response
    {
        $servicios = Servicio::where('barberia_id', $barberia->id)
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'active']);

        return Inertia::render('Owner/Servicios/Index', [
            'servicios' => $servicios,
        ]);
    }

    public function create(Barberia $barberia): Response
    {
        return Inertia::render('Owner/Servicios/Create');
    }

    public function store(StoreServicioRequest $request, Barberia $barberia)
    {
        Servicio::create([
            'barberia_id' => $barberia->id,
            'name'        => $request->name,
            'price'       => $request->price,
        ]);

        return redirect()->route('owner.barberias.servicios.index', $barberia->id);
    }

    public function edit(Barberia $barberia, Servicio $servicio): Response
    {
        $this->authorizeServicio($servicio, $barberia);

        return Inertia::render('Owner/Servicios/Edit', [
            'servicio' => $servicio->only(['id', 'name', 'price', 'active']),
        ]);
    }

    public function update(UpdateServicioRequest $request, Barberia $barberia, Servicio $servicio)
    {
        $this->authorizeServicio($servicio, $barberia);

        $servicio->update([
            'name'   => $request->name,
            'price'  => $request->price,
            'active' => $request->active,
        ]);

        return redirect()->route('owner.barberias.servicios.index', $barberia->id);
    }

    public function deactivate(Barberia $barberia, Servicio $servicio)
    {
        $this->authorizeServicio($servicio, $barberia);
        $servicio->update(['active' => false]);

        return redirect()->route('owner.barberias.servicios.index', $barberia->id);
    }

    private function authorizeServicio(Servicio $servicio, Barberia $barberia): void
    {
        if ($servicio->barberia_id !== $barberia->id) {
            abort(403);
        }
    }
}
