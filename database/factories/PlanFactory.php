<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'slug' => fake()->unique()->slug(2),
            'max_barberias' => 1,
            'max_barberos' => 3,
            'price' => fake()->randomFloat(2, 10, 100),
            'is_custom' => false,
            'active' => true,
        ];
    }

    public function unlimited(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_barberias' => null,
            'max_barberos' => null,
        ]);
    }
}
