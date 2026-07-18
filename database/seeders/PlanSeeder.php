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
                'name'          => 'Base',
                'slug'          => 'plan-1',
                'max_barberias' => 1,
                'max_barberos'  => 3,
                'price'         => 18000.00,
                'annual_price'  => 15000.00,
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
                'name'          => 'Profesional',
                'slug'          => 'plan-2',
                'max_barberias' => 2,
                'max_barberos'  => 6,
                'price'         => 25000.00,
                'annual_price'  => 22000.00,
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
                'name'          => 'Expansión',
                'slug'          => 'plan-3',
                'max_barberias' => 5,
                'max_barberos'  => null,
                'price'         => 55000.00,
                'annual_price'  => 45000.00,
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
                'name'          => 'Cadena',
                'slug'          => 'plan-4',
                'max_barberias' => null,
                'max_barberos'  => null,
                // price no es nullable en el schema (decimal 10,2 NOT NULL); 0.00
                // es un placeholder que nunca se lee — is_custom=true gatea "A
                // medida" antes de que el front consulte price/annual_price.
                'price'         => 0.00,
                'annual_price'  => null,
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
