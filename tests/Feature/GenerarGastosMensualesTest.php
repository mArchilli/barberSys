<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Gasto;
use App\Models\GastoRegistro;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class GenerarGastosMensualesTest extends TestCase
{
    use RefreshDatabase;

    public function test_genera_un_registro_por_cada_gasto_recurrente_activo(): void
    {
        $barberia = Barberia::factory()->create();
        Gasto::factory()->create([
            'barberia_id' => $barberia->id,
            'amount' => 15000,
            'is_recurring' => true,
            'active' => true,
        ]);
        // No recurrente: no debería generar registro.
        Gasto::factory()->create([
            'barberia_id' => $barberia->id,
            'is_recurring' => false,
            'active' => true,
        ]);
        // Inactivo: no debería generar registro.
        Gasto::factory()->create([
            'barberia_id' => $barberia->id,
            'is_recurring' => true,
            'active' => false,
        ]);

        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();

        $this->assertSame(1, GastoRegistro::count());
        $this->assertSame(15000.0, (float) GastoRegistro::first()->amount);
    }

    public function test_correr_el_comando_dos_veces_en_el_mismo_mes_no_duplica_registros(): void
    {
        $barberia = Barberia::factory()->create();
        Gasto::factory()->create([
            'barberia_id' => $barberia->id,
            'is_recurring' => true,
            'active' => true,
        ]);

        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();
        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();

        $this->assertSame(1, GastoRegistro::count());
    }

    public function test_excluir_un_registro_del_mes_no_se_revierte_al_re_correr_el_comando(): void
    {
        $barberia = Barberia::factory()->create();
        $gasto = Gasto::factory()->create([
            'barberia_id' => $barberia->id,
            'is_recurring' => true,
            'active' => true,
        ]);

        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();

        $registro = GastoRegistro::where('gasto_id', $gasto->id)->firstOrFail();
        $registro->update(['is_deleted_for_month' => true]);

        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();

        $this->assertSame(1, GastoRegistro::where('gasto_id', $gasto->id)->count());
        $this->assertTrue($registro->fresh()->is_deleted_for_month);
    }

    public function test_la_exclusion_de_un_mes_no_afecta_la_plantilla_ni_meses_futuros(): void
    {
        $barberia = Barberia::factory()->create();
        $gasto = Gasto::factory()->create([
            'barberia_id' => $barberia->id,
            'amount' => 20000,
            'is_recurring' => true,
            'active' => true,
        ]);

        Carbon::setTestNow('2026-06-15');
        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();

        $registroJunio = GastoRegistro::where('gasto_id', $gasto->id)
            ->whereDate('month', '2026-06-01')
            ->firstOrFail();
        $registroJunio->update(['is_deleted_for_month' => true]);

        Carbon::setTestNow('2026-07-15');
        $this->artisan('app:generar-gastos-mensuales')->assertSuccessful();

        Carbon::setTestNow();

        $registroJulio = GastoRegistro::where('gasto_id', $gasto->id)
            ->whereDate('month', '2026-07-01')
            ->first();

        $this->assertNotNull($registroJulio);
        $this->assertFalse($registroJulio->is_deleted_for_month);
        $this->assertSame(20000.0, (float) $registroJulio->amount);

        $this->assertTrue($gasto->fresh()->is_recurring);
        $this->assertTrue($gasto->fresh()->active);
        $this->assertSame(20000.0, (float) $gasto->fresh()->amount);
    }
}
