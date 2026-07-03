<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barberia extends Model
{
    use HasFactory;

    protected $fillable = ['owner_id', 'name', 'address', 'active', 'deactivated_at'];

    protected function casts(): array
    {
        return [
            'active'         => 'boolean',
            'deactivated_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function barbers(): HasMany
    {
        return $this->hasMany(User::class, 'barberia_id');
    }

    public function gastos(): HasMany
    {
        return $this->hasMany(Gasto::class);
    }
}
