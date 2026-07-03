<?php

namespace Database\Factories;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Corte>
 */
class CorteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'barberia_id' => Barberia::factory(),
            'barbero_id' => User::factory()->barber(),
            'servicio_id' => Servicio::factory(),
            'cliente_id' => Cliente::factory(),
            'medio_pago_id' => MedioPago::factory(),
            'price' => fake()->randomFloat(2, 500, 5000),
            'performed_at' => now()->toDateString(),
        ];
    }
}
