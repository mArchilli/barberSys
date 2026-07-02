<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gasto extends Model
{
    protected $fillable = ['barberia_id', 'name', 'amount', 'type', 'is_recurring', 'active'];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'is_recurring' => 'boolean',
            'active'       => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope(new BelongsToBarberiaScope);
    }

    public function barberia(): BelongsTo
    {
        return $this->belongsTo(Barberia::class);
    }

    public function registros(): HasMany
    {
        return $this->hasMany(GastoRegistro::class);
    }
}
