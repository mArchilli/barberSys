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
        'status',
        'starts_at',
        'trial_ends_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at'     => 'date',
            'trial_ends_at' => 'date',
            'ends_at'       => 'date',
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

    public function maxBarberias(): ?int
    {
        return $this->custom_max_barberias ?? $this->plan->max_barberias;
    }

    public function maxBarberos(): ?int
    {
        return $this->custom_max_barberos ?? $this->plan->max_barberos;
    }
}
