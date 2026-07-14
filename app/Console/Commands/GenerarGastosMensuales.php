<?php

namespace App\Console\Commands;

use App\Models\Gasto;
use App\Models\GastoRegistro;
use App\Models\SystemJobRun;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Genera el gasto_registro del mes en curso para cada gasto recurrente activo,
 * de todas las barberías. El índice único (gasto_id, month) evita duplicados
 * si el comando corre más de una vez en el mismo mes.
 *
 * En producción requiere el cron de Laravel configurado (`* * * * * php artisan schedule:run`)
 * apuntando al scheduler definido en bootstrap/app.php. Para pruebas locales
 * se ejecuta manualmente con `php artisan app:generar-gastos-mensuales`
 * o simulando el cron con `php artisan schedule:work`.
 */
class GenerarGastosMensuales extends Command
{
    protected $signature = 'app:generar-gastos-mensuales';

    protected $description = 'Genera los gasto_registros del mes en curso para los gastos recurrentes activos';

    public function handle(): int
    {
        $jobRun = SystemJobRun::create([
            'job_name'    => $this->signature,
            'started_at'  => Carbon::now(),
        ]);

        try {
            $mes = Carbon::now()->startOfMonth()->toDateString();
            $generados = 0;

            Gasto::where('is_recurring', true)
                ->where('active', true)
                ->each(function (Gasto $gasto) use ($mes, &$generados) {
                    $registro = GastoRegistro::firstOrCreate(
                        ['gasto_id' => $gasto->id, 'month' => $mes],
                        ['barberia_id' => $gasto->barberia_id, 'amount' => $gasto->amount]
                    );

                    if ($registro->wasRecentlyCreated) {
                        $generados++;
                    }
                });

            $summary = "{$generados} gastos generados";
            $this->info("Gasto_registros generados para {$mes}: {$generados}");

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
