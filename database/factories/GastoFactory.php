<?php

namespace Database\Factories;

use App\Models\Barberia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Gasto>
 */
class GastoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barberia_id' => Barberia::factory(),
            'name' => fake()->words(2, true),
            'amount' => fake()->randomFloat(2, 1000, 50000),
            'type' => 'fijo',
            'is_recurring' => true,
            'active' => true,
        ];
    }
}
