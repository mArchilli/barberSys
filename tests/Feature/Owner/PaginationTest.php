<?php

namespace Tests\Feature\Owner;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Demuestra que Clientes y Barberos realmente paginan (no traen todo el set)
 * y que mover el buscador a server-side no rompió ni la búsqueda ni los
 * contadores resumen (que antes se calculaban en el cliente sobre el array
 * completo — ahora deben venir del backend, sobre el total real, no sobre
 * la página actual).
 */
class PaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_clientes_index_pagina_de_a_20(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        Cliente::factory()->count(25)->create(['barberia_id' => $barberia->id]);

        $primeraPagina = $this->actingAs($owner)
            ->get(route('owner.barberias.clientes.index', $barberia));

        $primeraPagina->assertOk();
        $primeraPagina->assertInertia(fn (Assert $page) => $page
            ->has('clientes.data', 20)
            ->where('clientes.total', 25)
            ->where('stats.total', 25)
        );

        $segundaPagina = $this->actingAs($owner)
            ->get(route('owner.barberias.clientes.index', ['barberia' => $barberia, 'page' => 2]));

        $segundaPagina->assertInertia(fn (Assert $page) => $page->has('clientes.data', 5));
    }

    public function test_clientes_index_busca_server_side_sobre_toda_la_cartera_no_solo_la_pagina(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        // 25 clientes de ruido (más que el tamaño de página) + 1 que matchea
        // la búsqueda: si el filtro corriera client-side sobre la página
        // actual, "Encontrame" podría quedar fuera de los primeros 20 y el
        // test fallaría.
        Cliente::factory()->count(25)->create(['barberia_id' => $barberia->id, 'name' => 'Cliente Ruido']);
        Cliente::factory()->create(['barberia_id' => $barberia->id, 'name' => 'Encontrame Rapido']);

        $response = $this->actingAs($owner)
            ->get(route('owner.barberias.clientes.index', ['barberia' => $barberia, 'search' => 'Encontrame']));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('clientes.data', 1)
            ->where('clientes.data.0.name', 'Encontrame Rapido')
            ->where('filters.search', 'Encontrame')
        );
    }

    public function test_clientes_index_contadores_resumen_cuentan_toda_la_cartera_no_solo_la_pagina(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        Cliente::factory()->count(22)->create(['barberia_id' => $barberia->id, 'active' => true]);
        Cliente::factory()->count(3)->create(['barberia_id' => $barberia->id, 'active' => false]);

        $response = $this->actingAs($owner)
            ->get(route('owner.barberias.clientes.index', $barberia));

        // La página trae 20 (paginado), pero los contadores deben reflejar
        // los 25 reales de la barbería, no los 20 visibles.
        $response->assertInertia(fn (Assert $page) => $page
            ->has('clientes.data', 20)
            ->where('stats.total', 25)
            ->where('stats.activos', 22)
        );
    }

    public function test_barberos_index_pagina_de_a_15(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        User::factory()->count(20)->create([
            'role' => 'barber',
            'barberia_id' => $barberia->id,
            'active' => true,
            'salary_type' => 'fixed',
            'salary_amount' => 1000,
        ]);

        $primeraPagina = $this->actingAs($owner)
            ->get(route('owner.barberias.barberos.index', $barberia));

        $primeraPagina->assertOk();
        $primeraPagina->assertInertia(fn (Assert $page) => $page
            ->has('barberos.data', 15)
            ->where('barberos.total', 20)
            ->where('stats.total', 20)
        );

        $segundaPagina = $this->actingAs($owner)
            ->get(route('owner.barberias.barberos.index', ['barberia' => $barberia, 'page' => 2]));

        $segundaPagina->assertInertia(fn (Assert $page) => $page->has('barberos.data', 5));
    }

    public function test_barberos_index_stats_de_sueldo_cuentan_todo_el_equipo_no_solo_la_pagina(): void
    {
        $owner = User::factory()->owner()->create();
        $barberia = Barberia::factory()->create(['owner_id' => $owner->id]);

        User::factory()->count(12)->create([
            'role' => 'barber',
            'barberia_id' => $barberia->id,
            'active' => true,
            'salary_type' => 'fixed',
            'salary_amount' => 1000,
        ]);
        User::factory()->count(8)->create([
            'role' => 'barber',
            'barberia_id' => $barberia->id,
            'active' => true,
            'salary_type' => 'commission',
            'commission_pct' => 40,
        ]);

        $response = $this->actingAs($owner)
            ->get(route('owner.barberias.barberos.index', $barberia));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('barberos.data', 15)
            ->where('stats.total', 20)
            ->where('stats.conSueldoFijo', 12)
        );
    }
}
