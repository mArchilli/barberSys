<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barberia extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'address',
        'active',
        'deactivated_at',
        'turnos_enabled',
        'public_slug',
        'whatsapp_number',
        'turno_anticipacion_minutos',
        'turno_expiracion_horas',
    ];

    protected function casts(): array
    {
        return [
            'active'                     => 'boolean',
            'deactivated_at'             => 'datetime',
            'turnos_enabled'             => 'boolean',
            'turno_anticipacion_minutos' => 'integer',
            'turno_expiracion_horas'     => 'integer',
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

    public function horariosAtencion(): HasMany
    {
        return $this->hasMany(HorarioAtencion::class);
    }

    public function turnoExcepciones(): HasMany
    {
        return $this->hasMany(BarberiaTurnoExcepcion::class);
    }

    /**
     * Valor efectivo de "¿hay turnos activos?" para una fecha puntual: una
     * excepción para ese día manda por sobre turnos_enabled, en cualquier
     * sentido. Única fuente de verdad — no repetir esta lógica en otro lado.
     */
    public function turnosActivosEn(Carbon $fecha): bool
    {
        $excepcion = $this->turnoExcepciones()
            ->whereDate('date', $fecha->toDateString())
            ->first();

        return $excepcion?->enabled ?? $this->turnos_enabled;
    }

    // Único lugar que arma el link público de reserva: null si el owner no
    // activó turnos o todavía no cargó el slug (nada que compartir todavía).
    public function publicTurnoUrl(): ?string
    {
        if (! $this->turnos_enabled || ! $this->public_slug) {
            return null;
        }

        return route('public.turno.index', ['barberia' => $this->public_slug]);
    }
}
