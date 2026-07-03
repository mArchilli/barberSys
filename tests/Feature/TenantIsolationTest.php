<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Gasto;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function ownerConBarberia(): array
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        return [$owner, $barberia];
    }

    public function test_owner_no_puede_acceder_por_url_directa_a_una_barberia_ajena(): void
    {
        [, $barberiaAjena] = $this->ownerConBarberia();
        $intruso = User::factory()->owner()->create();

        $this->actingAs($intruso)
            ->get(route('owner.barberias.servicios.index', $barberiaAjena))
            ->assertForbidden();

        $this->actingAs($intruso)
            ->get(route('owner.barberias.dashboard', $barberiaAjena))
            ->assertForbidden();
    }

    // El global scope (BelongsToBarberiaScope) filtra el route model binding
    // de {servicio}/{cliente}/{gasto} antes de que el controller llegue a
    // ejecutar su propio chequeo de "authorizeX" — un ID de otro owner ni
    // siquiera resuelve, por eso el resultado es 404 y no 403. Es la capa 1
    // (scope) actuando antes que la capa 3 (controller) descripta en
    // CLAUDE.md.
    public function test_owner_no_puede_editar_servicio_de_otro_owner_aunque_use_su_propia_barberia_en_la_url(): void
    {
        [, $barberiaA] = $this->ownerConBarberia();
        [$ownerB, $barberiaB] = $this->ownerConBarberia();
        $servicioDeA = Servicio::factory()->create(['barberia_id' => $barberiaA->id]);

        $this->actingAs($ownerB)
            ->get(route('owner.barberias.servicios.edit', [$barberiaB, $servicioDeA]))
            ->assertNotFound();

        $this->actingAs($ownerB)
            ->put(route('owner.barberias.servicios.update', [$barberiaB, $servicioDeA]), [
                'name' => 'Hackeado',
                'price' => 1,
                'active' => true,
            ])
            ->assertNotFound();

        $this->assertNotSame('Hackeado', $servicioDeA->fresh()->name);
    }

    // El controller también valida explícitamente que la entidad pertenezca
    // a la barbería del parámetro de ruta, no solo al owner autenticado —
    // este caso (mismo owner, pero servicio de OTRA de sus barberías) es el
    // único donde el global scope no alcanza a bloquear el acceso solo, y
    // por eso sí se ve el 403 del controller.
    public function test_owner_no_puede_editar_servicio_de_su_propia_otra_barberia_pasando_la_barberia_equivocada_en_la_url(): void
    {
        $owner = User::factory()->owner()->create();
        $barberiaX = Barberia::factory()->create(['owner_id' => $owner->id]);
        $barberiaY = Barberia::factory()->create(['owner_id' => $owner->id]);
        $servicioDeX = Servicio::factory()->create(['barberia_id' => $barberiaX->id]);

        $this->actingAs($owner)
            ->get(route('owner.barberias.servicios.edit', [$barberiaY, $servicioDeX]))
            ->assertForbidden();
    }

    public function test_owner_no_puede_editar_cliente_de_otro_owner_aunque_use_su_propia_barberia_en_la_url(): void
    {
        [, $barberiaA] = $this->ownerConBarberia();
        [$ownerB, $barberiaB] = $this->ownerConBarberia();
        $clienteDeA = Cliente::factory()->create(['barberia_id' => $barberiaA->id]);

        $this->actingAs($ownerB)
            ->put(route('owner.barberias.clientes.update', [$barberiaB, $clienteDeA]), [
                'name' => 'Hackeado',
                'active' => true,
            ])
            ->assertNotFound();

        $this->assertNotSame('Hackeado', $clienteDeA->fresh()->name);
    }

    public function test_owner_no_puede_editar_gasto_de_otro_owner_aunque_use_su_propia_barberia_en_la_url(): void
    {
        [, $barberiaA] = $this->ownerConBarberia();
        [$ownerB, $barberiaB] = $this->ownerConBarberia();
        $gastoDeA = Gasto::factory()->create(['barberia_id' => $barberiaA->id]);

        $this->actingAs($ownerB)
            ->put(route('owner.barberias.gastos.update', [$barberiaB, $gastoDeA]), [
                'name' => 'Hackeado',
                'amount' => 1,
                'type' => 'fijo',
                'is_recurring' => false,
                'active' => true,
            ])
            ->assertNotFound();

        $this->assertNotSame('Hackeado', $gastoDeA->fresh()->name);
    }

    public function test_owner_no_puede_cargar_un_corte_usando_catalogo_de_otra_barberia(): void
    {
        [, $barberiaA] = $this->ownerConBarberia();
        [$ownerB, $barberiaB] = $this->ownerConBarberia();

        $servicioDeA = Servicio::factory()->create(['barberia_id' => $barberiaA->id]);
        $medioPagoDeB = MedioPago::factory()->create(['barberia_id' => $barberiaB->id]);

        $this->actingAs($ownerB)
            ->post(route('owner.barberias.cortes.store', $barberiaB), [
                'servicio_id' => $servicioDeA->id,
                'cliente_nombre' => 'Cliente nuevo',
                'medio_pago_id' => $medioPagoDeB->id,
                'price' => 1000,
                'performed_at' => now()->toDateString(),
            ])
            ->assertNotFound();
    }

    public function test_index_de_servicios_no_devuelve_datos_de_otro_owner(): void
    {
        [, $barberiaA] = $this->ownerConBarberia();
        [$ownerB, $barberiaB] = $this->ownerConBarberia();

        Servicio::factory()->create(['barberia_id' => $barberiaA->id, 'name' => 'Corte de A']);
        Servicio::factory()->create(['barberia_id' => $barberiaB->id, 'name' => 'Corte de B']);

        $response = $this->actingAs($ownerB)
            ->get(route('owner.barberias.servicios.index', $barberiaB));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Owner/Servicios/Index')
            ->has('servicios', 1)
            ->where('servicios.0.name', 'Corte de B')
        );
    }
}
