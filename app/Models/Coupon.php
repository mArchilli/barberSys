<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * LIMITACIÓN CONOCIDA — sin integración de cobro real todavía:
 * hoy no existe integración de MercadoPago Suscripciones (solo está documentada
 * la estrategia). Este modelo y su canje quedan completos a nivel de datos y
 * validación, pero el descuento de un Coupon NO tiene ningún efecto sobre un
 * cobro procesado hasta que esa integración exista. Quien construya el cobro
 * de MercadoPago debe leer `subscriptions.coupon_discount_snapshot` (no este
 * modelo, ni `Coupon::find($subscription->coupon_id)`) al calcular el monto a
 * enviar, porque el snapshot es lo que congela type/value/duration_months tal
 * como estaban al momento del canje — un Coupon editado después no debe alterar
 * retroactivamente lo que un owner ya tiene aplicado. Ver regla completa en
 * CLAUDE.md.
 */
class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'max_uses',
        'used_count',
        'duration_months',
        'applicable_plan_ids',
        'expires_at',
        'active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'value'                => 'decimal:2',
            'max_uses'             => 'integer',
            'used_count'           => 'integer',
            'duration_months'      => 'integer',
            'applicable_plan_ids'  => 'array',
            'expires_at'           => 'date',
            'active'               => 'boolean',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function hasUsesLeft(): bool
    {
        return $this->max_uses === null || $this->used_count < $this->max_uses;
    }

    /**
     * `applicable_plan_ids` null = aplica a todos los planes del catálogo.
     */
    public function appliesToPlan(int $planId): bool
    {
        return $this->applicable_plan_ids === null
            || in_array($planId, $this->applicable_plan_ids, true);
    }

    public function isRedeemable(int $planId): bool
    {
        return $this->active
            && ! $this->isExpired()
            && $this->hasUsesLeft()
            && $this->appliesToPlan($planId);
    }

    /**
     * Snapshot congelado al momento del canje — ver comentario de clase.
     */
    public function toSnapshot(): array
    {
        return [
            'code'             => $this->code,
            'type'             => $this->type,
            'value'            => (float) $this->value,
            'duration_months'  => $this->duration_months,
        ];
    }
}
