<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CorteControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_carga_rapida_crea_el_corte_y_un_cliente_con_sus_datos_de_contacto(): void
    {
        $data = $this->createCatalogo();
        $dashboardUrl = route('owner.barberias.dashboard', [
            'barberia' => $data['barberia'],
            'preset' => 'week',
        ]);

        $response = $this->actingAs($data['owner'])
            ->from($dashboardUrl)
            ->post(route('owner.barberias.cortes.store', $data['barberia']), [
                ...$this->payload($data),
                'cliente_nombre' => 'Ana Torres',
                'cliente_phone' => '+54 9 11 5555-1234',
                'cliente_email' => 'ana@example.com',
            ]);

        $response
            ->assertRedirect($dashboardUrl)
            ->assertSessionHas('success', 'Corte cargado correctamente.');

        $cliente = Cliente::withoutGlobalScopes()
            ->where('barberia_id', $data['barberia']->id)
            ->where('name', 'Ana Torres')
            ->firstOrFail();

        $this->assertSame('+54 9 11 5555-1234', $cliente->phone);
        $this->assertSame('ana@example.com', $cliente->email);

        $this->assertDatabaseHas('cortes', [
            'barberia_id' => $data['barberia']->id,
            'barbero_id' => $data['owner']->id,
            'servicio_id' => $data['servicio']->id,
            'cliente_id' => $cliente->id,
            'medio_pago_id' => $data['medioPago']->id,
            'price' => 1800,
        ]);

        $corte = Corte::withoutGlobalScopes()->where('cliente_id', $cliente->id)->firstOrFail();

        $this->assertSame('2026-07-15', $corte->performed_at->toDateString());
    }

    public function test_carga_rapida_permite_omitir_telefono_y_email(): void
    {
        $data = $this->createCatalogo();

        $this->actingAs($data['owner'])
            ->post(route('owner.barberias.cortes.store', $data['barberia']), [
                ...$this->payload($data),
                'cliente_nombre' => 'Cliente sin contacto',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('clientes', [
            'barberia_id' => $data['barberia']->id,
            'name' => 'Cliente sin contacto',
            'phone' => null,
            'email' => null,
        ]);
        $this->assertDatabaseCount('cortes', 1);
    }

    public function test_carga_rapida_rechaza_un_email_invalido_sin_crear_datos(): void
    {
        $data = $this->createCatalogo();

        $this->actingAs($data['owner'])
            ->from(route('owner.barberias.dashboard', $data['barberia']))
            ->post(route('owner.barberias.cortes.store', $data['barberia']), [
                ...$this->payload($data),
                'cliente_nombre' => 'Cliente inválido',
                'cliente_email' => 'esto-no-es-un-email',
            ])
            ->assertSessionHasErrors('cliente_email');

        $this->assertDatabaseCount('clientes', 0);
        $this->assertDatabaseCount('cortes', 0);
    }

    public function test_carga_rapida_reutiliza_un_cliente_sin_sobrescribir_sus_contactos(): void
    {
        $data = $this->createCatalogo();
        $cliente = Cliente::factory()->create([
            'barberia_id' => $data['barberia']->id,
            'name' => 'Cliente existente',
            'phone' => '11 4000-0000',
            'email' => 'existente@example.com',
        ]);

        $this->actingAs($data['owner'])
            ->post(route('owner.barberias.cortes.store', $data['barberia']), [
                ...$this->payload($data),
                'cliente_id' => $cliente->id,
                'cliente_phone' => '11 9999-9999',
                'cliente_email' => 'nuevo@example.com',
            ])
            ->assertRedirect();

        $cliente->refresh();

        $this->assertSame('11 4000-0000', $cliente->phone);
        $this->assertSame('existente@example.com', $cliente->email);
        $this->assertDatabaseCount('clientes', 1);
        $this->assertDatabaseHas('cortes', ['cliente_id' => $cliente->id]);
    }

    public function test_carga_rapida_completa_los_contactos_faltantes_de_un_cliente_existente(): void
    {
        $data = $this->createCatalogo();
        $cliente = Cliente::factory()->create([
            'barberia_id' => $data['barberia']->id,
            'name' => 'Cliente incompleto',
            'phone' => null,
            'email' => null,
        ]);

        $this->actingAs($data['owner'])
            ->post(route('owner.barberias.cortes.store', $data['barberia']), [
                ...$this->payload($data),
                'cliente_id' => $cliente->id,
                'cliente_phone' => '11 4222-3333',
                'cliente_email' => 'completo@example.com',
            ])
            ->assertRedirect();

        $cliente->refresh();

        $this->assertSame('11 4222-3333', $cliente->phone);
        $this->assertSame('completo@example.com', $cliente->email);
        $this->assertDatabaseCount('clientes', 1);
        $this->assertDatabaseHas('cortes', ['cliente_id' => $cliente->id]);
    }

    private function createCatalogo(): array
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        $servicio = Servicio::factory()->create([
            'barberia_id' => $barberia->id,
            'name' => 'Corte clásico',
            'price' => 1800,
        ]);
        $medioPago = MedioPago::factory()->create([
            'barberia_id' => $barberia->id,
            'name' => 'Efectivo',
        ]);

        return compact('owner', 'barberia', 'servicio', 'medioPago');
    }

    private function payload(array $data): array
    {
        return [
            'servicio_id' => $data['servicio']->id,
            'medio_pago_id' => $data['medioPago']->id,
            'price' => 1800,
            'performed_at' => '2026-07-15',
            'quick_entry' => true,
        ];
    }
}
