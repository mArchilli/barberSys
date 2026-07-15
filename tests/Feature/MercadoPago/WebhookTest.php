<?php

namespace Tests\Feature\MercadoPago;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\SystemErrorLog;
use App\Models\User;
use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use MercadoPago\Resources\PreApproval;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    private function crearSuscripcion(array $attributes = []): Subscription
    {
        $owner = User::factory()->owner()->create();
        $plan = Plan::factory()->create(['price' => 10000]);

        return Subscription::factory()->create(array_merge([
            'owner_id' => $owner->id,
            'plan_id' => $plan->id,
            'status' => 'trial',
            'trial_ends_at' => now()->addDays(3),
            'mp_preapproval_plan_id' => 'plan-123',
            'mp_preapproval_id' => 'preapproval-123',
        ], $attributes));
    }

    /**
     * Simula el JSON crudo que devuelve MercadoPago para un pago generado por
     * el cobro recurrente de una suscripción: subscription_id/plan_id viven
     * en point_of_interaction.transaction_data (no en external_reference,
     * que el checkout hosteado del plan no permite setear — viene null).
     */
    private function fakeMpPaymentArray(
        int $id,
        string $status,
        float $amount,
        ?string $preapprovalId,
        ?string $planId = null,
        ?string $dateApproved = null
    ): array {
        return [
            'id' => $id,
            'status' => $status,
            'transaction_amount' => $amount,
            'external_reference' => null,
            'date_approved' => $dateApproved,
            'point_of_interaction' => [
                'type' => 'SUBSCRIPTIONS',
                'transaction_data' => [
                    'subscription_id' => $preapprovalId,
                    'plan_id' => $planId,
                ],
            ],
        ];
    }

    private function mockGetPaymentRaw(array $payment): void
    {
        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getPaymentRaw')->andReturn($payment);
        });
    }

    private function fakePreapproval(
        string $id,
        ?string $planId,
        string $status = 'authorized',
        ?string $nextPaymentDate = '2026-08-15T12:00:00.000-03:00'
    ): PreApproval {
        $preapproval = new PreApproval;
        $preapproval->id = $id;
        $preapproval->preapproval_plan_id = $planId;
        $preapproval->status = $status;
        $preapproval->payer_email = 'test_user_123@testuser.com';
        $preapproval->next_payment_date = $nextPaymentDate;

        return $preapproval;
    }

    public function test_pago_aprobado_registra_el_cobro_y_activa_la_suscripcion(): void
    {
        $subscription = $this->crearSuscripcion();
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(555, 'approved', 10000, 'preapproval-123', 'plan-123', '2026-07-14T10:00:00.000-03:00'));

        $response = $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '555'],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('subscription_payments', [
            'subscription_id' => $subscription->id,
            'mp_payment_id' => '555',
            'status' => 'approved',
        ]);
        $this->assertSame('active', $subscription->fresh()->status);
    }

    public function test_la_misma_notificacion_dos_veces_no_duplica_el_pago(): void
    {
        $subscription = $this->crearSuscripcion();
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(555, 'approved', 10000, 'preapproval-123'));

        $payload = ['type' => 'payment', 'data' => ['id' => '555']];
        $this->postJson(route('webhooks.mercadopago'), $payload)->assertOk();
        $this->postJson(route('webhooks.mercadopago'), $payload)->assertOk();

        $this->assertSame(1, SubscriptionPayment::where('mp_payment_id', '555')->count());
    }

    public function test_pago_rechazado_pasa_la_suscripcion_activa_a_past_due(): void
    {
        $subscription = $this->crearSuscripcion(['status' => 'active']);
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(556, 'rejected', 10000, 'preapproval-123'));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '556'],
        ])->assertOk();

        $this->assertSame('past_due', $subscription->fresh()->status);
    }

    public function test_pago_ajeno_se_ignora_sin_registrar_nada(): void
    {
        $this->crearSuscripcion();
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(557, 'approved', 10000, 'preapproval-que-no-es-nuestro', 'plan-que-no-es-nuestro'));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '557'],
        ])->assertOk();

        $this->assertSame(0, SubscriptionPayment::count());
    }

    public function test_pago_sin_datos_de_suscripcion_se_ignora(): void
    {
        $this->crearSuscripcion();
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(560, 'approved', 10000, null, null));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '560'],
        ])->assertOk();

        $this->assertSame(0, SubscriptionPayment::count());
    }

    /**
     * Condición de carrera: el webhook de pago llega antes que el de
     * subscription_preapproval, así que todavía no hay mp_preapproval_id
     * guardado — se resuelve por mp_preapproval_plan_id y de paso se
     * autocompleta mp_preapproval_id para que no quede pendiente.
     */
    public function test_pago_resuelve_por_plan_id_si_todavia_no_hay_preapproval_id_guardado(): void
    {
        $subscription = $this->crearSuscripcion(['mp_preapproval_id' => null]);
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(561, 'approved', 10000, 'preapproval-nuevo', 'plan-123'));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '561'],
        ])->assertOk();

        $subscription->refresh();
        $this->assertDatabaseHas('subscription_payments', [
            'subscription_id' => $subscription->id,
            'mp_payment_id' => '561',
        ]);
        $this->assertSame('preapproval-nuevo', $subscription->mp_preapproval_id);
    }

    public function test_pago_aprobado_emite_factura_via_facturante(): void
    {
        config(['services.facturante.api_key' => 'clave-de-prueba']);
        Http::fake(['*' => Http::response(['numero_comprobante' => 'C-0001-00001234'])]);

        $subscription = $this->crearSuscripcion();
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(558, 'approved', 10000, 'preapproval-123', 'plan-123', '2026-07-14T10:00:00.000-03:00'));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '558'],
        ])->assertOk();

        $payment = SubscriptionPayment::where('mp_payment_id', '558')->first();
        $this->assertSame('C-0001-00001234', $payment->invoice_reference);
        $this->assertNotNull($payment->invoice_issued_at);
    }

    public function test_fallo_de_facturante_no_rompe_el_cobro_y_queda_en_salud_tecnica(): void
    {
        config(['services.facturante.api_key' => 'clave-de-prueba']);
        Http::fake(['*' => Http::response(['error' => 'credenciales inválidas'], 500)]);

        $subscription = $this->crearSuscripcion();
        $this->mockGetPaymentRaw($this->fakeMpPaymentArray(559, 'approved', 10000, 'preapproval-123'));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '559'],
        ])->assertOk();

        // El cobro quedó registrado y la suscripción activa, sin factura.
        $payment = SubscriptionPayment::where('mp_payment_id', '559')->first();
        $this->assertNotNull($payment);
        $this->assertNull($payment->invoice_reference);
        $this->assertSame('active', $subscription->fresh()->status);

        // El fallo quedó consultable con el subscription_payment_id para reintentar.
        $log = SystemErrorLog::latest('id')->first();
        $this->assertNotNull($log);
        $this->assertSame($payment->id, $log->context['subscription_payment_id']);
    }

    public function test_notificacion_sin_datos_se_ignora(): void
    {
        $this->postJson(route('webhooks.mercadopago'), [])->assertOk();

        $this->assertSame(0, SubscriptionPayment::count());
    }

    /**
     * Este es el momento en que, por primera vez, se conoce el
     * mp_preapproval_id real: el checkout hosteado del plan no admite
     * external_reference, así que la Subscription se resuelve por
     * mp_preapproval_plan_id (guardado al activar) y recién acá se completa
     * mp_preapproval_id.
     */
    public function test_webhook_de_preapproval_resuelve_por_plan_id_y_completa_el_preapproval_id(): void
    {
        $subscription = $this->crearSuscripcion([
            'mp_preapproval_id' => null,
            'mp_preapproval_plan_id' => 'plan-999',
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('getPreapproval')
                ->once()
                ->with('preapproval-999')
                ->andReturn($this->fakePreapproval('preapproval-999', 'plan-999'));
        });

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'subscription_preapproval',
            'data' => ['id' => 'preapproval-999'],
        ])->assertOk();

        $subscription->refresh();
        $this->assertSame('preapproval-999', $subscription->mp_preapproval_id);
        $this->assertSame('test_user_123@testuser.com', $subscription->mp_payer_email);
        $this->assertSame('active', $subscription->status);
        $this->assertSame('2026-08-15', $subscription->mp_next_payment_date->toDateString());
    }

    /**
     * Regresión: puede haber más de un preapproval para el mismo plan (un
     * intento cancelado dentro del checkout de MP + un reintento exitoso). Si
     * retorno() ya enlazó el cancelado antes de que este webhook confirme el
     * bueno, la notificación de un preapproval que llega `authorized` debe
     * poder sobreescribirlo — nunca quedar bloqueada por "ya tiene
     * mp_preapproval_id" apuntando a uno viejo.
     */
    public function test_webhook_de_preapproval_autorizado_sobreescribe_uno_cancelado_enlazado_antes(): void
    {
        $subscription = $this->crearSuscripcion([
            'mp_preapproval_id' => 'preapproval-cancelado',
            'mp_preapproval_plan_id' => 'plan-999',
            'status' => 'trial',
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('getPreapproval')
                ->once()
                ->with('preapproval-bueno')
                ->andReturn($this->fakePreapproval('preapproval-bueno', 'plan-999'));
        });

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'subscription_preapproval',
            'data' => ['id' => 'preapproval-bueno'],
        ])->assertOk();

        $subscription->refresh();
        $this->assertSame('preapproval-bueno', $subscription->mp_preapproval_id);
        $this->assertSame('active', $subscription->status);
    }

    /**
     * Simétrico al anterior: una notificación de un preapproval DISTINTO al
     * ya enlazado, que llega con un estado que NO es `authorized` (ej. un
     * evento tardío del intento cancelado), no debe pisar una suscripción
     * que ya está resuelta correctamente.
     */
    public function test_webhook_de_preapproval_no_autorizado_no_pisa_uno_ya_enlazado(): void
    {
        $subscription = $this->crearSuscripcion([
            'mp_preapproval_id' => 'preapproval-bueno',
            'mp_preapproval_plan_id' => 'plan-999',
            'status' => 'active',
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('getPreapproval')
                ->once()
                ->with('preapproval-cancelado-tardio')
                ->andReturn($this->fakePreapproval('preapproval-cancelado-tardio', 'plan-999', 'cancelled'));
        });

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'subscription_preapproval',
            'data' => ['id' => 'preapproval-cancelado-tardio'],
        ])->assertOk();

        $subscription->refresh();
        $this->assertSame('preapproval-bueno', $subscription->mp_preapproval_id);
        $this->assertSame('active', $subscription->status);
    }

    public function test_webhook_de_preapproval_cancelado_actualiza_el_estado(): void
    {
        $subscription = $this->crearSuscripcion(['status' => 'active']);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('getPreapproval')
                ->once()
                ->andReturn($this->fakePreapproval('preapproval-123', 'plan-123', 'cancelled'));
        });

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'subscription_preapproval',
            'data' => ['id' => 'preapproval-123'],
        ])->assertOk();

        $this->assertSame('cancelled', $subscription->fresh()->status);
    }
}
