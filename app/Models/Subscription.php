<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'plan_id',
        'custom_max_barberias',
        'custom_max_barberos',
        'custom_features',
        'custom_price',
        'status',
        'starts_at',
        'trial_ends_at',
        'ends_at',
        'coupon_id',
        'coupon_discount_snapshot',
        'mp_preapproval_id',
        'mp_payer_email',
        'mp_preapproval_plan_id',
        'mp_next_payment_date',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'trial_ends_at' => 'date',
            'ends_at' => 'date',
            'custom_features' => 'array',
            'custom_price' => 'decimal:2',
            'coupon_discount_snapshot' => 'array',
            'mp_next_payment_date' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * El cupón vigente (si el admin lo edita o desactiva después) — para el
     * monto real aplicado ver `coupon_discount_snapshot`, no esta relación.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    // --- Helpers de estado de cobro ---

    /**
     * Cantidad de cobros aprobados — define la ventana de descuento de un
     * cupón con duration_months (el descuento aplica a los primeros N cobros).
     */
    public function approvedPaymentsCount(): int
    {
        return $this->payments()->where('status', SubscriptionPayment::STATUS_APPROVED)->count();
    }

    /** El owner ya autorizó el débito automático en MercadoPago. */
    public function hasPreapproval(): bool
    {
        return $this->mp_preapproval_id !== null;
    }

    /**
     * Se creó el Plan de MP para esta suscripción pero todavía no se resolvió
     * el preapproval real (el owner no completó el checkout, o el webhook
     * todavía no llegó). Útil para saber si conviene reintentar la búsqueda
     * en vez de crear un plan nuevo.
     */
    public function hasPreapprovalPlan(): bool
    {
        return $this->mp_preapproval_plan_id !== null;
    }

    public function isOnTrial(): bool
    {
        return $this->status === 'trial';
    }

    /**
     * Días de trial restantes (0 si ya venció, null si la suscripción no
     * está en trial o no tiene fecha de fin de trial).
     */
    public function trialDaysLeft(): ?int
    {
        if (! $this->isOnTrial() || $this->trial_ends_at === null) {
            return null;
        }

        return max(0, (int) Carbon::today()->diffInDays($this->trial_ends_at, false));
    }

    public function maxBarberias(): ?int
    {
        return $this->custom_max_barberias ?? $this->plan->max_barberias;
    }

    public function maxBarberos(): ?int
    {
        return $this->custom_max_barberos ?? $this->plan->max_barberos;
    }

    /**
     * Precio real de la suscripción: prioriza el precio negociado (custom_price,
     * usado por el Plan 4 "a medida" que tiene price=0 en el catálogo) y cae al
     * precio de catálogo del plan si no hay override.
     */
    public function effectivePrice(): float
    {
        return (float) ($this->custom_price ?? $this->plan->price);
    }

    /**
     * Resuelve primero por override puntual de esta suscripción (custom_features),
     * y si no está definido ahí, cae al catálogo del plan contratado.
     */
    public function hasFeature(string $key): bool
    {
        if ($this->custom_features && array_key_exists($key, $this->custom_features)) {
            return (bool) $this->custom_features[$key];
        }

        return $this->plan->hasFeature($key);
    }
}
