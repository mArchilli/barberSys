<?php

namespace App\Http\Controllers;

use App\Http\Requests\SurveyAnswerRequest;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Services\SurveyRewardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Compartido entre owner y barber (ambos pueden recibir y responder
 * encuestas) — por eso no vive bajo Admin/Owner/Barber, sino en la raíz de
 * Controllers. La autorización real (rol compatible con target_audience) la
 * resuelve SurveyAnswerRequest::authorize().
 */
class SurveyResponseController extends Controller
{
    public function store(SurveyAnswerRequest $request, Survey $survey, SurveyRewardService $rewardService): RedirectResponse
    {
        $user = Auth::user();

        $existing = SurveyResponse::where('survey_id', $survey->id)->where('user_id', $user->id)->first();

        if ($existing) {
            return back();
        }

        $response = DB::transaction(function () use ($request, $survey, $user) {
            $response = SurveyResponse::create([
                'survey_id' => $survey->id,
                'user_id' => $user->id,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            foreach ($request->input('answers') as $answer) {
                $response->answers()->create([
                    'survey_question_id' => $answer['question_id'],
                    'rating_value' => $answer['rating_value'] ?? null,
                    'text_value' => $answer['text_value'] ?? null,
                ]);
            }

            return $response;
        });

        $coupon = $rewardService->grant($survey, $response, $user);

        if ($coupon) {
            return back()->with('surveyReward', [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
                'duration_months' => $coupon->duration_months,
            ]);
        }

        return back();
    }

    public function skip(Survey $survey): RedirectResponse
    {
        SurveyResponse::firstOrCreate(
            ['survey_id' => $survey->id, 'user_id' => Auth::id()],
            ['status' => 'skipped']
        );

        return back();
    }
}
