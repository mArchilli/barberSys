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
        // --- Admin ---
        $admin = User::firstOrCreate(
            ['email' => 'admin@barbersys.test'],
            [
                'name'     => 'Admin BarberSys',
                'password' => Hash::make('password'),
                'role'     => 'admin',
                'active'   => true,
            ]
        );

        // --- Owner con 2 barberías ---
        $owner = User::firstOrCreate(
            [
                ['email' => 'owner@barbersys.test'],
                'name'     => 'Carlos Owner',
                'password' => Hash::make('password'),
                'role'     => 'owner',
                'active'   => true,
            ]
        );

        $plan2 = Plan::where('slug', 'plan-2')->firstOrFail();

        Subscription::firstOrCreate(
            ['owner_id' => $owner->id],
            [
                'plan_id'    => $plan2->id,
                'status'     => 'active',
                'starts_at'  => now()->toDateString(),
                'ends_at'    => now()->addYear()->toDateString(),
            ]
        );

        $barberia1 = Barberia::firstOrCreate(
            ['owner_id' => $owner->id, 'name' => 'Barbería Centro'],
            ['address' => 'Av. Corrientes 1234', 'active' => true]
        );

        Barberia::firstOrCreate(
            ['owner_id' => $owner->id, 'name' => 'Barbería Norte'],
            ['address' => 'Av. Cabildo 567', 'active' => true]
        );

        // --- Barber asociado a Barbería Centro ---
        User::firstOrCreate(
            ['email' => 'barber@barbersys.test'],
            [
                'name'           => 'Lucas Barber',
                'password'       => Hash::make('password'),
                'role'           => 'barber',
                'barberia_id'    => $barberia1->id,
                'salary_type'    => 'commission',
                'commission_pct' => 40.00,
                'active'         => true,
            ]
        );

        // --- Credenciales ---
        $this->command?->newLine();
        $this->command?->info('Usuarios de prueba listos:');
        $this->command?->table(
            ['Rol', 'Email', 'Password'],
            [
                ['admin',  'admin@barbersys.test',  'password'],
                ['owner',  'owner@barbersys.test',  'password'],
                ['barber', 'barber@barbersys.test', 'password'],
            ]
        );
        $this->command?->newLine();
    }
}
