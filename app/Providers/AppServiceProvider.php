<?php

namespace App\Providers;

use App\Services\Invoicing\FacturanteInvoicingService;
use App\Services\Invoicing\InvoicingServiceInterface;
use App\Services\Invoicing\NullInvoicingService;
use App\Support\QueryProfiler;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Binding condicional de facturación: con FACTURANTE_API_KEY cargada
        // se emite vía Facturante; sin ella, fallback silencioso (no-op).
        // Pasar de un modo al otro es solo tocar el .env — cero código.
        $this->app->singleton(InvoicingServiceInterface::class, function () {
            return config('services.facturante.api_key')
                ? new FacturanteInvoicingService
                : new NullInvoicingService;
        });

        $this->app->singleton(QueryProfiler::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Registrado una única vez por proceso (ver QueryProfiler::listen).
        // Importa especialmente para app:auditar-performance, que despacha
        // varios requests in-process dentro del mismo comando artisan.
        if ($this->app->environment('local')) {
            $this->app->make(QueryProfiler::class)->listen();
        }
    }
}
