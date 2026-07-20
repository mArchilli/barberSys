<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSurveyRequest;
use App\Http\Requests\Admin\UpdateSurveyRequest;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SurveyController extends Controller
{
    public function index(): Response
    {
        $surveys = Survey::withCount([
            'responses',
            'responses as completed_responses_count' => fn ($query) => $query->where('status', 'completed'),
        ])->orderByDesc('id')->get();

        return Inertia::render('Admin/Encuestas/Index', [
            'surveys' => $surveys->map(fn (Survey $survey) => [
                'id' => $survey->id,
                'title' => $survey->title,
                'target_audience' => $survey->target_audience,
                'active' => $survey->active,
                'reward_type' => $survey->reward_type,
                'responses_count' => $survey->responses_count,
                'completed_responses_count' => $survey->completed_responses_count,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Encuestas/Create');
    }

    public function store(StoreSurveyRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $survey = Survey::create($request->safe()->except(['questions']) + ['created_by' => Auth::id()]);

            foreach ($request->input('questions') as $index => $question) {
                $survey->questions()->create($this->questionAttributes($question, $index));
            }
        });

        return redirect()->route('admin.surveys.index')->with('success', 'Encuesta creada.');
    }

    public function edit(Survey $survey): Response
    {
        $survey->load('questions');

        return Inertia::render('Admin/Encuestas/Edit', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'target_audience' => $survey->target_audience,
                'active' => $survey->active,
                'starts_at' => $survey->starts_at?->toDateString(),
                'ends_at' => $survey->ends_at?->toDateString(),
                'reward_type' => $survey->reward_type,
                'reward_coupon_type' => $survey->reward_coupon_type,
                'reward_coupon_value' => $survey->reward_coupon_value,
                'reward_coupon_duration_months' => $survey->reward_coupon_duration_months,
                'questions' => $survey->questions->map(fn (SurveyQuestion $question) => [
                    'id' => $question->id,
                    'type' => $question->type,
                    'question_text' => $question->question_text,
                    'order' => $question->order,
                    'scale_min' => $question->scale_min,
                    'scale_max' => $question->scale_max,
                ]),
            ],
        ]);
    }

    public function update(UpdateSurveyRequest $request, Survey $survey): RedirectResponse
    {
        DB::transaction(function () use ($request, $survey) {
            $survey->update($request->safe()->except(['questions']));

            $incomingIds = [];

            foreach ($request->input('questions') as $index => $question) {
                $attributes = $this->questionAttributes($question, $index);

                if (! empty($question['id'])) {
                    $survey->questions()->whereKey($question['id'])->update($attributes);
                    $incomingIds[] = (int) $question['id'];
                } else {
                    $incomingIds[] = $survey->questions()->create($attributes)->id;
                }
            }

            // Preguntas quitadas del constructor dinámico en esta edición: se
            // eliminan (cascadea sus respuestas ya guardadas en survey_answers,
            // es la consecuencia esperada de sacar una pregunta del formulario).
            $survey->questions()->whereNotIn('id', $incomingIds)->delete();
        });

        return redirect()->route('admin.surveys.index')->with('success', 'Encuesta actualizada.');
    }

    public function resultados(Survey $survey): Response
    {
        $survey->load('questions');

        $totalResponses = $survey->responses()->count();
        $completed = $survey->responses()->where('status', 'completed')->count();
        $skipped = $survey->responses()->where('status', 'skipped')->count();

        return Inertia::render('Admin/Encuestas/Resultados', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'target_audience' => $survey->target_audience,
            ],
            'funnel' => [
                'total_responses' => $totalResponses,
                'completed' => $completed,
                'skipped' => $skipped,
                'completion_rate' => $totalResponses > 0 ? round($completed / $totalResponses * 100, 1) : null,
            ],
            'questions' => $survey->questions->map(fn (SurveyQuestion $question) => $this->questionResults($question)),
        ]);
    }

    private function questionAttributes(array $question, int $index): array
    {
        $isRating = $question['type'] === 'rating';

        return [
            'type' => $question['type'],
            'question_text' => $question['question_text'],
            'order' => $question['order'] ?? $index,
            'scale_min' => $isRating ? ($question['scale_min'] ?? 1) : null,
            'scale_max' => $isRating ? ($question['scale_max'] ?? 5) : null,
        ];
    }

    private function questionResults(SurveyQuestion $question): array
    {
        if ($question->type === 'rating') {
            $values = $question->answers()->whereNotNull('rating_value')->pluck('rating_value');

            return [
                'id' => $question->id,
                'type' => 'rating',
                'question_text' => $question->question_text,
                'scale_min' => $question->scale_min,
                'scale_max' => $question->scale_max,
                'average' => $values->isNotEmpty() ? round((float) $values->avg(), 2) : null,
                'distribution' => $values->countBy()->sortKeys()->toArray(),
                'responses_count' => $values->count(),
            ];
        }

        return [
            'id' => $question->id,
            'type' => 'text',
            'question_text' => $question->question_text,
            'answers' => $question->answers()
                ->whereNotNull('text_value')
                ->latest('id')
                ->pluck('text_value'),
        ];
    }
}
