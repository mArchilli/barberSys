<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Corte;
use App\Models\Plan;
use App\Models\User;
use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OwnerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', '');
        $planId = (string) $request->query('plan', '');

        $owners = User::where('role', 'owner')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                $query->whereHas('subscription', fn ($q) => $q->where('status', $status));
            })
            ->when($planId !== '', function ($query) use ($planId) {
                $query->whereHas('subscription', fn ($q) => $q->where('plan_id', $planId));
            })
            ->with(['subscription.plan'])
            ->withCount('barberias')
            ->orderBy('name')
            ->get();

        // Total de barberos por owner, contado a través de sus barberías
        // (User no tiene BelongsToBarberiaScope, así que esto no requiere bypass).
        $barberoCounts = User::where('role', 'barber')
            ->join('barberias', 'barberias.id', '=', 'users.barberia_id')
            ->selectRaw('barberias.owner_id as owner_id, count(*) as total')
            ->groupBy('barberias.owner_id')
            ->pluck('total', 'owner_id');

        return Inertia::render('Admin/Owners/Index', [
            'owners' => $owners->map(fn (User $owner) => [
                'id'                  => $owner->id,
                'name'                => $owner->name,
                'email'               => $owner->email,
                'plan'                => $owner->subscription?->plan?->name,
                'subscription_status' => $owner->subscription?->status,
                'barberias_count'     => $owner->barberias_count,
                'barberos_count'      => (int) ($barberoCounts[$owner->id] ?? 0),
                'created_at'          => $owner->created_at->toDateString(),
            ]),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'plan'   => $planId,
            ],
            'statusOptions' => ['trial', 'active', 'past_due', 'cancelled'],
            'plans' => Plan::where('active', true)->orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function resetPassword(User $owner)
    {
        abort_unless($owner->role === 'owner', 404);

        $password = Str::random(12);

        $owner->update([
            'password'             => $password,
            'must_change_password' => true,
        ]);

        AdminActivityLog::create([
            'admin_id'        => Auth::id(),
            'action'          => 'owner.password_reset',
            'target_owner_id' => $owner->id,
        ]);

        return redirect()
            ->route('admin.owners.show', $owner)
            ->with('resetPassword', [
                'name'     => $owner->name,
                'password' => $password,
            ]);
    }

    public function show(User $owner): Response
    {
        abort_unless($owner->role === 'owner', 404);

        $barberias = $owner->barberias()
            ->withCount('barbers')
            ->get(['id', 'name', 'address', 'active']);

        $subscription = $owner->subscription()->with('plan')->first();

        // Bypass intencional del BelongsToBarberiaScope: este es el único lugar
        // del proyecto donde está permitido, porque el admin necesita ver la
        // actividad de un owner ajeno con fines de soporte de solo lectura.
        // Ver excepción documentada en CLAUDE.md.
        $recentCortes = Corte::withoutGlobalScope(BelongsToBarberiaScope::class)
            ->whereIn('barberia_id', $barberias->pluck('id'))
            ->with(['barbero:id,name', 'servicio:id,name', 'barberia:id,name'])
            ->orderByDesc('performed_at')
            ->limit(15)
            ->get(['id', 'barberia_id', 'barbero_id', 'servicio_id', 'price', 'performed_at']);

        $activityLogs = AdminActivityLog::where('target_owner_id', $owner->id)
            ->with('admin:id,name')
            ->orderByDesc('created_at')
            ->get();

        $plans = Plan::where('active', true)
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'max_barberias', 'max_barberos', 'is_custom']);

        return Inertia::render('Admin/Owners/Show', [
            'owner' => [
                'id'         => $owner->id,
                'name'       => $owner->name,
                'email'      => $owner->email,
                'phone'      => $owner->phone,
                'created_at' => $owner->created_at->toDateString(),
            ],
            'barberias' => $barberias->map(fn ($b) => [
                'id'            => $b->id,
                'name'          => $b->name,
                'address'       => $b->address,
                'active'        => $b->active,
                'barbers_count' => $b->barbers_count,
            ]),
            'subscription' => $subscription ? [
                'id'                    => $subscription->id,
                'plan_id'               => $subscription->plan_id,
                'status'                => $subscription->status,
                'starts_at'             => optional($subscription->starts_at)->toDateString(),
                'trial_ends_at'         => optional($subscription->trial_ends_at)->toDateString(),
                'ends_at'               => optional($subscription->ends_at)->toDateString(),
                'custom_max_barberias'  => $subscription->custom_max_barberias,
                'custom_max_barberos'   => $subscription->custom_max_barberos,
                'custom_price'          => $subscription->custom_price,
            ] : null,
            'plans' => $plans,
            'recentCortes' => $recentCortes->map(fn (Corte $c) => [
                'id'           => $c->id,
                'barberia'     => $c->barberia?->name,
                'barbero'      => $c->barbero?->name,
                'servicio'     => $c->servicio?->name,
                'price'        => $c->price,
                'performed_at' => optional($c->performed_at)->toDateString(),
            ]),
            'activityLogs' => $activityLogs->map(fn (AdminActivityLog $log) => [
                'id'         => $log->id,
                'admin'      => $log->admin?->name,
                'action'     => $log->action,
                'detalle'    => $log->detalle,
                'created_at' => $log->created_at->toDateTimeString(),
            ]),
        ]);
    }
}
