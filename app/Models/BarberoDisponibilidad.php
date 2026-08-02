<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarberoDisponibilidad extends Model
{
    use HasFactory;

    // La tabla es singular a propósito (ver migración); Eloquent la
    // pluralizaría mal ("barbero_disponibilidads") si no se fija a mano.
    protected $table = 'barbero_disponibilidad';

    // dia_semana: misma convención que HorarioAtencion (0=Domingo..6=Sábado).
    protected $fillable = ['user_id', 'dia_semana', 'hora_inicio', 'hora_fin'];

    protected function casts(): array
    {
        return [
            'dia_semana' => 'integer',
        ];
    }

    public function barbero(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
