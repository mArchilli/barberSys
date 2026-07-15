<?php

namespace Tests\Feature\MercadoPago;

use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use Tests\TestCase;

class EnvironmentDetectionTest extends TestCase
{
    public function test_token_con_prefijo_test_detecta_modo_prueba(): void
    {
        config(['services.mercadopago.access_token' => 'TEST-1234567890-abcdef']);

        $this->assertSame(MercadoPagoSubscriptionService::ENV_TEST, MercadoPagoSubscriptionService::environment());
        $this->assertTrue(MercadoPagoSubscriptionService::isConfigured());
    }

    public function test_token_con_prefijo_app_usr_detecta_modo_produccion(): void
    {
        config(['services.mercadopago.access_token' => 'APP_USR-1234567890-abcdef']);

        $this->assertSame(MercadoPagoSubscriptionService::ENV_PRODUCTION, MercadoPagoSubscriptionService::environment());
        $this->assertTrue(MercadoPagoSubscriptionService::isConfigured());
    }

    public function test_sin_token_reporta_no_configurado(): void
    {
        config(['services.mercadopago.access_token' => null]);

        $this->assertSame(MercadoPagoSubscriptionService::ENV_NOT_CONFIGURED, MercadoPagoSubscriptionService::environment());
        $this->assertFalse(MercadoPagoSubscriptionService::isConfigured());
    }

    public function test_token_con_prefijo_desconocido_reporta_unknown(): void
    {
        config(['services.mercadopago.access_token' => 'PROD-esto-no-es-un-token-de-mp']);

        $this->assertSame(MercadoPagoSubscriptionService::ENV_UNKNOWN, MercadoPagoSubscriptionService::environment());
        $this->assertFalse(MercadoPagoSubscriptionService::isConfigured());
    }
}
