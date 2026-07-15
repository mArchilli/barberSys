<?php

namespace Tests\Feature\MercadoPago;

use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\MercadoPago\MercadoPagoSubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use MercadoPago\Resources\PreApproval;
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

    private function fakePreapproval(string $id, string $initPoint): PreApproval
    {
        $preapproval = new PreApproval;
        $preapproval->id = $id;
        $preapproval->init_point = $initPoint;
        $preapproval->status = 'pending';

        return $preapproval;
    }

    public function test_activar_guarda_datos_fiscales_y_redirige_al_checkout_de_mp(): void
    {
        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('createPreapproval')
                ->once()
                ->andReturn($this->fakePreapproval('preapproval-abc', 'https://mercadopago.test/init'));
        });

        $response = $this->actingAs($this->owner)->post(route('owner.suscripcion.activate'), [
            'razon_social' => 'Barbería El Corte SRL',
            'cuit' => '30-71234567-8',
        ]);

        $response->assertRedirect('https://mercadopago.test/init');

        $this->owner->refresh();
        $this->assertSame('Barbería El Corte SRL', $this->owner->razon_social);
        $this->assertSame('30-71234567-8', $this->owner->cuit);
        $this->assertSame('preapproval-abc', $this->subscription->fresh()->mp_preapproval_id);
    }

    public function test_cuit_invalido_es_rechazado_server_side(): void
    {
        $this->actingAs($this->owner)
            ->from(route('owner.suscripcion.index'))
            ->post(route('owner.suscripcion.activate'), ['cuit' => 'no-es-un-cuit'])
            ->assertSessionHasErrors('cuit');

        $this->assertNull($this->subscription->fresh()->mp_preapproval_id);
    }

    public function test_los_datos_fiscales_son_opcionales(): void
    {
        $this->mock(MercadoPagoSubscriptionService::class, function ($mock) {
            $mock->shouldReceive('createPreapproval')
                ->once()
                ->andReturn($this->fakePreapproval('preapproval-abc', 'https://mercadopago.test/init'));
        });

        $this->actingAs($this->owner)
            ->post(route('owner.suscripcion.activate'), [])
            ->assertRedirect('https://mercadopago.test/init');
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
            $mock->shouldReceive('monthlyAmountFor')->andReturn(25000.0);
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
