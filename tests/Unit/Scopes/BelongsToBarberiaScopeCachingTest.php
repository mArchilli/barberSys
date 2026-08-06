<?php

namespace Tests\Unit\Scopes;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\Gasto;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Apunta directo al mecanismo de BelongsToBarberiaScope, no al total de
 * queries de un endpoint (eso ya lo cubren DashboardQueryCountTest y
 * BusinessMetricsServiceQueryCountTest): cuenta específicamente cuántas veces
 * corre la query que resuelve "¿qué barberías tiene este owner?" cuando
 * varios modelos scopeados distintos se consultan dentro del mismo request.
 * Antes del fix (App\Scopes\BelongsToBarberiaScope::apply(),
 * $user->barberias() con paréntesis) esto daba 1 por cada query scopeada;
 * después (acceso como propiedad, cacheado en la instancia de $user), 1 en
 * total sin importar cuántas.
 */
class BelongsToBarberiaScopeCachingTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_resolucion_de_barberias_del_owner_se_cachea_dentro_del_mismo_request(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);
        Servicio::factory()->create(['barberia_id' => $barberia->id]);
        Cliente::factory()->create(['barberia_id' => $barberia->id]);
        MedioPago::factory()->create(['barberia_id' => $barberia->id]);
        Gasto::factory()->create(['barberia_id' => $barberia->id]);
        Corte::factory()->create(['barberia_id' => $barberia->id]);

        $this->actingAs($owner);

        $resolucionesDeBarberias = 0;

        DB::listen(function ($query) use (&$resolucionesDeBarberias) {
            if (str_contains($query->sql, 'barberias') && str_contains($query->sql, 'owner_id')) {
                $resolucionesDeBarberias++;
            }
        });

        // 5 queries scopeadas sobre 5 modelos distintos — cada una dispara
        // BelongsToBarberiaScope::apply() por separado.
        Servicio::count();
        Cliente::count();
        MedioPago::count();
        Gasto::count();
        Corte::count();

        $this->assertSame(
            1,
            $resolucionesDeBarberias,
            "La query de resolución de barberías del owner corrió {$resolucionesDeBarberias} veces contra 5 queries scopeadas — se esperaba 1 (cacheada en \$user->barberias). Si volvió a subir, revisar que el scope siga accediendo a la relación como propiedad, no como método."
        );
    }
}
