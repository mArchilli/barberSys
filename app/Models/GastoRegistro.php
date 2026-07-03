<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GastoRegistro extends Model
{
    use HasFactory;

    protected $fillable = ['gasto_id', 'barberia_id', 'amount', 'month', 'is_deleted_for_month'];

    protected function casts(): array
    {
        return [
            'amount'                => 'decimal:2',
            // Formato explícito: el cast 'date' plano guarda datetime completo
            // ('Y-m-d H:i:s'), lo que rompe el firstOrCreate(['month' => ...])
            // de GenerarGastosMensuales al comparar contra un string 'Y-m-d'
            // (MySQL lo disimula truncando su columna DATE, pero no todos los
            // drivers lo hacen).
            'month'                 => 'date:Y-m-d',
            'is_deleted_for_month'  => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // gasto_registros trae barberia_id propio (denormalizado, igual que
        // Corte) precisamente para poder aislarlo por tenant sin depender
        // de que el Gasto padre siga existiendo.
        static::addGlobalScope(new BelongsToBarberiaScope);
    }

    public function gasto(): BelongsTo
    {
        return $this->belongsTo(Gasto::class);
    }

    public function barberia(): BelongsTo
    {
        return $this->belongsTo(Barberia::class);
    }
}
