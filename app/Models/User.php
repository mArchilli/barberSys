<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'barberia_id',
        'salary_type',
        'salary_amount',
        'commission_pct',
        'phone',
        'active',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'salary_amount'     => 'decimal:2',
            'commission_pct'    => 'decimal:2',
            'active'                => 'boolean',
            'must_change_password'  => 'boolean',
        ];
    }

    // --- Relaciones ---

    /** Barbería asignada (solo para role=barber) */
    public function barberia(): BelongsTo
    {
        return $this->belongsTo(Barberia::class);
    }

    /** Barberías que posee (solo para role=owner) */
    public function barberias(): HasMany
    {
        return $this->hasMany(Barberia::class, 'owner_id');
    }

    /** Suscripción activa (solo para role=owner) */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class, 'owner_id');
    }

    // --- Helpers de rol ---

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isBarber(): bool
    {
        return $this->role === 'barber';
    }
}
