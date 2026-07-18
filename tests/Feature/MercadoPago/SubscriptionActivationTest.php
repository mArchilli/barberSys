<?php

namespace Tests\Feature\MercadoPago;

use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use MercadoPago\Resources\PreApproval;
use MercadoPago\Resources\PreApprovalPlan;
use Tests\TestCase;

class SubscriptionActivationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Subscription $subscription;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.mercadopago.access_token' => 'TEST-1234567890-abcdef']);

        $this->owner = User::factory()->owner()->create();
        $plan = Plan::factory()->create(['price' => 10000, 'max_barberias' => 5, 'max_barberos' => 10]);
        $this->subscription = Subscription::factory()->create([
            'owner_id' => $this->owner->id,
            'plan_id' => $plan->id,
            'status' => 'trial',
            'trial_ends_at' => now()->addDays(10),
        ]);
    }

    private function fakePreapprovalPlan(string $id, string $initPoint): PreApprovalPlan
    {
        $plan = new PreApprovalPlan;
        $plan->id = $id;
        $plan->init_point = $initPoint;
        $plan->status = 'active';

        return $plan;
    }

    private function fakePreapproval(
        string $id,
        string $planId,
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

    public function test_activar_guarda_datos_fiscales_crea_el_plan_y_redirige_al_checkout_de_mp(): void
    {
        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('createPreapprovalPlan')
                ->once()
                ->andReturn($this->fakePreapprovalPlan('plan-abc', 'https://mercadopago.test/checkout'));
        });

        $response = $this->actingAs($this->owner)->post(route('owner.suscripcion.activate'), [
            'razon_social' => 'Barbería El Corte SRL',
            'cuit' => '30-71234567-8',
            'billing_cycle' => 'monthly',
        ]);

        $response->assertRedirect('https://mercadopago.test/checkout');

        $this->owner->refresh();
        $this->assertSame('Barbería El Corte SRL', $this->owner->razon_social);
        $this->assertSame('30-71234567-8', $this->owner->cuit);

        $subscription = $this->subscription->fresh();
        $this->assertSame('plan-abc', $subscription->mp_preapproval_plan_id);
        // El preapproval real todavía no se conoce en este paso — se resuelve
        // después, en retorno() o en el webhook (el checkout hosteado del
        // plan no permite pasarle external_reference).
        $this->assertNull($subscription->mp_preapproval_id);
    }

    public function test_cuit_invalido_es_rechazado_server_side(): void
    {
        $this->actingAs($this->owner)
            ->from(route('owner.suscripcion.index'))
            ->post(route('owner.suscripcion.activate'), ['cuit' => 'no-es-un-cuit'])
            ->assertSessionHasErrors('cuit');

        $this->assertNull($this->subscription->fresh()->mp_preapproval_plan_id);
    }

    public function test_los_datos_fiscales_son_opcionales(): void
    {
        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('createPreapprovalPlan')
                ->once()
                ->andReturn($this->fakePreapprovalPlan('plan-abc', 'https://mercadopago.test/checkout'));
        });

        $this->actingAs($this->owner)
            ->post(route('owner.suscripcion.activate'), ['billing_cycle' => 'monthly'])
            ->assertRedirect('https://mercadopago.test/checkout');
    }

    public function test_activar_con_preapproval_ya_autorizado_no_crea_otro_plan(): void
    {
        $this->subscription->update([
            'mp_preapproval_plan_id' => 'plan-abc',
            'mp_preapproval_id' => 'preapproval-abc',
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldNotReceive('createPreapprovalPlan');
        });

        $this->actingAs($this->owner)
            ->post(route('owner.suscripcion.activate'), ['billing_cycle' => 'monthly'])
            ->assertRedirect(route('owner.suscripcion.index'));
    }

    public function test_retorno_resuelve_el_preapproval_real_y_activa_la_suscripcion(): void
    {
        $this->subscription->update(['mp_preapproval_plan_id' => 'plan-abc']);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('findPreapprovalByPlan')
                ->once()
                ->with('plan-abc')
                ->andReturn($this->fakePreapproval('preapproval-real', 'plan-abc'));
        });

        $this->actingAs($this->owner)
            ->get(route('owner.suscripcion.retorno'))
            ->assertRedirect(route('owner.suscripcion.index'));

        $subscription = $this->subscription->fresh();
        $this->assertSame('preapproval-real', $subscription->mp_preapproval_id);
        $this->assertSame('active', $subscription->status);
        $this->assertSame('2026-08-15', $subscription->mp_next_payment_date->toDateString());
    }

    public function test_retorno_sin_preapproval_resuelto_todavia_no_rompe(): void
    {
        $this->subscription->update(['mp_preapproval_plan_id' => 'plan-abc']);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('findPreapprovalByPlan')->once()->andReturn(null);
        });

        $this->actingAs($this->owner)
            ->get(route('owner.suscripcion.retorno'))
            ->assertRedirect(route('owner.suscripcion.index'));

        $this->assertNull($this->subscription->fresh()->mp_preapproval_id);
    }

    /**
     * Regresión: puede haber más de un preapproval para el mismo plan (un
     * intento cancelado dentro del checkout de MP + un reintento exitoso) —
     * si una visita anterior a retorno() enlazó el cancelado, una segunda
     * visita debe poder autocorregirse en vez de quedar bloqueada para
     * siempre por "ya tiene mp_preapproval_id".
     */
    public function test_retorno_se_reintenta_si_la_suscripcion_no_quedo_activa_todavia(): void
    {
        $this->subscription->update([
            'mp_preapproval_plan_id' => 'plan-abc',
            'mp_preapproval_id' => 'preapproval-cancelado',
            'status' => 'trial',
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('findPreapprovalByPlan')
                ->once()
                ->with('plan-abc')
                ->andReturn($this->fakePreapproval('preapproval-bueno', 'plan-abc'));
        });

        $this->actingAs($this->owner)
            ->get(route('owner.suscripcion.retorno'))
            ->assertRedirect(route('owner.suscripcion.index'));

        $subscription = $this->subscription->fresh();
        $this->assertSame('preapproval-bueno', $subscription->mp_preapproval_id);
        $this->assertSame('active', $subscription->status);
    }

    public function test_retorno_no_reintenta_si_la_suscripcion_ya_esta_activa(): void
    {
        $this->subscription->update([
            'mp_preapproval_plan_id' => 'plan-abc',
            'mp_preapproval_id' => 'preapproval-bueno',
            'status' => 'active',
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldNotReceive('findPreapprovalByPlan');
        });

        $this->actingAs($this->owner)
            ->get(route('owner.suscripcion.retorno'))
            ->assertRedirect(route('owner.suscripcion.index'));
    }

    public function test_upgrade_bloqueado_si_el_uso_actual_excede_el_plan_destino(): void
    {
        Barberia::factory()->count(2)->create(['owner_id' => $this->owner->id, 'active' => true]);
        $planChico = Plan::factory()->create(['max_barberias' => 1, 'is_custom' => false, 'active' => true]);

        $this->actingAs($this->owner)
            ->from(route('owner.suscripcion.index'))
            ->post(route('owner.suscripcion.upgrade'), ['plan_id' => $planChico->id])
            ->assertSessionHasErrors('plan_id');

        $this->assertNotSame($planChico->id, $this->subscription->fresh()->plan_id);
    }

    public function test_upgrade_valido_cambia_el_plan_y_actualiza_el_monto_del_preapproval(): void
    {
        $this->subscription->update(['mp_preapproval_id' => 'preapproval-abc']);
        $planGrande = Plan::factory()->create([
            'price' => 25000,
            'max_barberias' => null,
            'max_barberos' => null,
            'is_custom' => false,
            'active' => true,
        ]);

        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('chargeAmountFor')->andReturn(25000.0);
            $mock->shouldReceive('updateAmount')
                ->once()
                ->with('preapproval-abc', 25000.0);
        });

        $this->actingAs($this->owner)
            ->post(route('owner.suscripcion.upgrade'), ['plan_id' => $planGrande->id])
            ->assertRedirect(route('owner.suscripcion.index'));

        $subscription = $this->subscription->fresh();
        $this->assertSame($planGrande->id, $subscription->plan_id);
        $this->assertNull($subscription->custom_price);
    }

    public function test_un_barbero_no_puede_acceder_al_panel_de_suscripcion(): void
    {
        $barberia = Barberia::factory()->create(['owner_id' => $this->owner->id]);
        $barber = User::factory()->create(['role' => 'barber', 'barberia_id' => $barberia->id]);

        $this->actingAs($barber)
            ->get(route('owner.suscripcion.index'))
            ->assertForbidden();
    }
}
