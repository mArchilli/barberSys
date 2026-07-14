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
                'features'      => null,
                'included_items' => [
                    'Registro de servicios prestados',
                    'Catálogo de servicios y medios de pago',
                    'Módulo financiero: sueldos y gastos',
                    'Métricas básicas de facturación',
                ],
            ],
            [
                'name'          => 'Plan 2',
                'slug'          => 'plan-2',
                'max_barberias' => 2,
                'max_barberos'  => 6,
                'price'         => 33000.00,
                'is_custom'     => false,
                'active'        => true,
                'features'      => ['ranking_barberos' => true],
                'included_items' => [
                    'Registro de servicios prestados',
                    'Catálogo de servicios y medios de pago',
                    'Módulo financiero: sueldos y gastos',
                    'Métricas básicas de facturación',
                    'Panel consolidado entre barberías',
                    'Ranking de productividad por barbero',
                ],
            ],
            [
                'name'          => 'Plan 3',
                'slug'          => 'plan-3',
                'max_barberias' => 5,
                'max_barberos'  => null,
                'price'         => 65000.00,
                'is_custom'     => false,
                'active'        => true,
                'features'      => ['ranking_barberos' => true],
                'included_items' => [
                    'Registro de servicios prestados',
                    'Catálogo de servicios y medios de pago',
                    'Módulo financiero: sueldos y gastos',
                    'Métricas de facturación',
                    'Panel consolidado ampliado: neto por sucursal y neto total',
                    'Ranking de productividad por barbero',
                    'Sin límite de barberos por sucursal',
                ],
            ],
            [
                'name'          => 'Plan 4',
                'slug'          => 'plan-4',
                'max_barberias' => null,
                'max_barberos'  => null,
                'price'         => 0.00,
                'is_custom'     => true,
                'active'        => true,
                'features'      => ['ranking_barberos' => true],
                'included_items' => [
                    'Registro de servicios prestados',
                    'Catálogo de servicios y medios de pago',
                    'Módulo financiero: sueldos y gastos',
                    'Métricas de facturación',
                    'Panel consolidado ampliado: neto por sucursal y neto total',
                    'Ranking de productividad por barbero',
                    'Roles y permisos por sucursal',
                    'Reportes exportables',
                    'Soporte prioritario',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
