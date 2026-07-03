<?php

namespace Tests\Unit;

use App\Models\Barberia;
use App\Models\Cliente;
use App\Models\Corte;
use App\Models\MedioPago;
use App\Models\Servicio;
use App\Models\User;
use App\Services\ComisionCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ComisionCalculatorTest extends TestCase
{
    use RefreshDatabase;

    public function test_sueldo_fijo_devuelve_el_monto_configurado_sin_importar_lo_facturado(): void
    {
        $barbero = User::factory()->barber()->create([
            'salary_type' => 'fixed',
            'salary_amount' => 80000,
        ]);

        // Cortes de otro barbero con mucha facturación en el período — no deberían influir.
        Corte::factory()->create([
            'barbero_id' => $barbero->id,
            'price' => 999999,
            'performed_at' => now()->toDateString(),
        ]);

        $resultado = (new ComisionCalculator)->calcular(
            $barbero,
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth(),
        );

        $this->assertSame(80000.0, $resultado);
    }

    public function test_comision_calcula_el_porcentaje_sobre_la_suma_de_cortes_del_periodo(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin); // bypassa el scope de tenant para poder sumar cortes libremente

        $barbero = User::factory()->barber()->create([
            'salary_type' => 'commission',
            'commission_pct' => 10,
        ]);

        $barberia = Barberia::factory()->create();
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id]);
        $cliente = Cliente::factory()->create(['barberia_id' => $barberia->id]);
        $medioPago = MedioPago::factory()->create(['barberia_id' => $barberia->id]);

        $inicio = Carbon::parse('2026-06-01');
        $fin = Carbon::parse('2026-06-30');

        Corte::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_id' => $cliente->id,
            'medio_pago_id' => $medioPago->id,
            'price' => 1000,
            'performed_at' => '2026-06-10',
        ]);

        Corte::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_id' => $cliente->id,
            'medio_pago_id' => $medioPago->id,
            'price' => 2000,
            'performed_at' => '2026-06-20',
        ]);

        // Fuera del período — no debería sumar.
        Corte::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_id' => $cliente->id,
            'medio_pago_id' => $medioPago->id,
            'price' => 5000,
            'performed_at' => '2026-07-01',
        ]);

        $resultado = (new ComisionCalculator)->calcular($barbero, $inicio, $fin);

        $this->assertSame(300.0, $resultado);
    }
}
