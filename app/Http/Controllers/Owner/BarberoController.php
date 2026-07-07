<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreBarberoRequest;
use App\Http\Requests\Owner\UpdateBarberoRequest;
use App\Models\Barberia;
use App\Models\Corte;
use App\Models\User;
use App\Services\PlanLimitService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BarberoController extends Controller
{
    public function __construct(private PlanLimitService $planLimitService) {}

    public function index(Barberia $barberia): Response
    {
        $owner = Auth::user();

        $barberos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
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
            ]);

        return Inertia::render('Owner/Barberos/Index', [
            'barberos'  => $barberos,
            'planLimit' => [
                'max'        => $this->planLimitService->maxBarberos($owner),
                'totalOwner' => $this->planLimitService->currentBarberos($owner),
                'inBarberia' => $barberos->count(),
            ],
        ]);
    }

    /**
     * Ficha de un barbero puntual: histórico de facturación/cortes propios y sus
     * rankings de servicios/clientes. Es gestión básica de personal, disponible en
     * TODOS los planes (a diferencia del ranking comparativo ENTRE barberos del
     * Dashboard, que sí está gateado a Plan 2+ vía
     * subscription->hasFeature('ranking_barberos') — no confundir ambas cosas).
     */
    public function show(Barberia $barberia, User $barbero): Response
    {
        $this->authorizeBarbero($barbero, $barberia);

        $cortesQuery = fn () => Corte::where('cortes.barberia_id', $barberia->id)->where('cortes.barbero_id', $barbero->id);

        $totalFacturado = (float) $cortesQuery()->sum('price');
        $totalCortes = (int) $cortesQuery()->count();
        $activoDesde = $cortesQuery()->min('performed_at');

        $porServicio = $cortesQuery()
            ->join('servicios', 'servicios.id', '=', 'cortes.servicio_id')
            ->selectRaw('servicios.id as id, servicios.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('servicios.id', 'servicios.name')
            ->orderByDesc('cantidad')
            ->get();

        $clientesFrecuentes = $cortesQuery()
            ->join('clientes', 'clientes.id', '=', 'cortes.cliente_id')
            ->selectRaw('clientes.id as id, clientes.name as name, SUM(cortes.price) as total, COUNT(*) as cantidad')
            ->groupBy('clientes.id', 'clientes.name')
            ->orderByDesc('cantidad')
            ->limit(10)
            ->get();

        return Inertia::render('Owner/Barberos/Show', [
            'barbero' => [
                'id'             => $barbero->id,
                'name'           => $barbero->name,
                'email'          => $barbero->email,
                'phone'          => $barbero->phone,
                'salary_type'    => $barbero->salary_type,
                'salary_amount'  => $barbero->salary_amount,
                'commission_pct' => $barbero->commission_pct,
                'active'         => $barbero->active,
            ],
            'stats' => [
                'totalFacturado' => $totalFacturado,
                'totalCortes'    => $totalCortes,
                'activoDesde'    => $activoDesde,
            ],
            'porServicio'         => $this->mapPorCantidad($porServicio, $totalCortes),
            'clientesFrecuentes'  => $this->mapPorCantidad($clientesFrecuentes, $totalCortes),
        ]);
    }

    public function create(Barberia $barberia): Response
    {
        return Inertia::render('Owner/Barberos/Create', [
            'canAdd' => $this->planLimitService->canAddBarbero(Auth::user()),
        ]);
    }

    public function store(StoreBarberoRequest $request, Barberia $barberia)
    {
        $password = Str::random(12);

        $barbero = User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => $password,
            'role'                 => 'barber',
            'barberia_id'          => $barberia->id,
            'phone'                => $request->phone,
            'salary_type'          => $request->salary_type,
            'salary_amount'        => $request->salary_type === 'fixed' ? $request->salary_amount : null,
            'commission_pct'       => $request->salary_type === 'commission' ? $request->commission_pct : null,
            'active'               => true,
            'must_change_password' => true,
        ]);

        return redirect()->route('owner.barberias.barberos.index', $barberia->id)
            ->with('newBarbero', [
                'name'     => $barbero->name,
                'password' => $password,
            ]);
    }

    public function edit(Barberia $barberia, User $barbero): Response
    {
        $this->authorizeBarbero($barbero, $barberia);

        return Inertia::render('Owner/Barberos/Edit', [
            'barbero' => [
                'id'             => $barbero->id,
                'name'           => $barbero->name,
                'email'          => $barbero->email,
                'phone'          => $barbero->phone,
                'salary_type'    => $barbero->salary_type,
                'salary_amount'  => $barbero->salary_amount,
                'commission_pct' => $barbero->commission_pct,
                'active'         => $barbero->active,
            ],
        ]);
    }

    public function update(UpdateBarberoRequest $request, Barberia $barberia, User $barbero)
    {
        $this->authorizeBarbero($barbero, $barberia);

        $barbero->update([
            'name'           => $request->name,
            'email'          => $request->email,
            'phone'          => $request->phone,
            'salary_type'    => $request->salary_type,
            'salary_amount'  => $request->salary_type === 'fixed' ? $request->salary_amount : null,
            'commission_pct' => $request->salary_type === 'commission' ? $request->commission_pct : null,
            'active'         => $request->active,
            'deactivated_at' => $request->active ? null : ($barbero->deactivated_at ?? now()),
        ]);

        return redirect()->route('owner.barberias.barberos.index', $barberia->id);
    }

    public function deactivate(Barberia $barberia, User $barbero)
    {
        $this->authorizeBarbero($barbero, $barberia);
        $barbero->update(['active' => false, 'deactivated_at' => now()]);

        return redirect()->route('owner.barberias.barberos.index', $barberia->id);
    }

    public function resetPassword(Barberia $barberia, User $barbero)
    {
        $this->authorizeBarbero($barbero, $barberia);

        $password = Str::random(12);

        $barbero->update([
            'password'             => $password,
            'must_change_password' => true,
        ]);

        return redirect()->route('owner.barberias.barberos.index', $barberia->id)
            ->with('resetPassword', [
                'name'     => $barbero->name,
                'password' => $password,
            ]);
    }

    private function authorizeBarbero(User $barbero, Barberia $barberia): void
    {
        if ($barbero->barberia_id !== $barberia->id || $barbero->role !== 'barber') {
            abort(403);
        }
    }

    private function mapPorCantidad(Collection $filas, int $totalCortes): array
    {
        return $filas->map(fn ($fila) => [
            'id' => $fila->id,
            'name' => $fila->name,
            'total' => (float) $fila->total,
            'cantidad' => (int) $fila->cantidad,
            'pct' => $totalCortes > 0 ? round(($fila->cantidad / $totalCortes) * 100, 1) : 0,
        ])->all();
    }
}
