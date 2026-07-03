<?php

namespace Database\Factories;

use App\Models\Barberia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\MedioPago>
 */
class MedioPagoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barberia_id' => Barberia::factory(),
            'name' => fake()->randomElement(['Efectivo', 'Transferencia', 'Tarjeta']),
            'active' => true,
        ];
    }
}
