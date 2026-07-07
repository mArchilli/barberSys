<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Corte extends Model
{
    use HasFactory;

    protected $fillable = [
        'barberia_id',
        'barbero_id',
        'servicio_id',
        'cliente_id',
        'medio_pago_id',
        'price',
        'performed_at',
    ];

    protected function casts(): array
    {
        return [
            'price'        => 'decimal:2',
            'performed_at' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope(new BelongsToBarberiaScope);
    }

    public function scopeDeUnDiaPorBarbero($query, int $barberoId, ?Carbon $dia = null)
    {
        return $query->where('barbero_id', $barberoId)
            ->whereDate('performed_at', ($dia ?? now())->toDateString());
    }

    public function barberia(): BelongsTo
    {
        return $this->belongsTo(Barberia::class);
    }

    public function barbero(): BelongsTo
    {
        return $this->belongsTo(User::class, 'barbero_id');
    }

    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function medioPago(): BelongsTo
    {
        return $this->belongsTo(MedioPago::class);
    }
}
