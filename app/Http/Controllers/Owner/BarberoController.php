<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreBarberoRequest;
use App\Http\Requests\Owner\UpdateBarberoRequest;
use App\Models\User;
use App\Services\PlanLimitService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BarberoController extends Controller
{
    public function __construct(private PlanLimitService $planLimitService) {}

    public function index(): Response
    {
        $owner = Auth::user();
        $barberiaIds = $owner->barberias()->pluck('id');

        $barberos = User::whereIn('barberia_id', $barberiaIds)
            ->where('role', 'barber')
            ->where('active', true)
            ->with('barberia')
            ->orderBy('name')
            ->get()
            ->map(fn (User $b) => [
                'id'             => $b->id,
                'name'           => $b->name,
                'email'          => $b->email,
                'phone'          => $b->phone,
                'salary_type'    => $b->salary_type,
                'salary_amount'  => $b->salary_amount,
                'commission_pct' => $b->commission_pct,
                'barberia'       => ['id' => $b->barberia->id, 'name' => $b->barberia->name],
            ]);

        return Inertia::render('Owner/Barberos/Index', [
            'barberos'  => $barberos,
            'planLimit' => [
                'max'     => $this->planLimitService->maxBarberos($owner),
                'current' => $this->planLimitService->currentBarberos($owner),
            ],
        ]);
    }

    public function create(): Response
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);

        return Inertia::render('Owner/Barberos/Create', [
            'barberias' => $barberias,
            'canAdd'    => $this->planLimitService->canAddBarbero($owner),
        ]);
    }

    public function store(StoreBarberoRequest $request)
    {
        $password = Str::random(12);

        $barbero = User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => $password,
            'role'                 => 'barber',
            'barberia_id'          => $request->barberia_id,
            'phone'                => $request->phone,
            'salary_type'          => $request->salary_type,
            'salary_amount'        => $request->salary_type === 'fixed' ? $request->salary_amount : null,
            'commission_pct'       => $request->salary_type === 'commission' ? $request->commission_pct : null,
            'active'               => true,
            'must_change_password' => true,
        ]);

        return redirect()->route('owner.barberos.index')
            ->with('newBarbero', [
                'name'     => $barbero->name,
                'password' => $password,
            ]);
    }

    public function edit(User $barbero): Response
    {
        $this->authorizeBarbero($barbero);

        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name']);

        return Inertia::render('Owner/Barberos/Edit', [
            'barbero'   => [
                'id'             => $barbero->id,
                'name'           => $barbero->name,
                'email'          => $barbero->email,
                'phone'          => $barbero->phone,
                'salary_type'    => $barbero->salary_type,
                'salary_amount'  => $barbero->salary_amount,
                'commission_pct' => $barbero->commission_pct,
                'barberia_id'    => $barbero->barberia_id,
                'active'         => $barbero->active,
            ],
            'barberias' => $barberias,
        ]);
    }

    public function update(UpdateBarberoRequest $request, User $barbero)
    {
        $this->authorizeBarbero($barbero);

        $barbero->update([
            'name'           => $request->name,
            'email'          => $request->email,
            'phone'          => $request->phone,
            'barberia_id'    => $request->barberia_id,
            'salary_type'    => $request->salary_type,
            'salary_amount'  => $request->salary_type === 'fixed' ? $request->salary_amount : null,
            'commission_pct' => $request->salary_type === 'commission' ? $request->commission_pct : null,
            'active'         => $request->active,
        ]);

        return redirect()->route('owner.barberos.index');
    }

    public function deactivate(User $barbero)
    {
        $this->authorizeBarbero($barbero);
        $barbero->update(['active' => false]);

        return redirect()->route('owner.barberos.index');
    }

    public function resetPassword(User $barbero)
    {
        $this->authorizeBarbero($barbero);

        $password = Str::random(12);

        $barbero->update([
            'password'             => $password,
            'must_change_password' => true,
        ]);

        return redirect()->route('owner.barberos.index')
            ->with('resetPassword', [
                'name'     => $barbero->name,
                'password' => $password,
            ]);
    }

    private function authorizeBarbero(User $barbero): void
    {
        $barberiaIds = Auth::user()->barberias()->pluck('id');

        if (! $barberiaIds->contains($barbero->barberia_id) || $barbero->role !== 'barber') {
            abort(403);
        }
    }
}
