<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected function casts(): array
    {
        return [
            'starts_at'                 => 'date',
            'trial_ends_at'             => 'date',
            'ends_at'                   => 'date',
            'custom_features'           => 'array',
            'custom_price'              => 'decimal:2',
            'coupon_discount_snapshot'  => 'array',
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
