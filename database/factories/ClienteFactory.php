<?php

namespace Database\Factories;

use App\Models\Barberia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Cliente>
 */
class ClienteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barberia_id' => Barberia::factory(),
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'active' => true,
        ];
    }
}
