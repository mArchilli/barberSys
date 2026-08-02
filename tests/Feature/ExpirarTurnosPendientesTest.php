<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Turno;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ExpirarTurnosPendientesTest extends TestCase
{
    use RefreshDatabase;

    public function test_expira_un_turno_pendiente_cuyo_plazo_de_espera_ya_paso(): void
    {
        $barberia = Barberia::factory()->create(['turno_expiracion_horas' => 24]);

        Carbon::setTestNow('2026-08-01 10:00:00');
        $turno = Turno::factory()->create([
            'barberia_id' => $barberia->id,
            'status' => 'pendiente',
            'fecha' => '2026-08-10',
            'hora_inicio' => '10:00',
        ]);

        Carbon::setTestNow('2026-08-02 11:00:00');
        $this->artisan('app:expirar-turnos-pendientes')->assertSuccessful();
        Carbon::setTestNow();

        $this->assertSame('expirado', $turno->fresh()->status);
    }

    public function test_no_expira_un_turno_pendiente_dentro_del_plazo_de_espera(): void
    {
        $barberia = Barberia::factory()->create(['turno_expiracion_horas' => 24]);

        Carbon::setTestNow('2026-08-02 10:00:00');
        $turno = Turno::factory()->create([
            'barberia_id' => $barberia->id,
            'status' => 'pendiente',
            'fecha' => '2026-08-10',
            'hora_inicio' => '10:00',
        ]);

        Carbon::setTestNow('2026-08-02 11:00:00');
        $this->artisan('app:expirar-turnos-pendientes')->assertSuccessful();
        Carbon::setTestNow();

        $this->assertSame('pendiente', $turno->fresh()->status);
    }

    public function test_respeta_el_plazo_de_espera_configurado_por_barberia(): void
    {
        $barberiaEstricta = Barberia::factory()->create(['turno_expiracion_horas' => 2]);
        $barberiaHolgada = Barberia::factory()->create(['turno_expiracion_horas' => 24]);

        Carbon::setTestNow('2026-08-02 08:00:00');
        $turnoEstricto = Turno::factory()->create([
            'barberia_id' => $barberiaEstricta->id,
            'status' => 'pendiente',
            'fecha' => '2026-08-10',
            'hora_inicio' => '10:00',
        ]);
        $turnoHolgado = Turno::factory()->create([
            'barberia_id' => $barberiaHolgada->id,
            'status' => 'pendiente',
            'fecha' => '2026-08-10',
            'hora_inicio' => '10:00',
        ]);

        // Pasaron 3 horas: vence el de la barbería estricta (límite 2hs),
        // el de la barbería holgada (límite 24hs) sigue pendiente.
        Carbon::setTestNow('2026-08-02 11:00:00');
        $this->artisan('app:expirar-turnos-pendientes')->assertSuccessful();
        Carbon::setTestNow();

        $this->assertSame('expirado', $turnoEstricto->fresh()->status);
        $this->assertSame('pendiente', $turnoHolgado->fresh()->status);
    }

    public function test_expira_un_turno_pendiente_cuya_hora_de_inicio_ya_paso_aunque_se_haya_creado_recien(): void
    {
        $barberia = Barberia::factory()->create(['turno_expiracion_horas' => 24]);

        // Se creó hace instantes (muy dentro del plazo de espera), pero la
        // fecha/hora del turno ya pasó.
        Carbon::setTestNow('2026-08-02 10:05:00');
        $turno = Turno::factory()->create([
            'barberia_id' => $barberia->id,
            'status' => 'pendiente',
            'fecha' => '2026-08-02',
            'hora_inicio' => '10:00',
        ]);

        $this->artisan('app:expirar-turnos-pendientes')->assertSuccessful();
        Carbon::setTestNow();

        $this->assertSame('expirado', $turno->fresh()->status);
    }

    public function test_no_toca_turnos_que_no_estan_pendientes(): void
    {
        $barberia = Barberia::factory()->create(['turno_expiracion_horas' => 1]);

        Carbon::setTestNow('2026-08-01 00:00:00');
        $confirmado = Turno::factory()->confirmado()->create([
            'barberia_id' => $barberia->id,
            'fecha' => '2026-08-02',
            'hora_inicio' => '10:00',
        ]);
        $cancelado = Turno::factory()->cancelado()->create([
            'barberia_id' => $barberia->id,
            'fecha' => '2026-08-02',
            'hora_inicio' => '10:00',
        ]);

        Carbon::setTestNow('2026-08-03 00:00:00');
        $this->artisan('app:expirar-turnos-pendientes')->assertSuccessful();
        Carbon::setTestNow();

        $this->assertSame('confirmado', $confirmado->fresh()->status);
        $this->assertSame('cancelado', $cancelado->fresh()->status);
    }
}
