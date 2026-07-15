<?php

namespace App\Providers;

use App\Services\Invoicing\FacturanteInvoicingService;
use App\Services\Invoicing\InvoicingServiceInterface;
use App\Services\Invoicing\NullInvoicingService;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
