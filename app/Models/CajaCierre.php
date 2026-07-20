<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CajaCierre extends Model
{
    use HasFactory;

    protected $fillable = ['barberia_id', 'day', 'closed_by', 'closed_at'];

    protected function casts(): array
    {
        return [
            // Formato explícito: el cast 'date' plano guarda datetime completo,
            // lo que puede romper comparaciones contra un string 'Y-m-d' plano
            // (mismo motivo que GastoRegistro::$casts['month']).
            'day' => 'date:Y-m-d',
            'closed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // caja_cierres trae barberia_id propio, igual que Corte y GastoRegistro.
        static::addGlobalScope(new BelongsToBarberiaScope);
    }

    public function barberia(): BelongsTo
    {
        return $this->belongsTo(Barberia::class);
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(CajaCierreDetalle::class);
    }
}
