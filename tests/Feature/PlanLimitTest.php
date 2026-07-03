<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_sin_subscription_puede_crear_barberias_sin_limite(): void
    {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 1'])
            ->assertSessionHasNoErrors();

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 2'])
            ->assertSessionHasNoErrors();

        $this->assertSame(2, Barberia::where('owner_id', $owner->id)->count());
    }

    public function test_no_se_puede_crear_barberia_por_encima_del_maximo_del_plan(): void
    {
        $owner = User::factory()->owner()->create();
        $plan = Plan::factory()->create(['max_barberias' => 1]);
        Subscription::factory()->create(['owner_id' => $owner->id, 'plan_id' => $plan->id]);

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 1'])
            ->assertSessionHasNoErrors();

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 2'])
            ->assertSessionHasErrors('plan_limit');

        $this->assertSame(1, Barberia::where('owner_id', $owner->id)->count());
    }

    public function test_override_custom_menor_al_plan_bloquea_antes_que_el_maximo_del_plan(): void
    {
        $owner = User::factory()->owner()->create();
        $plan = Plan::factory()->create(['max_barberias' => 10]);
        Subscription::factory()->create([
            'owner_id' => $owner->id,
            'plan_id' => $plan->id,
            'custom_max_barberias' => 1,
        ]);

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 1'])
            ->assertSessionHasNoErrors();

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 2'])
            ->assertSessionHasErrors('plan_limit');
    }

    public function test_override_custom_en_cero_bloquea_toda_creacion(): void
    {
        $owner = User::factory()->owner()->create();
        $plan = Plan::factory()->create(['max_barberias' => 10]);
        Subscription::factory()->create([
            'owner_id' => $owner->id,
            'plan_id' => $plan->id,
            'custom_max_barberias' => 0,
        ]);

        $this->actingAs($owner)
            ->post(route('owner.barberias.store'), ['name' => 'Barbería 1'])
            ->assertSessionHasErrors('plan_limit');

        $this->assertSame(0, Barberia::where('owner_id', $owner->id)->count());
    }

    public function test_plan_ilimitado_sin_override_permite_crear_barberias_libremente(): void
    {
        $owner = User::factory()->owner()->create();
        $plan = Plan::factory()->unlimited()->create();
        Subscription::factory()->create(['owner_id' => $owner->id, 'plan_id' => $plan->id]);

        for ($i = 1; $i <= 3; $i++) {
            $this->actingAs($owner)
                ->post(route('owner.barberias.store'), ['name' => "Barbería {$i}"])
                ->assertSessionHasNoErrors();
        }

        $this->assertSame(3, Barberia::where('owner_id', $owner->id)->count());
    }

    public function test_no_se_puede_crear_barbero_por_encima_del_maximo_del_plan(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        $plan = Plan::factory()->create(['max_barberos' => 1]);
        Subscription::factory()->create(['owner_id' => $owner->id, 'plan_id' => $plan->id]);

        $payload = fn (string $email) => [
            'name' => 'Barbero',
            'email' => $email,
            'salary_type' => 'fixed',
            'salary_amount' => 1000,
        ];

        $this->actingAs($owner)
            ->post(route('owner.barberias.barberos.store', $barberia), $payload('barbero1@example.com'))
            ->assertSessionHasNoErrors();

        $this->actingAs($owner)
            ->post(route('owner.barberias.barberos.store', $barberia), $payload('barbero2@example.com'))
            ->assertSessionHasErrors('plan_limit');

        $this->assertSame(1, User::where('barberia_id', $barberia->id)->where('role', 'barber')->count());
    }

    public function test_override_custom_de_barberos_tiene_prioridad_sobre_el_plan(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        $plan = Plan::factory()->create(['max_barberos' => 10]);
        Subscription::factory()->create([
            'owner_id' => $owner->id,
            'plan_id' => $plan->id,
            'custom_max_barberos' => 1,
        ]);

        $payload = fn (string $email) => [
            'name' => 'Barbero',
            'email' => $email,
            'salary_type' => 'fixed',
            'salary_amount' => 1000,
        ];

        $this->actingAs($owner)
            ->post(route('owner.barberias.barberos.store', $barberia), $payload('barbero1@example.com'))
            ->assertSessionHasNoErrors();

        $this->actingAs($owner)
            ->post(route('owner.barberias.barberos.store', $barberia), $payload('barbero2@example.com'))
            ->assertSessionHasErrors('plan_limit');
    }
}
