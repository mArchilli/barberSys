<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreBarberiaRequest;
use App\Http\Requests\Owner\UpdateBarberiaRequest;
use App\Models\Barberia;
use App\Services\PlanLimitService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BarberiaController extends Controller
{
    public function __construct(private PlanLimitService $planLimitService) {}

    public function index()
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name', 'address']);

        if ($barberias->count() === 1) {
            return redirect()->route('owner.barberias.dashboard', $barberias->first()->id);
        }

        $barberiasCerradas = $owner->barberias()->where('active', false)->orderByDesc('deactivated_at')->get(['id', 'name', 'address', 'deactivated_at']);

        return Inertia::render('Owner/Barberias/Index', [
            'barberias'         => $barberias,
            'barberiasCerradas' => $barberiasCerradas,
            'planLimit' => [
                'max'     => $this->planLimitService->maxBarberias($owner),
                'current' => $this->planLimitService->currentBarberias($owner),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Owner/Barberias/Create', [
            'canAdd' => $this->planLimitService->canAddBarberia(Auth::user()),
        ]);
    }

    public function store(StoreBarberiaRequest $request)
    {
        $barberia = Barberia::create([
            'owner_id' => Auth::id(),
            'name'     => $request->name,
            'address'  => $request->address,
        ]);

        return redirect()->route('owner.barberias.dashboard', $barberia->id);
    }

    public function edit(Barberia $barberia): Response
    {
        return Inertia::render('Owner/Barberias/Edit', [
            'barberia'            => $barberia->only(['id', 'name', 'address', 'active']),
            'activeBarberosCount' => $barberia->barbers()->where('active', true)->count(),
        ]);
    }

    public function update(UpdateBarberiaRequest $request, Barberia $barberia)
    {
        $barberia->update([
            'name'    => $request->name,
            'address' => $request->address,
        ]);

        return redirect()->route('owner.barberias.index');
    }

    public function deactivate(Barberia $barberia)
    {
        DB::transaction(function () use ($barberia) {
            $barberia->update(['active' => false, 'deactivated_at' => now()]);

            $barberia->barbers()
                ->where('role', 'barber')
                ->where('active', true)
                ->update(['active' => false, 'deactivated_at' => now()]);
        });

        return redirect()->route('owner.barberias.index')
            ->with('success', "Cerraste \"{$barberia->name}\". Podés reactivarla cuando quieras.");
    }

    public function reactivate(Barberia $barberia)
    {
        $owner = Auth::user();

        if (! $this->planLimitService->canAddBarberia($owner)) {
            return back()->withErrors([
                'plan_limit' => 'Ya alcanzaste el límite de barberías activas de tu plan. Cerrá otra barbería o actualizá tu plan para reactivar esta.',
            ]);
        }

        $barberia->update(['active' => true, 'deactivated_at' => null]);

        return redirect()->route('owner.barberias.dashboard', $barberia->id)
            ->with('success', "Reactivaste \"{$barberia->name}\".");
    }
}
