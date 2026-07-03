<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_barber_no_puede_acceder_a_rutas_de_owner(): void
    {
        $barber = User::factory()->barber()->create();

        $this->actingAs($barber)->get(route('owner.barberias.index'))->assertForbidden();
        $this->actingAs($barber)->get(route('owner.consolidado'))->assertForbidden();
    }

    public function test_barber_no_puede_acceder_a_rutas_de_admin(): void
    {
        $barber = User::factory()->barber()->create();

        $this->actingAs($barber)->get(route('admin.dashboard'))->assertForbidden();
        $this->actingAs($barber)->get(route('admin.owners.index'))->assertForbidden();
    }

    public function test_owner_no_puede_acceder_a_rutas_de_barber(): void
    {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route('barber.dashboard'))->assertForbidden();
        $this->actingAs($owner)->get(route('barber.cortes.index'))->assertForbidden();
    }

    public function test_owner_no_puede_acceder_a_rutas_de_admin(): void
    {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route('admin.dashboard'))->assertForbidden();
    }

    public function test_admin_no_puede_acceder_a_rutas_de_owner_ni_barber(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('owner.barberias.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('barber.dashboard'))->assertForbidden();
    }

    public function test_admin_puede_acceder_a_sus_propias_rutas(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
        $this->actingAs($admin)->get(route('admin.owners.index'))->assertOk();
    }

    public function test_owner_puede_acceder_a_sus_propias_rutas(): void
    {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->get(route('owner.barberias.index'))->assertOk();
    }

    public function test_barber_puede_acceder_a_sus_propias_rutas(): void
    {
        $barber = User::factory()->barber()->create();

        $this->actingAs($barber)->get(route('barber.dashboard'))->assertOk();
    }

    public function test_usuario_no_autenticado_es_redirigido_al_login_en_rutas_protegidas(): void
    {
        $this->get(route('owner.barberias.index'))->assertRedirect(route('login'));
        $this->get(route('barber.dashboard'))->assertRedirect(route('login'));
        $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    }
}
