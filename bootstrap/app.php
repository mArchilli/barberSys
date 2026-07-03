<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ForcePasswordChange::class,
        ]);

        $middleware->alias([
            'role'                    => \App\Http\Middleware\CheckRole::class,
            'checkBarberiaOwnership'  => \App\Http\Middleware\CheckBarberiaOwnership::class,
            'blockIfBarberiaInactive' => \App\Http\Middleware\BlockIfBarberiaInactive::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Genera los gasto_registros del mes en curso. Requiere el cron de
        // Laravel corriendo en producción (`* * * * * php artisan schedule:run`);
        // en local se dispara a mano con `php artisan app:generar-gastos-mensuales`
        // o simulando el cron con `php artisan schedule:work`.
        $schedule->command('app:generar-gastos-mensuales')->monthlyOn(1, '00:00');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
