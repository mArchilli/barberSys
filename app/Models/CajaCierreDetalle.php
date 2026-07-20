<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CajaCierreDetalle extends Model
{
    use HasFactory;

    protected $fillable = ['caja_cierre_id', 'medio_pago_id', 'expected_amount', 'counted_amount', 'difference'];

    protected function casts(): array
    {
        return [
            'expected_amount' => 'decimal:2',
            // Nullable de verdad: null significa "sin verificar", nunca 0.
            'counted_amount' => 'decimal:2',
            'difference' => 'decimal:2',
        ];
    }

    public function cajaCierre(): BelongsTo
    {
        return $this->belongsTo(CajaCierre::class);
    }

    public function medioPago(): BelongsTo
    {
        return $this->belongsTo(MedioPago::class);
    }
}
