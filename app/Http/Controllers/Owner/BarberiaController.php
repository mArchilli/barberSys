<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreBarberiaRequest;
use App\Http\Requests\Owner\UpdateBarberiaRequest;
use App\Models\Barberia;
use App\Services\PlanLimitService;
use Illuminate\Support\Facades\Auth;
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

        return Inertia::render('Owner/Barberias/Index', [
            'barberias' => $barberias,
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
            'barberia' => $barberia->only(['id', 'name', 'address', 'active']),
        ]);
    }

    public function update(UpdateBarberiaRequest $request, Barberia $barberia)
    {
        $barberia->update([
            'name'    => $request->name,
            'address' => $request->address,
            'active'  => $request->active,
        ]);

        return redirect()->route('owner.barberias.index');
    }
}
