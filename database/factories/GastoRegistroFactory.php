<?php

namespace Database\Factories;

use App\Models\Barberia;
use App\Models\Gasto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\GastoRegistro>
 */
class GastoRegistroFactory extends Factory
{
    public function definition(): array
    {
        return [
            'gasto_id' => Gasto::factory(),
            'barberia_id' => Barberia::factory(),
            'amount' => fake()->randomFloat(2, 1000, 50000),
            'month' => now()->startOfMonth()->toDateString(),
            'is_deleted_for_month' => false,
        ];
    }
}
