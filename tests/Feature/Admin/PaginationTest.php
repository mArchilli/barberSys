<?php

namespace Tests\Feature\Admin;

use App\Models\Coupon;
use App\Models\Plan;
use App\Models\Survey;
use App\Models\SurveyAnswer;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Demuestra que cada listado admin paginado realmente trae solo una página
 * de resultados con más registros que el tamaño de página — no asume que
 * paginate() "simplemente funciona".
 */
class PaginationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_owners_index_pagina_de_a_20(): void
    {
        $admin = $this->admin();

        User::factory()->owner()->count(25)->create();

        $primeraPagina = $this->actingAs($admin)->get(route('admin.owners.index'));

        $primeraPagina->assertOk();
        $primeraPagina->assertInertia(fn (Assert $page) => $page
            ->has('owners.data', 20)
            ->where('owners.total', 25)
            ->where('owners.current_page', 1)
            ->where('owners.last_page', 2)
        );

        $segundaPagina = $this->actingAs($admin)->get(route('admin.owners.index', ['page' => 2]));

        $segundaPagina->assertInertia(fn (Assert $page) => $page->has('owners.data', 5));
    }

    public function test_owners_index_preserva_el_filtro_de_busqueda_al_paginar(): void
    {
        $admin = $this->admin();

        User::factory()->owner()->count(25)->create(['name' => 'Ruido']);
        User::factory()->owner()->count(3)->create(['name' => 'Encontrame']);

        $response = $this->actingAs($admin)
            ->get(route('admin.owners.index', ['search' => 'Encontrame', 'page' => 1]));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('owners.data', 3)
            ->where('owners.total', 3)
            ->where('filters.search', 'Encontrame')
        );
    }

    public function test_coupons_index_pagina_de_a_15(): void
    {
        $admin = $this->admin();

        for ($i = 0; $i < 18; $i++) {
            Coupon::create([
                'code' => "CODE{$i}",
                'type' => 'percentage',
                'value' => 10,
                'active' => true,
                'created_by' => $admin->id,
            ]);
        }

        $response = $this->actingAs($admin)->get(route('admin.coupons.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('coupons.data', 15)
            ->where('coupons.total', 18)
        );
    }

    public function test_surveys_index_pagina_de_a_15(): void
    {
        $admin = $this->admin();

        for ($i = 0; $i < 18; $i++) {
            Survey::create([
                'title' => "Encuesta {$i}",
                'target_audience' => 'owner',
                'active' => true,
                'reward_type' => 'none',
                'created_by' => $admin->id,
            ]);
        }

        $response = $this->actingAs($admin)->get(route('admin.surveys.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('surveys.data', 15)
            ->where('surveys.total', 18)
        );
    }

    public function test_plans_index_pagina_de_a_10(): void
    {
        $admin = $this->admin();

        Plan::factory()->count(12)->create();

        $response = $this->actingAs($admin)->get(route('admin.plans.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('plans.data', 10)
            ->where('plans.total', 12)
        );
    }

    // No es paginación (resultados() es un reporte agregado, no un listado
    // navegable), pero sí demuestra el limit(100) que reemplazó al pluck()
    // sin límite sobre las respuestas de texto libre.
    public function test_resultados_de_encuesta_limita_las_respuestas_de_texto_a_100(): void
    {
        $admin = $this->admin();

        $survey = Survey::create([
            'title' => 'Encuesta con texto libre',
            'target_audience' => 'owner',
            'active' => true,
            'reward_type' => 'none',
            'created_by' => $admin->id,
        ]);

        $question = SurveyQuestion::create([
            'survey_id' => $survey->id,
            'type' => 'text',
            'question_text' => '¿Algo para agregar?',
            'order' => 1,
        ]);

        for ($i = 0; $i < 120; $i++) {
            $owner = User::factory()->owner()->create();

            $response = SurveyResponse::create([
                'survey_id' => $survey->id,
                'user_id' => $owner->id,
                'status' => 'completed',
            ]);

            SurveyAnswer::create([
                'survey_response_id' => $response->id,
                'survey_question_id' => $question->id,
                'text_value' => "Respuesta {$i}",
            ]);
        }

        $response = $this->actingAs($admin)->get(route('admin.surveys.resultados', $survey->id));

        $response->assertInertia(fn (Assert $page) => $page->has('questions.0.answers', 100));
    }
}
