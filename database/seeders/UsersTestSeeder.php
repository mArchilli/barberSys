<?php

namespace Database\Seeders;

use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'estilus.ar@gmail.com'],
            [
                'name' => 'Estilus',
                'password' => Hash::make('Estilusbarber1-'),
                'role' => 'admin',
                'active' => true,
                'must_change_password' => false,
            ]
        );

        $plan3 = Plan::where('slug', 'plan-3')->firstOrFail();

        $owner = User::updateOrCreate(
            ['email' => 'user3@estilus.com'],
            [
                'name' => 'User Plan 3',
                'password' => Hash::make('Estilususer3'),
                'role' => 'owner',
                'active' => true,
                'must_change_password' => false,
            ]
        );

        Subscription::updateOrCreate(
            ['owner_id' => $owner->id],
            [
                'plan_id' => $plan3->id,
                'status' => 'active',
                'billing_cycle' => 'monthly',
                'starts_at' => now()->toDateString(),
                'trial_ends_at' => null,
                'ends_at' => null,
                'mp_preapproval_id' => null,
                'mp_preapproval_plan_id' => null,
            ]
        );

        // El dashboard de owner siempre trabaja sobre una barbería concreta.
        // Sin esta relación, /dashboard termina en el selector vacío y la
        // cuenta sembrada no tiene ningún dashboard al cual ingresar.
        Barberia::updateOrCreate(
            [
                'owner_id' => $owner->id,
                'name' => 'Barbería Plan 3',
            ],
            [
                'address' => 'Sucursal de prueba',
                'active' => true,
                'deactivated_at' => null,
            ]
        );

        $this->command?->info('Seed base listo.');
        $this->command?->table(
            ['Rol', 'Email', 'Password'],
            [
                ['admin', 'estilus.ar@gmail.com', 'Estilusbarber1-'],
                ['owner', 'user3@estilus.com', 'Estilususer3'],
            ]
        );
    }
}
