<?php

namespace Database\Factories;

use App\Models\Barberia;
use App\Models\Servicio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Turno>
 */
class TurnoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barberia_id' => Barberia::factory(),
            'barbero_id' => null,
            'servicio_id' => Servicio::factory(),
            'cliente_nombre' => fake()->name(),
            'cliente_telefono' => fake()->phoneNumber(),
            'fecha' => now()->toDateString(),
            'hora_inicio' => '09:00',
            'hora_fin' => '09:30',
            'status' => 'pendiente',
        ];
    }

    public function confirmado(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmado',
        ]);
    }

    public function cancelado(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelado',
        ]);
    }
}
