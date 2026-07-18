<?php

namespace App\Http\Middleware;

use App\Models\Barberia;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'newBarbero' => $request->session()->get('newBarbero'),
                'resetPassword' => $request->session()->get('resetPassword'),
            ],
            'currentBarberia' => function () use ($request) {
                $barberia = $request->route('barberia');
                if ($barberia instanceof Barberia) {
                    return ['id' => $barberia->id, 'name' => $barberia->name, 'active' => $barberia->active];
                }

                return null;
            },
            'ownerBarberiaCount' => function () use ($request) {
                $user = $request->user();
                if ($user && $user->isOwner()) {
                    return $user->barberias()->where('active', true)->count();
                }

                return null;
            },
            // Estado mínimo de la suscripción para el TrialBanner y el menú.
            // Lazy: solo se evalúa cuando la página lo consume.
            'ownerSubscription' => function () use ($request) {
                $user = $request->user();
                if (! $user || ! $user->isOwner()) {
                    return null;
                }

                $subscription = $user->subscription()->first();
                if (! $subscription) {
                    return null;
                }

                return [
                    'status' => $subscription->status,
                    'trial_days_left' => $subscription->trialDaysLeft(),
                    'has_preapproval' => $subscription->hasPreapproval(),
                ];
            },
            // Tours de onboarding ya vistos por el usuario (clave por tour), para
            // que usePageTour() sepa si debe disparar el tour automáticamente.
            'tours_seen' => function () use ($request) {
                $user = $request->user();

                return $user ? ($user->tours_seen ?? []) : null;
            },
        ];
    }
}
