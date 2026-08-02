<?php

namespace App\Console\Commands;

use App\Models\SystemJobRun;
use App\Models\Turno;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Expira turnos pendientes que nadie confirmó ni canceló a tiempo. Alcanza
 * con cualquiera de los dos criterios (no hace falta que se cumplan los dos):
 * - Pasaron más de `barberia.turno_expiracion_horas` desde que se creó el turno.
 * - La fecha/hora de inicio del turno ya pasó, sin importar hace cuánto se creó
 *   (un turno de hoy a las 10:00 cargado a las 9:55 no debe seguir "pendiente"
 *   después de las 10:00 aunque falten horas para el plazo de espera general).
 *
 * Corre vía Artisan, sin usuario autenticado: BelongsToBarberiaScope no filtra
 * en ese caso (ver docblock de la clase) y el comando ve turnos de todas las
 * barberías, que es justamente lo que necesita.
 *
 * Agendado cada 30 minutos en bootstrap/app.php — acá el timing importa más
 * que en la generación de gastos: un turno vencido debe liberar su slot y
 * dejar de figurar como pendiente en un plazo corto, no una vez al día.
 */
class ExpirarTurnosPendientes extends Command
{
    protected $signature = 'app:expirar-turnos-pendientes';

    protected $description = 'Expira turnos pendientes vencidos por tiempo de espera o por fecha/hora de inicio ya pasada';

    public function handle(): int
    {
        $jobRun = SystemJobRun::create([
            'job_name'   => $this->signature,
            'started_at' => Carbon::now(),
        ]);

        try {
            $expirados = 0;

            Turno::where('status', 'pendiente')
                ->with('barberia:id,turno_expiracion_horas')
                ->each(function (Turno $turno) use (&$expirados) {
                    $vencioPorEspera = $turno->created_at
                        ->copy()
                        ->addHours($turno->barberia->turno_expiracion_horas ?? 24)
                        ->isPast();

                    $vencioPorHorario = Carbon::parse($turno->fecha->toDateString().' '.$turno->hora_inicio)
                        ->isPast();

                    if ($vencioPorEspera || $vencioPorHorario) {
                        $turno->update(['status' => 'expirado']);
                        $expirados++;
                    }
                });

            $summary = "{$expirados} turnos expirados";
            $this->info($summary);

            $jobRun->update([
                'finished_at' => Carbon::now(),
                'status'      => 'success',
                'summary'     => $summary,
            ]);

            return self::SUCCESS;
        } catch (Throwable $e) {
            $jobRun->update([
                'finished_at'   => Carbon::now(),
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
