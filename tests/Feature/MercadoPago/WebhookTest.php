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
use MercadoPago\Resources\Payment;
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
            'mp_preapproval_id' => 'preapproval-123',
        ], $attributes));
    }

    private function fakeMpPayment(
        int $id,
        string $status,
        float $amount,
        ?string $externalReference,
        ?string $dateApproved = null
    ): Payment {
        $payment = new Payment;
        $payment->id = $id;
        $payment->status = $status;
        $payment->transaction_amount = $amount;
        $payment->external_reference = $externalReference;
        $payment->date_approved = $dateApproved;

        return $payment;
    }

    private function mockGetPayment(Payment $payment): void
    {
        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('getPayment')->andReturn($payment);
        });
    }

    public function test_pago_aprobado_registra_el_cobro_y_activa_la_suscripcion(): void
    {
        $subscription = $this->crearSuscripcion();
        $this->mockGetPayment($this->fakeMpPayment(555, 'approved', 10000, (string) $subscription->id, '2026-07-14T10:00:00.000-03:00'));

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
        $this->mockGetPayment($this->fakeMpPayment(555, 'approved', 10000, (string) $subscription->id));

        $payload = ['type' => 'payment', 'data' => ['id' => '555']];
        $this->postJson(route('webhooks.mercadopago'), $payload)->assertOk();
        $this->postJson(route('webhooks.mercadopago'), $payload)->assertOk();

        $this->assertSame(1, SubscriptionPayment::where('mp_payment_id', '555')->count());
    }

    public function test_pago_rechazado_pasa_la_suscripcion_activa_a_past_due(): void
    {
        $subscription = $this->crearSuscripcion(['status' => 'active']);
        $this->mockGetPayment($this->fakeMpPayment(556, 'rejected', 10000, (string) $subscription->id));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '556'],
        ])->assertOk();

        $this->assertSame('past_due', $subscription->fresh()->status);
    }

    public function test_pago_ajeno_se_ignora_sin_registrar_nada(): void
    {
        $this->crearSuscripcion();
        $this->mockGetPayment($this->fakeMpPayment(557, 'approved', 10000, 'referencia-que-no-es-nuestra'));

        $this->postJson(route('webhooks.mercadopago'), [
            'type' => 'payment',
            'data' => ['id' => '557'],
        ])->assertOk();

        $this->assertSame(0, SubscriptionPayment::count());
    }

    public function test_pago_aprobado_emite_factura_via_facturante(): void
    {
        config(['services.facturante.api_key' => 'clave-de-prueba']);
        Http::fake(['*' => Http::response(['numero_comprobante' => 'C-0001-00001234'])]);

        $subscription = $this->crearSuscripcion();
        $this->mockGetPayment($this->fakeMpPayment(558, 'approved', 10000, (string) $subscription->id, '2026-07-14T10:00:00.000-03:00'));

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
        $this->mockGetPayment($this->fakeMpPayment(559, 'approved', 10000, (string) $subscription->id));

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
}
