<?php

namespace App\Http\Middleware;

use App\Models\Barberia;
use App\Models\Corte;
use App\Models\Survey;
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
                'surveyReward' => $request->session()->get('surveyReward'),
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
            // Visibilidad del link "Mi rendimiento" del menú: solo si el owner
            // tiene al menos un corte histórico a su nombre en la barbería
            // actual (data-driven, mismo criterio que la pantalla en sí).
            // Lazy: solo se evalúa dentro del grupo anidado por barbería.
            'miRendimientoVisible' => function () use ($request) {
                $barberia = $request->route('barberia');
                $user = $request->user();

                if (! $barberia instanceof Barberia || ! $user || ! $user->isOwner()) {
                    return false;
                }

                return Corte::where('barberia_id', $barberia->id)
                    ->where('barbero_id', $user->id)
                    ->exists();
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
            // Encuesta pendiente para el usuario actual (owner o barber): la más
            // antigua sin responder, dentro de ventana y con audiencia compatible
            // (ver Survey::pendingFor). Lazy: solo se evalúa cuando SurveyModal
            // la consume.
            'pendingSurvey' => function () use ($request) {
                $user = $request->user();
                if (! $user) {
                    return null;
                }

                $survey = Survey::pendingFor($user);
                if (! $survey) {
                    return null;
                }

                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'questions' => $survey->questions->map(fn ($question) => [
                        'id' => $question->id,
                        'type' => $question->type,
                        'question_text' => $question->question_text,
                        'scale_min' => $question->scale_min,
                        'scale_max' => $question->scale_max,
                    ]),
                ];
            },
        ];
    }
}
