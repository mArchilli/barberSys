<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioAtencion extends Model
{
    use HasFactory;

    // Eloquent pluraliza "HorarioAtencion" en inglés ("horario_atencions");
    // hay que fijar el nombre real de la tabla a mano.
    protected $table = 'horarios_atencion';

    // dia_semana: 0=Domingo ... 6=Sábado, igual que Carbon::dayOfWeek()/PHP
    // date('w'). Todo el sistema de turnos usa esta misma convención.
    protected $fillable = ['barberia_id', 'dia_semana', 'hora_inicio', 'hora_fin', 'activo'];

    protected function casts(): array
    {
        return [
            'dia_semana' => 'integer',
            'activo'     => 'boolean',
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
}
