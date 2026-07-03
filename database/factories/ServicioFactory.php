<?php

namespace Database\Factories;

use App\Models\Barberia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Servicio>
 */
class ServicioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barberia_id' => Barberia::factory(),
            'name' => fake()->words(2, true),
            'price' => fake()->randomFloat(2, 500, 5000),
            'active' => true,
        ];
    }
}
