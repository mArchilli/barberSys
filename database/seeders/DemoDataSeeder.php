<?php

namespace Database\Seeders;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\Gasto;
use App\Models\GastoRegistro;
use App\Models\MedioPago;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

/**
 * Carga un owner completo por cada plan del catálogo (con barberías, barberos,
 * servicios, medios de pago, clientes, gastos y cortes de los últimos 3 meses)
 * para poder mostrar el dashboard y el módulo financiero con datos reales.
 */
class DemoDataSeeder extends Seeder
{
    private const SERVICIOS = [
        ['name' => 'Corte Clásico', 'price' => 3500],
        ['name' => 'Corte + Barba', 'price' => 5500],
        ['name' => 'Afeitado Premium', 'price' => 4200],
        ['name' => 'Corte Niño', 'price' => 2800],
    ];

    private const MEDIOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia'];

    private const CLIENTES_POOL = [
        'Julián Fernández', 'Nicolás Gómez', 'Martina López', 'Sofía Rodríguez',
        'Mateo Díaz', 'Valentina Torres', 'Franco Sosa', 'Camila Romero',
        'Lucas Benítez', 'Agustina Molina', 'Tomás Acosta', 'Florencia Ibáñez',
    ];

    /** @var array<int, array{0: string, 1: string, 2: string, 3: string}> */
    private array $credentials = [];

    private int $clienteCursor = 0;

    public function run(): void
    {
        $config = [
            'plan-1' => ['barberias' => 1, 'barberos_por_barberia' => 2],
            'plan-2' => ['barberias' => 2, 'barberos_por_barberia' => 2],
            'plan-3' => ['barberias' => 3, 'barberos_por_barberia' => 2],
            'plan-4' => ['barberias' => 2, 'barberos_por_barberia' => 2, 'custom_max_barberias' => 3, 'custom_max_barberos' => 15],
        ];

        foreach ($config as $slug => $settings) {
            $this->seedOwnerParaPlan($slug, $settings);
        }

        $this->credentials[] = ['admin', 'admin@barbersys.test', 'password', '—'];

        $this->command?->newLine();
        $this->command?->info('Usuarios demo listos:');
        $this->command?->table(['Rol', 'Email', 'Password', 'Detalle'], $this->credentials);
        $this->command?->newLine();
    }

    private function seedOwnerParaPlan(string $slug, array $settings): void
    {
        $plan = Plan::where('slug', $slug)->firstOrFail();

        $ownerEmail = "owner.{$slug}@barbersys.test";
        $owner = User::firstOrCreate(
            ['email' => $ownerEmail],
            [
                'name' => "Owner {$plan->name}",
                'password' => Hash::make('password'),
                'role' => 'owner',
                'active' => true,
                'must_change_password' => false,
            ]
        );

        Subscription::firstOrCreate(
            ['owner_id' => $owner->id],
            [
                'plan_id' => $plan->id,
                'custom_max_barberias' => $settings['custom_max_barberias'] ?? null,
                'custom_max_barberos' => $settings['custom_max_barberos'] ?? null,
                'status' => 'active',
                'starts_at' => now()->subMonths(3)->toDateString(),
                'trial_ends_at' => null,
                'ends_at' => now()->addYear()->toDateString(),
            ]
        );

        $this->credentials[] = ['owner', $ownerEmail, 'password', $plan->name];

        $barberoGlobalIndex = 0;

        for ($b = 1; $b <= $settings['barberias']; $b++) {
            $barberia = Barberia::firstOrCreate(
                ['owner_id' => $owner->id, 'name' => "{$plan->name} - Sucursal {$b}"],
                ['address' => fake()->streetAddress(), 'active' => true]
            );

            $servicios = collect(self::SERVICIOS)->map(
                fn (array $s) => Servicio::firstOrCreate(
                    ['barberia_id' => $barberia->id, 'name' => $s['name']],
                    ['price' => $s['price'], 'active' => true]
                )
            );

            $mediosPago = collect(self::MEDIOS_PAGO)->map(
                fn (string $nombre) => MedioPago::firstOrCreate(
                    ['barberia_id' => $barberia->id, 'name' => $nombre],
                    ['active' => true]
                )
            );

            $clientes = collect(range(1, 6))->map(function () use ($barberia) {
                $nombre = self::CLIENTES_POOL[$this->clienteCursor % count(self::CLIENTES_POOL)];
                $this->clienteCursor++;

                return Cliente::firstOrCreate(
                    ['barberia_id' => $barberia->id, 'name' => $nombre],
                    ['phone' => fake()->numerify('11########'), 'active' => true]
                );
            });

            $barberos = collect();
            for ($i = 1; $i <= $settings['barberos_por_barberia']; $i++) {
                $barberoGlobalIndex++;
                $email = "barbero{$barberoGlobalIndex}.{$slug}@barbersys.test";
                $esComision = $i % 2 === 0;

                $barbero = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => fake()->firstName().' '.fake()->lastName(),
                        'password' => Hash::make('password'),
                        'role' => 'barber',
                        'barberia_id' => $barberia->id,
                        'salary_type' => $esComision ? 'commission' : 'fixed',
                        'salary_amount' => $esComision ? null : 250000,
                        'commission_pct' => $esComision ? 45.00 : null,
                        'active' => true,
                        'must_change_password' => true,
                    ]
                );

                $barberos->push($barbero);
                $this->credentials[] = ['barber', $email, 'password', $barberia->name];
            }

            $this->seedGastos($barberia);
            $this->seedCortes($barberia, $barberos, $servicios, $clientes, $mediosPago);
        }
    }

    private function seedGastos(Barberia $barberia): void
    {
        $gastos = [
            Gasto::firstOrCreate(
                ['barberia_id' => $barberia->id, 'name' => 'Alquiler'],
                ['amount' => fake()->randomFloat(2, 45000, 90000), 'type' => 'fijo', 'is_recurring' => true, 'active' => true]
            ),
            Gasto::firstOrCreate(
                ['barberia_id' => $barberia->id, 'name' => 'Insumos y Productos'],
                ['amount' => fake()->randomFloat(2, 8000, 20000), 'type' => 'variable', 'is_recurring' => true, 'active' => true]
            ),
        ];

        foreach ($gastos as $gasto) {
            foreach ([2, 1, 0] as $mesesAtras) {
                $mes = now()->subMonths($mesesAtras)->startOfMonth()->toDateString();
                $variacion = $gasto->type === 'variable' ? fake()->randomFloat(2, -2000, 3000) : 0;

                GastoRegistro::firstOrCreate(
                    ['gasto_id' => $gasto->id, 'month' => $mes],
                    [
                        'barberia_id' => $barberia->id,
                        'amount' => max(0, $gasto->amount + $variacion),
                        'is_deleted_for_month' => false,
                    ]
                );
            }
        }
    }

    private function seedCortes(Barberia $barberia, Collection $barberos, Collection $servicios, Collection $clientes, Collection $mediosPago): void
    {
        if (Corte::where('barberia_id', $barberia->id)->exists()) {
            return;
        }

        foreach ([2, 1, 0] as $mesesAtras) {
            $inicioMes = now()->subMonths($mesesAtras)->startOfMonth();
            $finMes = $mesesAtras === 0 ? now() : now()->subMonths($mesesAtras)->endOfMonth();

            $cantidad = fake()->numberBetween(15, 25);

            for ($i = 0; $i < $cantidad; $i++) {
                $servicio = $servicios->random();

                Corte::create([
                    'barberia_id' => $barberia->id,
                    'barbero_id' => $barberos->random()->id,
                    'servicio_id' => $servicio->id,
                    'cliente_id' => $clientes->random()->id,
                    'medio_pago_id' => $mediosPago->random()->id,
                    'price' => max(0, $servicio->price + fake()->randomFloat(2, -300, 500)),
                    'performed_at' => fake()->dateTimeBetween($inicioMes, $finMes)->format('Y-m-d'),
                ]);
            }
        }
    }
}
