<?php

namespace Tests\Feature;

use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PricingDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_pricing_details_page_lists_every_active_plan(): void
    {
        $this->seed(PlanSeeder::class);

        $response = $this->get(route('pricing.details'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('PricingDetails')
                ->has('plans', 4)
                ->where('plans.0.name', 'Base')
                ->where('plans.1.name', 'Profesional')
                ->where('plans.2.name', 'Expansión')
                ->where('plans.3.name', 'Cadena')
                ->where('plans.3.is_custom', true)
            );
    }
}
