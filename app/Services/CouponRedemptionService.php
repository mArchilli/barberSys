<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;

class CouponRedemptionService
{
    /**
     * Chequeo de solo lectura (sin lock, sin incrementar used_count) — usado
     * por el feedback en vivo del formulario de registro antes de enviarlo.
     */
    public function checkCode(string $code, int $planId): array
    {
        $coupon = Coupon::where('code', $code)->first();

        if (! $coupon) {
            return ['valid' => false, 'message' => 'El cupón no existe.'];
        }

        if (! $coupon->active) {
            return ['valid' => false, 'message' => 'El cupón no está activo.'];
        }

        if ($coupon->isExpired()) {
            return ['valid' => false, 'message' => 'El cupón está vencido.'];
        }

        if (! $coupon->hasUsesLeft()) {
            return ['valid' => false, 'message' => 'El cupón alcanzó el máximo de usos.'];
        }

        if (! $coupon->appliesToPlan($planId)) {
            return ['valid' => false, 'message' => 'El cupón no aplica al plan elegido.'];
        }

        return ['valid' => true, 'message' => 'Cupón válido.', 'coupon' => $coupon->toSnapshot()];
    }

    /**
     * Canjea el cupón sobre una subscription ya persistida: valida bajo
     * lockForUpdate (para que dos canjes simultáneos no superen max_uses por
     * condición de carrera), guarda el snapshot congelado y incrementa
     * used_count de forma atómica. Lanza excepción con mensaje de usuario si
     * el código no es válido en el momento del canje.
     */
    public function redeem(string $code, Subscription $subscription, int $planId): void
    {
        DB::transaction(function () use ($code, $subscription, $planId) {
            $coupon = Coupon::where('code', $code)->lockForUpdate()->first();

            if (! $coupon || ! $coupon->isRedeemable($planId)) {
                throw new \RuntimeException('El cupón no es válido para el plan elegido.');
            }

            $coupon->increment('used_count');

            $subscription->coupon_id = $coupon->id;
            $subscription->coupon_discount_snapshot = $coupon->toSnapshot();
            $subscription->save();
        });
    }

    /**
     * Quita el cupón aplicado a una subscription y libera el uso consumido
     * (decrementa used_count del cupón), simétrico a redeem().
     */
    public function remove(Subscription $subscription): void
    {
        if ($subscription->coupon_id === null) {
            return;
        }

        DB::transaction(function () use ($subscription) {
            $coupon = Coupon::where('id', $subscription->coupon_id)->lockForUpdate()->first();

            if ($coupon && $coupon->used_count > 0) {
                $coupon->decrement('used_count');
            }

            $subscription->coupon_id = null;
            $subscription->coupon_discount_snapshot = null;
            $subscription->save();
        });
    }

    /**
     * Acción manual del admin: si la subscription ya tenía un cupón aplicado,
     * lo libera antes de canjear el nuevo código.
     */
    public function apply(string $code, Subscription $subscription, int $planId): void
    {
        DB::transaction(function () use ($code, $subscription, $planId) {
            $this->remove($subscription);
            $this->redeem($code, $subscription, $planId);
        });
    }
}
