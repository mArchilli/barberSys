<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Models\SystemErrorLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class SurveyRewardService
{
    private const MAX_ATTEMPTS = 3;

    /**
     * Genera y aplica el cupón de premio para una encuesta completada. Se
     * invoca DESPUÉS de que la survey_response y sus respuestas ya quedaron
     * guardadas (fuera de esa transacción): cualquier fallo acá (colisión de
     * code, cupón no redimible, etc.) se loguea en system_error_logs (mismo
     * patrón que los fallos de Facturante) y se resuelve como reward_granted
     * en false, sin propagar la excepción — un problema con el premio nunca
     * debe deshacer el registro de la respuesta del usuario.
     *
     * Devuelve el Coupon creado (para que el controller lo muestre al owner
     * antes de cerrar el modal) o null si no correspondía premio o falló.
     */
    public function grant(Survey $survey, SurveyResponse $response, User $user): ?Coupon
    {
        // reward_type=coupon solo tiene efecto para owners — los barberos no
        // tienen suscripción propia que descontar (ver regla en CLAUDE.md).
        if (! $survey->grantsRewardTo($user)) {
            return null;
        }

        try {
            $coupon = $this->createCouponWithRetry($survey, $user);

            if ($coupon === null) {
                return null;
            }

            $subscription = $user->subscription;

            if ($subscription === null) {
                return null;
            }

            app(CouponRedemptionService::class)->apply($coupon->code, $subscription, $subscription->plan_id);

            $response->update(['reward_granted' => true]);

            return $coupon;
        } catch (Throwable $e) {
            $this->logFailure($e, $survey, $user, 'Fallo al aplicar el cupón de premio de encuesta');

            return null;
        }
    }

    /**
     * Reintenta hasta MAX_ATTEMPTS veces ante colisión de la unique constraint
     * de `code` (Str::random(10) hace la colisión muy improbable, pero no
     * asumimos que nunca va a pasar).
     */
    private function createCouponWithRetry(Survey $survey, User $user): ?Coupon
    {
        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            try {
                return DB::transaction(fn () => Coupon::create([
                    'code' => $this->generateCode(),
                    'type' => $survey->reward_coupon_type,
                    'value' => $survey->reward_coupon_value,
                    'max_uses' => 1,
                    'duration_months' => $survey->reward_coupon_duration_months,
                    'applicable_plan_ids' => null,
                    'active' => true,
                    'created_by' => $survey->created_by,
                ]));
            } catch (Throwable $e) {
                if ($attempt >= self::MAX_ATTEMPTS) {
                    $this->logFailure(
                        $e,
                        $survey,
                        $user,
                        "Fallo al generar cupón de premio de encuesta tras ".self::MAX_ATTEMPTS.' intentos'
                    );

                    return null;
                }
            }
        }

        return null;
    }

    private function generateCode(): string
    {
        return 'ENCUESTA-'.Str::upper(Str::random(10));
    }

    private function logFailure(Throwable $e, Survey $survey, User $user, string $message): void
    {
        SystemErrorLog::create([
            'exception_class' => get_class($e),
            'message' => $message.': '.$e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'url' => null,
            'user_id' => $user->id,
            'context' => ['survey_id' => $survey->id],
        ]);
    }
}
