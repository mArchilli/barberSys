<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreMedioPagoRequest;
use App\Http\Requests\Owner\UpdateMedioPagoRequest;
use App\Models\MedioPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MedioPagoController extends Controller
{
    public function index(Request $request): Response
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);
        $selectedBarberiaId = $this->resolveBarberiaId($request, $barberias);

        $mediosPago = $selectedBarberiaId
            ? MedioPago::where('barberia_id', $selectedBarberiaId)
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'barberia_id', 'name'])
            : collect();

        return Inertia::render('Owner/MediosPago/Index', [
            'mediosPago'         => $mediosPago,
            'barberias'          => $barberias,
            'selectedBarberiaId' => $selectedBarberiaId,
        ]);
    }

    public function create(Request $request): Response
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);
        $selectedBarberiaId = $this->resolveBarberiaId($request, $barberias);

        return Inertia::render('Owner/MediosPago/Create', [
            'barberias'          => $barberias,
            'selectedBarberiaId' => $selectedBarberiaId,
        ]);
    }

    public function store(StoreMedioPagoRequest $request)
    {
        $medioPago = MedioPago::create($request->validated());

        return redirect()->route('owner.medios-pago.index', ['barberia_id' => $medioPago->barberia_id]);
    }

    public function edit(MedioPago $medioPago): Response
    {
        $this->authorizeMedioPago($medioPago);

        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);

        return Inertia::render('Owner/MediosPago/Edit', [
            'medioPago' => $medioPago->only(['id', 'barberia_id', 'name', 'active']),
            'barberias' => $barberias,
        ]);
    }

    public function update(UpdateMedioPagoRequest $request, MedioPago $medioPago)
    {
        $this->authorizeMedioPago($medioPago);
        $medioPago->update($request->validated());

        return redirect()->route('owner.medios-pago.index', ['barberia_id' => $medioPago->barberia_id]);
    }

    public function deactivate(MedioPago $medioPago)
    {
        $this->authorizeMedioPago($medioPago);
        $medioPago->update(['active' => false]);

        return redirect()->route('owner.medios-pago.index', ['barberia_id' => $medioPago->barberia_id]);
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

    private function authorizeMedioPago(MedioPago $medioPago): void
    {
        $barberiaIds = Auth::user()->barberias()->pluck('id');

        if (! $barberiaIds->contains($medioPago->barberia_id)) {
            abort(403);
        }
    }
}
