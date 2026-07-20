<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SurveyAnswerRequest extends FormRequest
{
    private const MIN_TEXT_LENGTH = 10;

    public function authorize(): bool
    {
        $user = Auth::user();
        $survey = $this->route('survey');

        return $user && $survey && ($user->isOwner() || $user->isBarber()) && $survey->appliesToRole($user->role);
    }

    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:survey_questions,id'],
            'answers.*.rating_value' => ['nullable', 'integer', 'min:0'],
            'answers.*.text_value' => ['nullable', 'string'],
        ];
    }

    /**
     * No se permite completar parcial: todas las preguntas de la survey deben
     * tener respuesta, y las de tipo text necesitan un mínimo de caracteres
     * para contar como válida (si no lo cumple, mensaje pidiendo más detalle,
     * nunca un rechazo silencioso).
     */
    public function withValidator(ValidatorContract $validator): void
    {
        $validator->after(function (ValidatorContract $validator) {
            $survey = $this->route('survey');
            $survey->loadMissing('questions');

            $answersByQuestion = collect($this->input('answers', []))->keyBy('question_id');

            foreach ($survey->questions as $question) {
                $answer = $answersByQuestion->get($question->id);

                if ($question->type === 'rating') {
                    if (! $answer || ! is_numeric($answer['rating_value'] ?? null)) {
                        $validator->errors()->add('answers', 'Respondé todas las preguntas antes de enviar la encuesta.');

                        return;
                    }

                    continue;
                }

                $text = trim((string) ($answer['text_value'] ?? ''));

                if (mb_strlen($text) < self::MIN_TEXT_LENGTH) {
                    $validator->errors()->add(
                        'answers',
                        'Contanos un poco más en "'.$question->question_text.'" (mínimo '.self::MIN_TEXT_LENGTH.' caracteres).'
                    );

                    return;
                }
            }
        });
    }
}
