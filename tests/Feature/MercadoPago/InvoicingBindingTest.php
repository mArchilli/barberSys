<?php

namespace Tests\Feature\MercadoPago;

use App\Services\Invoicing\FacturanteInvoicingService;
use App\Services\Invoicing\InvoicingServiceInterface;
use App\Services\Invoicing\NullInvoicingService;
use Tests\TestCase;

class InvoicingBindingTest extends TestCase
{
    public function test_sin_api_key_resuelve_null_invoicing_service(): void
    {
        config(['services.facturante.api_key' => null]);

        $this->assertInstanceOf(NullInvoicingService::class, app(InvoicingServiceInterface::class));
    }

    public function test_con_api_key_resuelve_facturante_invoicing_service(): void
    {
        config(['services.facturante.api_key' => 'clave-de-prueba']);

        $this->assertInstanceOf(FacturanteInvoicingService::class, app(InvoicingServiceInterface::class));
    }
}
