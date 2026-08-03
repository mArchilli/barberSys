<?php

namespace Tests\Feature\Owner;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Regresión de performance para el fix del cálculo de sueldos por comisión en
 * DashboardController::index() (antes: 1 query SUM(price) por barbero
 * comisionista vía ComisionCalculator::calcular(); ahora: una sola query
 * agregada GROUP BY barbero_id). No se assertea un techo absoluto de queries
 * a propósito: BelongsToBarberiaScope todavía re-consulta las barberías del
 * owner en cada query scopeada (fix aparte, pendiente), así que el total
 * "de base" del Dashboard ya es alto por esa razón, ajena a este fix. Lo que
 * importa acá es que la cantidad de queries NO escale con la cantidad de
 * barberos — se mide la diferencia entre 3 y 20, no un número absoluto.
 */
class DashboardQueryCountTest extends TestCase
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

    public function test_dashboard_no_escala_queries_con_la_cantidad_de_barberos_comisionistas(): void
    {
        $queryCountCon3 = $this->dashboardQueryCount(3);
        $queryCountCon20 = $this->dashboardQueryCount(20);

        // Antes del fix, la diferencia entre 3 y 20 barberos hubiera sido
        // ~17 queries (una por barbero de más). Después del fix, la
        // agregación es una sola query sin importar cuántos barberos haya —
        // el margen de 5 deja lugar a variación normal sin ser un número
        // mágico exacto.
        $this->assertLessThan(
            5,
            $queryCountCon20 - $queryCountCon3,
            "La diferencia de queries entre 3 y 20 barberos comisionistas fue {$queryCountCon20} - {$queryCountCon3} — sospecha de N+1 reintroducido en el cálculo de sueldos."
        );
    }

    private function dashboardQueryCount(int $cantidadBarberos): int
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);
        $cliente = Cliente::factory()->create(['barberia_id' => $barberia->id]);
        $medioPago = MedioPago::factory()->create(['barberia_id' => $barberia->id]);

        for ($i = 0; $i < $cantidadBarberos; $i++) {
            $barbero = User::factory()->barber()->create([
                'barberia_id' => $barberia->id,
                'salary_type' => 'commission',
                'commission_pct' => 40,
            ]);

            Corte::factory()->create([
                'barberia_id' => $barberia->id,
                'barbero_id' => $barbero->id,
                'servicio_id' => $servicio->id,
                'cliente_id' => $cliente->id,
                'medio_pago_id' => $medioPago->id,
                'price' => 1000,
                'performed_at' => '2026-07-10',
            ]);
        }

        // flushQueryLog() es necesario porque este helper se llama más de una
        // vez en el mismo test (3 barberos y 20 barberos): disableQueryLog()
        // no vacía el log acumulado, solo deja de agregar entradas nuevas.
        DB::flushQueryLog();
        DB::enableQueryLog();
        $response = $this->actingAs($owner)
            ->get(route('owner.barberias.dashboard', $barberia));
        $queryCount = count(DB::getQueryLog());
        DB::disableQueryLog();

        $response->assertOk();

        return $queryCount;
    }
}
