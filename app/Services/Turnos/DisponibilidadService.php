<?php

namespace App\Services\Turnos;

use App\Models\Barberia;
use App\Models\BarberoDisponibilidad;
use App\Models\BarberoExcepcion;
use App\Models\HorarioAtencion;
use App\Models\Servicio;
use App\Models\Turno;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Motor de cálculo de disponibilidad de turnos. Función pura: mismos
 * argumentos + mismo estado en base de datos → mismo resultado, sin
 * escribir nada. No cachea nada a propósito (ver DisponibilidadService en
 * CLAUDE.md / hallazgos de Turnos-1): agregar caché más adelante no debería
 * requerir tocar esta clase.
 */
class DisponibilidadService
{
    /**
     * @return array<int, array{hora_inicio: string, hora_fin: string, barberos_disponibles: array<int, int>}>
     */
    public function slotsDisponibles(Barberia $barberia, Servicio $servicio, Carbon $fecha, ?User $barbero = null): array
    {
        if (! $barberia->turnosActivosEn($fecha)) {
            return [];
        }

        $diaSemana = $fecha->dayOfWeek;

        $franjasBarberia = $this->franjasHorarioAtencion($barberia, $fecha, $diaSemana);
        if ($franjasBarberia->isEmpty()) {
            return [];
        }

        $candidatos = $barbero ? collect([$barbero]) : $this->barberosActivos($barberia);
        $umbral = $fecha->isToday() ? Carbon::now()->addMinutes($barberia->turno_anticipacion_minutos) : null;

        $slotsPorClave = [];

        foreach ($candidatos as $candidato) {
            if ($this->barberoIndisponibleEnFecha($candidato, $fecha)) {
                continue;
            }

            $franjasBarbero = $this->franjasDisponibilidadBarbero($candidato, $fecha, $diaSemana);
            $franjasEfectivas = $this->intersectarFranjas($franjasBarberia, $franjasBarbero);

            if ($franjasEfectivas->isEmpty()) {
                continue;
            }

            $turnosOcupados = $this->turnosVigentes($barberia, $candidato, $fecha);

            foreach ($franjasEfectivas as $franja) {
                foreach ($this->generarSlots($franja, $servicio->duration_minutes) as $slot) {
                    if ($umbral && $slot['inicio']->lt($umbral)) {
                        continue;
                    }

                    if ($this->seSolapaConTurno($slot, $turnosOcupados)) {
                        continue;
                    }

                    $clave = $slot['inicio']->format('H:i').'-'.$slot['fin']->format('H:i');

                    $slotsPorClave[$clave] ??= [
                        'hora_inicio' => $slot['inicio']->format('H:i'),
                        'hora_fin' => $slot['fin']->format('H:i'),
                        'barberos_disponibles' => [],
                    ];
                    $slotsPorClave[$clave]['barberos_disponibles'][] = $candidato->id;
                }
            }
        }

        $slots = array_values($slotsPorClave);
        usort($slots, fn (array $a, array $b) => $a['hora_inicio'] <=> $b['hora_inicio']);

        return $slots;
    }

    /**
     * Franjas de atención de la barbería para el día de la semana de $fecha,
     * ancladas a la fecha consultada (Carbon con fecha+hora reales).
     *
     * @return Collection<int, array{inicio: Carbon, fin: Carbon}>
     */
    private function franjasHorarioAtencion(Barberia $barberia, Carbon $fecha, int $diaSemana): Collection
    {
        return HorarioAtencion::where('barberia_id', $barberia->id)
            ->where('dia_semana', $diaSemana)
            ->where('activo', true)
            ->orderBy('hora_inicio')
            ->get()
            ->map(fn (HorarioAtencion $horario) => $this->franjaEnFecha($fecha, $horario->hora_inicio, $horario->hora_fin));
    }

    /**
     * @return Collection<int, array{inicio: Carbon, fin: Carbon}>
     */
    private function franjasDisponibilidadBarbero(User $barbero, Carbon $fecha, int $diaSemana): Collection
    {
        return BarberoDisponibilidad::where('user_id', $barbero->id)
            ->where('dia_semana', $diaSemana)
            ->orderBy('hora_inicio')
            ->get()
            ->map(fn (BarberoDisponibilidad $disponibilidad) => $this->franjaEnFecha($fecha, $disponibilidad->hora_inicio, $disponibilidad->hora_fin));
    }

    private function franjaEnFecha(Carbon $fecha, string $horaInicio, string $horaFin): array
    {
        return [
            'inicio' => Carbon::parse($fecha->toDateString().' '.$horaInicio),
            'fin' => Carbon::parse($fecha->toDateString().' '.$horaFin),
        ];
    }

    /**
     * @return Collection<int, User>
     */
    private function barberosActivos(Barberia $barberia): Collection
    {
        return $barberia->barbers()
            ->where('role', 'barber')
            ->where('active', true)
            ->get();
    }

    private function barberoIndisponibleEnFecha(User $barbero, Carbon $fecha): bool
    {
        return BarberoExcepcion::where('user_id', $barbero->id)
            ->whereDate('fecha', $fecha->toDateString())
            ->where('disponible', false)
            ->exists();
    }

    /**
     * Intersección de dos conjuntos de franjas horarias (barbería x barbero).
     * Sin disponibilidad del barbero configurada para el día → sin franjas
     * efectivas, no "todo el día libre" (el barbero simplemente no trabaja
     * ese día si nunca cargó un bloque para él).
     *
     * @param  Collection<int, array{inicio: Carbon, fin: Carbon}>  $franjasA
     * @param  Collection<int, array{inicio: Carbon, fin: Carbon}>  $franjasB
     * @return Collection<int, array{inicio: Carbon, fin: Carbon}>
     */
    private function intersectarFranjas(Collection $franjasA, Collection $franjasB): Collection
    {
        $resultado = [];

        foreach ($franjasA as $a) {
            foreach ($franjasB as $b) {
                $inicio = $a['inicio']->greaterThan($b['inicio']) ? $a['inicio'] : $b['inicio'];
                $fin = $a['fin']->lessThan($b['fin']) ? $a['fin'] : $b['fin'];

                if ($inicio->lt($fin)) {
                    $resultado[] = ['inicio' => $inicio->copy(), 'fin' => $fin->copy()];
                }
            }
        }

        return collect($resultado);
    }

    /**
     * @param  array{inicio: Carbon, fin: Carbon}  $franja
     * @return array<int, array{inicio: Carbon, fin: Carbon}>
     */
    private function generarSlots(array $franja, int $duracionMinutos): array
    {
        $slots = [];
        $cursor = $franja['inicio']->copy();

        while ($cursor->copy()->addMinutes($duracionMinutos)->lte($franja['fin'])) {
            $slots[] = ['inicio' => $cursor->copy(), 'fin' => $cursor->copy()->addMinutes($duracionMinutos)];
            $cursor->addMinutes($duracionMinutos);
        }

        return $slots;
    }

    /**
     * @return Collection<int, array{inicio: Carbon, fin: Carbon}>
     */
    private function turnosVigentes(Barberia $barberia, User $barbero, Carbon $fecha): Collection
    {
        return Turno::where('barberia_id', $barberia->id)
            ->where('barbero_id', $barbero->id)
            ->whereDate('fecha', $fecha->toDateString())
            ->vigentes()
            ->get(['hora_inicio', 'hora_fin'])
            ->map(fn (Turno $turno) => $this->franjaEnFecha($fecha, $turno->hora_inicio, $turno->hora_fin));
    }

    /**
     * @param  array{inicio: Carbon, fin: Carbon}  $slot
     * @param  Collection<int, array{inicio: Carbon, fin: Carbon}>  $turnosOcupados
     */
    private function seSolapaConTurno(array $slot, Collection $turnosOcupados): bool
    {
        return $turnosOcupados->contains(
            fn (array $turno) => $slot['inicio']->lt($turno['fin']) && $slot['fin']->gt($turno['inicio'])
        );
    }
}
