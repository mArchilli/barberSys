<?php

namespace Tests\Unit\Services\Admin;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Admin\BusinessMetricsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Regresión de performance, no de resultado: fija un techo (o rango, según el
 * caso) a la cantidad de queries que ejecuta cada método contra un dataset con
 * varias decenas de owners, para que un futuro N+1 (o un full-table-scan sin
 * filtro temprano) lo rompa acá antes que en producción. No hay
 * assertQueryCount en esta versión de Laravel — se arma a mano con
 * DB::enableQueryLog()/getQueryLog().
 */
class BusinessMetricsServiceQueryCountTest extends TestCase
{
    use RefreshDatabase;

    public function test_owners_near_plan_limit_no_escala_con_la_cantidad_de_owners(): void
    {
        $plan = Plan::factory()->create(['max_barberias' => 2, 'max_barberos' => 4]);

        for ($i = 0; $i < 50; $i++) {
            $owner = User::factory()->owner()->create();

            Subscription::factory()->create([
                'owner_id' => $owner->id,
                'plan_id' => $plan->id,
                'status' => 'active',
            ]);

            Barberia::factory()->count(2)->create(['owner_id' => $owner->id]);
        }

        DB::enableQueryLog();
        $resultado = (new BusinessMetricsService)->ownersNearPlanLimit();
        $queryCount = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Antes del fix: ~5 queries POR owner (≈250 con 50 owners), porque
        // PlanLimitService volvía a consultar la suscripción/barberías desde
        // cero por cada uno. El techo de acá es generoso a propósito — no fija
        // un número mágico exacto, solo prueba que NO escala linealmente.
        $this->assertLessThan(
            10,
            $queryCount,
            "ownersNearPlanLimit() ejecutó {$queryCount} queries para 50 owners — sospecha de N+1 reintroducido."
        );

        // Con max_barberias=2 y 2 barberías activas por owner, los 50 quedan
        // exactamente en el límite (ratio 1.0) — confirma que el cálculo en
        // PHP sobre la colección precargada sigue dando el resultado correcto.
        $this->assertCount(50, $resultado);
        $this->assertSame('2/2', $resultado->first()['barberias_label']);
    }

    public function test_new_owners_onboarding_no_agrega_sobre_toda_la_tabla_de_cortes(): void
    {
        // "Ruido": owners viejos, fuera del rango de 30 días, con su propio
        // corte cada uno — represent el dataset grande que la versión anterior
        // barría entera antes de filtrar por fecha de alta.
        for ($i = 0; $i < 40; $i++) {
            $owner = User::factory()->owner()->create(['created_at' => now()->subDays(90)]);
            $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
            $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);
            $medioPago = MedioPago::factory()->create(['barberia_id' => $barberia->id]);

            Corte::factory()->create([
                'barberia_id' => $barberia->id,
                'barbero_id' => User::factory()->barber()->create(['barberia_id' => $barberia->id])->id,
                'servicio_id' => $servicio->id,
                'cliente_id' => Cliente::factory()->create(['barberia_id' => $barberia->id])->id,
                'medio_pago_id' => $medioPago->id,
            ]);
        }

        // Owners recientes: los únicos que newOwnersOnboarding(30) debería devolver.
        $recientes = [];
        for ($i = 0; $i < 5; $i++) {
            $owner = User::factory()->owner()->create(['created_at' => now()->subDays(10)]);
            $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
            Servicio::factory()->create(['barberia_id' => $barberia->id]);
            $recientes[] = $owner->id;
        }

        DB::enableQueryLog();
        $resultado = (new BusinessMetricsService)->newOwnersOnboarding(30);
        $queryCount = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Rango, no techo único: a diferencia de ownersNearPlanLimit (que era
        // N+1 puro), acá el bug original ejecutaba MENOS queries (1, sin el
        // pre-filtro) porque agregaba sobre toda la tabla en una sola consulta
        // gigante — un simple "menor a X" no lo hubiera detectado. El piso de
        // 2 confirma que el pre-filtro (recentOwnerIds) sigue corriendo antes
        // de agregar; el techo de 5 sigue cubriendo un futuro N+1 por owner.
        $this->assertGreaterThanOrEqual(
            2,
            $queryCount,
            'Se esperaba al menos la query de recentOwnerIds + la query agregada — ¿se removió el filtro temprano?'
        );
        $this->assertLessThan(
            5,
            $queryCount,
            "newOwnersOnboarding() ejecutó {$queryCount} queries — sospecha de loop por owner reintroducido."
        );

        $this->assertCount(5, $resultado);
        $this->assertEqualsCanonicalizing($recientes, $resultado->pluck('owner.id')->all());
    }
}
