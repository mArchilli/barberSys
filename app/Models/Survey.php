<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Survey extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'target_audience',
        'active',
        'starts_at',
        'ends_at',
        'reward_type',
        'reward_coupon_type',
        'reward_coupon_value',
        'reward_coupon_duration_months',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'starts_at' => 'date',
            'ends_at' => 'date',
            'reward_coupon_value' => 'decimal:2',
            'reward_coupon_duration_months' => 'integer',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class)->orderBy('order');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SurveyResponse::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * reward_type=coupon solo tiene efecto para owners (los barberos no tienen
     * suscripción propia que descontar) — ver regla en CLAUDE.md.
     */
    public function grantsRewardTo(User $user): bool
    {
        return $this->reward_type === 'coupon' && $user->isOwner();
    }

    public function isWithinWindow(): bool
    {
        $today = Carbon::today();

        if ($this->starts_at !== null && $today->lt($this->starts_at)) {
            return false;
        }

        if ($this->ends_at !== null && $today->gt($this->ends_at)) {
            return false;
        }

        return true;
    }

    public function appliesToRole(string $role): bool
    {
        return $this->target_audience === 'both' || $this->target_audience === $role;
    }

    /**
     * La encuesta pendiente más antigua para el usuario dado (una por vez, no
     * apiladas): activa, dentro de ventana, con audiencia compatible con su rol,
     * y sin fila todavía en survey_responses para ese (survey, user).
     */
    public static function pendingFor(User $user): ?self
    {
        if (! $user->isOwner() && ! $user->isBarber()) {
            return null;
        }

        $today = Carbon::today();

        return static::query()
            ->where('active', true)
            ->where(function ($query) use ($user) {
                $query->where('target_audience', $user->role)
                    ->orWhere('target_audience', 'both');
            })
            ->where(function ($query) use ($today) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', $today);
            })
            ->where(function ($query) use ($today) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', $today);
            })
            ->whereDoesntHave('responses', fn ($query) => $query->where('user_id', $user->id))
            ->oldest('id')
            ->with('questions')
            ->first();
    }
}
