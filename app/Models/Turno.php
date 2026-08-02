<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Turno extends Model
{
    use HasFactory;

    protected $fillable = [
        'barberia_id',
        'barbero_id',
        'servicio_id',
        'cliente_nombre',
        'cliente_telefono',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date:Y-m-d',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope(new BelongsToBarberiaScope);
    }

    // Turnos que efectivamente ocupan un horario (excluye cancelados, y
    // completado/no_show quedan afuera a propósito: son turnos de fechas
    // pasadas que no compiten por slots futuros).
    public function scopeVigentes($query)
    {
        return $query->whereIn('status', ['pendiente', 'confirmado']);
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
}
