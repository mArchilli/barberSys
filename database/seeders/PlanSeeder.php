<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'          => 'Plan 1',
                'slug'          => 'plan-1',
                'max_barberias' => 1,
                'max_barberos'  => 3,
                'price'         => 15000.00,
                'is_custom'     => false,
                'active'        => true,
            ],
            [
                'name'          => 'Plan 2',
                'slug'          => 'plan-2',
                'max_barberias' => 2,
                'max_barberos'  => 6,
                'price'         => 33000.00,
                'is_custom'     => false,
                'active'        => true,
            ],
            [
                'name'          => 'Plan 3',
                'slug'          => 'plan-3',
                'max_barberias' => 5,
                'max_barberos'  => null,
                'price'         => 65000.00,
                'is_custom'     => false,
                'active'        => true,
            ],
            [
                'name'          => 'Plan 4',
                'slug'          => 'plan-4',
                'max_barberias' => null,
                'max_barberos'  => null,
                'price'         => 0.00,
                'is_custom'     => true,
                'active'        => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::firstOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
