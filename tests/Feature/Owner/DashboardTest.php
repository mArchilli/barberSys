<?php

namespace Tests\Feature\Owner;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\Gasto;
use App\Models\GastoRegistro;
use App\Models\MedioPago;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::create(2026, 7, 15, 12, 0, 0, 'America/Argentina/Buenos_Aires'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_dashboard_entrega_la_nueva_estructura_con_metricas_del_mes_actual(): void
    {
        $data = $this->createBarberiaData();
        $plan = Plan::factory()->create(['features' => ['ranking_barberos' => true]]);
        Subscription::factory()->create([
            'owner_id' => $data['owner']->id,
            'plan_id' => $plan->id,
        ]);

        $this->createCorte($data, ['price' => 1000, 'performed_at' => '2026-07-15']);
        $this->createCorte($data, [
            'price' => 2000,
            'performed_at' => '2026-07-15',
            'medio_pago_id' => $data['transferencia']->id,
        ]);
        $this->createCorte($data, ['price' => 500, 'performed_at' => '2026-07-14']);
        $this->createCorte($data, ['price' => 900, 'performed_at' => '2026-06-30']);

        $gasto = Gasto::factory()->create([
            'barberia_id' => $data['barberia']->id,
            'amount' => 400,
        ]);
        GastoRegistro::factory()->create([
            'gasto_id' => $gasto->id,
            'barberia_id' => $data['barberia']->id,
            'amount' => 400,
            'month' => '2026-07-01',
        ]);

        $response = $this->actingAs($data['owner'])
            ->get(route('owner.barberias.dashboard', $data['barberia']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Owner/Barberias/Dashboard')
            ->where('period.mode', 'month')
            ->where('period.start', '2026-07-01')
            ->where('period.end', '2026-07-15')
            ->where('kpis.facturacion', 3500)
            ->where('kpis.neto', 3000)
            ->where('kpis.cortes', 3)
            ->where('kpis.ticketPromedio', 1166.67)
            ->where('kpis.hoy', 3000)
            ->where('rankingBarberosEnabled', true)
            ->has('porBarbero', 1)
            ->where('porBarbero.0.name', $data['barbero']->name)
            ->where('porBarbero.0.total', 3500)
            ->has('porServicio', 1)
            ->has('porMedioPago', 2)
            ->where('cierreCaja.total', 3000)
            ->where('cierreCaja.cortes', 2)
            ->where('gestion.gastos', 400)
            ->where('gestion.sueldos', 100)
            ->where('gestion.neto', 3000)
            ->where('evolucionFacturacion.granularity', 'day')
            ->has('evolucionFacturacion.items', 15)
            ->where('evolucionFacturacion.items.0.start', '2026-07-01')
            ->where('evolucionFacturacion.items.13.total', 500)
            ->where('evolucionFacturacion.items.14.total', 3000)
            ->has('actividadReciente', 4)
            ->has('alertas')
        );
    }

    public function test_filtro_semana_usa_desde_el_lunes_hasta_hoy(): void
    {
        $data = $this->createBarberiaData();

        $this->createCorte($data, ['price' => 700, 'performed_at' => '2026-07-12']);
        $this->createCorte($data, ['price' => 1000, 'performed_at' => '2026-07-13']);
        $this->createCorte($data, ['price' => 2000, 'performed_at' => '2026-07-14']);
        $this->createCorte($data, ['price' => 3000, 'performed_at' => '2026-07-15']);

        $response = $this->actingAs($data['owner'])
            ->get(route('owner.barberias.dashboard', [
                'barberia' => $data['barberia'],
                'preset' => 'week',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('period.mode', 'week')
            ->where('period.start', '2026-07-13')
            ->where('period.end', '2026-07-15')
            ->where('kpis.facturacion', 6000)
            ->where('kpis.cortes', 3)
            ->has('evolucionFacturacion.items', 3)
            ->where('evolucionFacturacion.items.0.total', 1000)
            ->where('evolucionFacturacion.items.2.total', 3000)
        );
    }

    public function test_filtro_hoy_agrupa_la_facturacion_por_hora_de_registro(): void
    {
        $data = $this->createBarberiaData();

        $this->createCorte($data, [
            'price' => 1000,
            'performed_at' => '2026-07-15',
            'created_at' => '2026-07-15 17:10:00',
        ]);
        $this->createCorte($data, [
            'price' => 500,
            'performed_at' => '2026-07-15',
            'created_at' => '2026-07-15 17:45:00',
        ]);
        $this->createCorte($data, [
            'price' => 2000,
            'performed_at' => '2026-07-15',
            'created_at' => '2026-07-15 19:05:00',
        ]);

        $response = $this->actingAs($data['owner'])
            ->get(route('owner.barberias.dashboard', [
                'barberia' => $data['barberia'],
                'day' => '2026-07-15',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('period.mode', 'day')
            ->where('evolucionFacturacion.granularity', 'hour')
            ->has('evolucionFacturacion.items', 3)
            ->where('evolucionFacturacion.items.0.start', '2026-07-15T17:00:00')
            ->where('evolucionFacturacion.items.0.label', '17:00')
            ->where('evolucionFacturacion.items.0.total', 1500)
            ->where('evolucionFacturacion.items.0.cantidad', 2)
            ->where('evolucionFacturacion.items.1.label', '18:00')
            ->where('evolucionFacturacion.items.1.total', 0)
            ->where('evolucionFacturacion.items.1.cantidad', 0)
            ->where('evolucionFacturacion.items.2.label', '19:00')
            ->where('evolucionFacturacion.items.2.total', 2000)
            ->where('evolucionFacturacion.items.2.cantidad', 1)
        );
    }

    public function test_rango_personalizado_de_un_dia_conserva_la_agrupacion_diaria(): void
    {
        $data = $this->createBarberiaData();

        $this->createCorte($data, [
            'price' => 1200,
            'performed_at' => '2026-07-15',
            'created_at' => '2026-07-15 17:10:00',
        ]);

        $response = $this->actingAs($data['owner'])
            ->get(route('owner.barberias.dashboard', [
                'barberia' => $data['barberia'],
                'from' => '2026-07-15',
                'to' => '2026-07-15',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('period.mode', 'range')
            ->where('evolucionFacturacion.granularity', 'day')
            ->has('evolucionFacturacion.items', 1)
            ->where('evolucionFacturacion.items.0.start', '2026-07-15')
            ->where('evolucionFacturacion.items.0.total', 1200)
        );
    }

    public function test_rango_personalizado_normaliza_fechas_y_completa_dias_sin_actividad(): void
    {
        $data = $this->createBarberiaData();

        $this->createCorte($data, ['price' => 1200, 'performed_at' => '2026-07-10']);
        $this->createCorte($data, ['price' => 800, 'performed_at' => '2026-07-11']);
        $this->createCorte($data, ['price' => 5000, 'performed_at' => '2026-07-13']);

        $response = $this->actingAs($data['owner'])
            ->get(route('owner.barberias.dashboard', [
                'barberia' => $data['barberia'],
                'from' => '2026-07-12',
                'to' => '2026-07-10',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('period.mode', 'range')
            ->where('period.start', '2026-07-10')
            ->where('period.end', '2026-07-12')
            ->where('kpis.facturacion', 2000)
            ->where('kpis.cortes', 2)
            ->has('evolucionFacturacion.items', 3)
            ->where('evolucionFacturacion.items.0.total', 1200)
            ->where('evolucionFacturacion.items.1.total', 800)
            ->where('evolucionFacturacion.items.2.total', 0)
        );
    }

    public function test_dashboard_sin_movimientos_devuelve_ceros_y_estados_vacios(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)
            ->get(route('owner.barberias.dashboard', [
                'barberia' => $barberia,
                'day' => '2026-07-15',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('period.mode', 'day')
            ->where('kpis.facturacion', 0)
            ->where('kpis.cortes', 0)
            ->where('kpis.ticketPromedio', 0)
            ->where('kpis.hoy', 0)
            ->where('cierreCaja.ticketPromedio', 0)
            ->has('porMedioPago', 0)
            ->has('porServicio', 0)
            ->has('actividadReciente', 0)
            ->where('evolucionFacturacion.granularity', 'hour')
            ->has('evolucionFacturacion.items', 0)
            ->has('alertas', 3)
        );
    }

    public function test_dashboard_entrega_solo_catalogos_activos_de_la_barberia_para_la_carga_rapida(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        $otraBarberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        $servicioActivo = Servicio::factory()->create([
            'barberia_id' => $barberia->id,
            'name' => 'Corte habilitado',
            'active' => true,
        ]);
        Servicio::factory()->create([
            'barberia_id' => $barberia->id,
            'name' => 'Corte deshabilitado',
            'active' => false,
        ]);
        Servicio::factory()->create([
            'barberia_id' => $otraBarberia->id,
            'name' => 'Corte de otra barbería',
            'active' => true,
        ]);

        $medioPagoActivo = MedioPago::factory()->create([
            'barberia_id' => $barberia->id,
            'name' => 'Efectivo habilitado',
            'active' => true,
        ]);
        MedioPago::factory()->create([
            'barberia_id' => $barberia->id,
            'name' => 'Tarjeta deshabilitada',
            'active' => false,
        ]);
        MedioPago::factory()->create([
            'barberia_id' => $otraBarberia->id,
            'name' => 'Transferencia de otra barbería',
            'active' => true,
        ]);

        $response = $this->actingAs($owner)
            ->get(route('owner.barberias.dashboard', $barberia));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('quickCut.servicios', 1)
            ->where('quickCut.servicios.0.id', $servicioActivo->id)
            ->where('quickCut.servicios.0.name', 'Corte habilitado')
            ->has('quickCut.mediosPago', 1)
            ->where('quickCut.mediosPago.0.id', $medioPagoActivo->id)
            ->where('quickCut.mediosPago.0.name', 'Efectivo habilitado')
            ->where('quickCut.routes.store', route('owner.barberias.cortes.store', $barberia))
            ->where('quickCut.routes.search', route('owner.barberias.clientes.search', $barberia))
        );
    }

    private function createBarberiaData(): array
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        $barbero = User::factory()->barber()->create([
            'barberia_id' => $barberia->id,
            'salary_type' => 'fixed',
            'salary_amount' => 100,
        ]);

        return [
            'owner' => $owner,
            'barberia' => $barberia,
            'barbero' => $barbero,
            'servicio' => Servicio::factory()->create(['barberia_id' => $barberia->id, 'name' => 'Corte clásico']),
            'cliente' => Cliente::factory()->create(['barberia_id' => $barberia->id, 'name' => 'Cliente Uno']),
            'efectivo' => MedioPago::factory()->create(['barberia_id' => $barberia->id, 'name' => 'Efectivo']),
            'transferencia' => MedioPago::factory()->create(['barberia_id' => $barberia->id, 'name' => 'Transferencia']),
        ];
    }

    private function createCorte(array $data, array $attributes = []): Corte
    {
        return Corte::factory()->create([
            'barberia_id' => $data['barberia']->id,
            'barbero_id' => $data['barbero']->id,
            'servicio_id' => $data['servicio']->id,
            'cliente_id' => $data['cliente']->id,
            'medio_pago_id' => $data['efectivo']->id,
            ...$attributes,
        ]);
    }
}
