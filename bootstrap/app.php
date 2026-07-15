<?php

use App\Http\Middleware\BlockIfBarberiaInactive;
use App\Http\Middleware\CheckBarberiaOwnership;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\ForcePasswordChange;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\SystemErrorLog;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            ForcePasswordChange::class,
        ]);

        $middleware->alias([
            'role' => CheckRole::class,
            'checkBarberiaOwnership' => CheckBarberiaOwnership::class,
            'blockIfBarberiaInactive' => BlockIfBarberiaInactive::class,
        ]);

        // MercadoPago hace POST server-to-server sin sesión: no puede enviar
        // token CSRF. La verificación de autenticidad la hace el controller
        // consultando el recurso notificado contra la API de MP.
        $middleware->validateCsrfTokens(except: [
            'webhooks/mercadopago',
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Genera los gasto_registros del mes en curso. Requiere el cron de
        // Laravel corriendo en producción (`* * * * * php artisan schedule:run`);
        // en local se dispara a mano con `php artisan app:generar-gastos-mensuales`
        // o simulando el cron con `php artisan schedule:work`.
        $schedule->command('app:generar-gastos-mensuales')->monthlyOn(1, '00:00');

        // Reconciliación de facturas de Facturante pendientes de CAE (autorización
        // asíncrona de AFIP). Deshabilitado hasta reescribir FacturanteInvoicingService
        // con el WSDL real — y podría no hacer falta si Facturante ofrece webhooks
        // de estado. Ver App\Console\Commands\ReconciliarFacturasFacturante.
        // $schedule->command('app:reconciliar-facturas-facturante')->hourly();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Complementa (no reemplaza) el log de storage/logs con un registro
        // consultable desde Admin > Salud técnica. Se excluyen las excepciones
        // "controladas" del framework (404/403/419/validación/auth) porque
        // no representan bugs, solo respuestas esperadas del flujo normal.
        $exceptions->reportable(function (Throwable $e) {
            if ($e instanceof HttpExceptionInterface
                || $e instanceof ValidationException
                || $e instanceof AuthenticationException) {
                return;
            }

            SystemErrorLog::create([
                'exception_class' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => request()->fullUrl(),
                'user_id' => request()->user()?->id,
            ]);
        });
    })->create();
