<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreServicioRequest;
use App\Http\Requests\Owner\UpdateServicioRequest;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ServicioController extends Controller
{
    public function index(Request $request): Response
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);
        $selectedBarberiaId = $this->resolveBarberiaId($request, $barberias);

        $servicios = $selectedBarberiaId
            ? Servicio::where('barberia_id', $selectedBarberiaId)
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'barberia_id', 'name', 'price'])
            : collect();

        return Inertia::render('Owner/Servicios/Index', [
            'servicios'          => $servicios,
            'barberias'          => $barberias,
            'selectedBarberiaId' => $selectedBarberiaId,
        ]);
    }

    public function create(Request $request): Response
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);
        $selectedBarberiaId = $this->resolveBarberiaId($request, $barberias);

        return Inertia::render('Owner/Servicios/Create', [
            'barberias'          => $barberias,
            'selectedBarberiaId' => $selectedBarberiaId,
        ]);
    }

    public function store(StoreServicioRequest $request)
    {
        $servicio = Servicio::create($request->validated());

        return redirect()->route('owner.servicios.index', ['barberia_id' => $servicio->barberia_id]);
    }

    public function edit(Servicio $servicio): Response
    {
        $this->authorizeServicio($servicio);

        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);

        return Inertia::render('Owner/Servicios/Edit', [
            'servicio'  => $servicio->only(['id', 'barberia_id', 'name', 'price', 'active']),
            'barberias' => $barberias,
        ]);
    }

    public function update(UpdateServicioRequest $request, Servicio $servicio)
    {
        $this->authorizeServicio($servicio);
        $servicio->update($request->validated());

        return redirect()->route('owner.servicios.index', ['barberia_id' => $servicio->barberia_id]);
    }

    public function deactivate(Servicio $servicio)
    {
        $this->authorizeServicio($servicio);
        $servicio->update(['active' => false]);

        return redirect()->route('owner.servicios.index', ['barberia_id' => $servicio->barberia_id]);
    }

    private function resolveBarberiaId(Request $request, $barberias): ?int
    {
        if ($barberias->isEmpty()) {
            return null;
        }

        if ($barberias->count() === 1) {
            return $barberias->first()->id;
        }

        $id = (int) $request->query('barberia_id', 0);

        if ($id && $barberias->contains('id', $id)) {
            return $id;
        }

        return $barberias->first()->id;
    }

    private function authorizeServicio(Servicio $servicio): void
    {
        $barberiaIds = Auth::user()->barberias()->pluck('id');

        if (! $barberiaIds->contains($servicio->barberia_id)) {
            abort(403);
        }
    }
}
