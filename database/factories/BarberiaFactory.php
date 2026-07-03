<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Barberia>
 */
class BarberiaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory()->owner(),
            'name' => fake()->company(),
            'address' => fake()->address(),
            'active' => true,
        ];
    }
}
