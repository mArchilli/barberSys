<?php

namespace Tests\Unit\Services\Turnos;

use App\Models\Barberia;
use App\Models\BarberiaTurnoExcepcion;
use App\Models\BarberoDisponibilidad;
use App\Models\BarberoExcepcion;
use App\Models\HorarioAtencion;
use App\Models\Servicio;
use App\Models\Turno;
use App\Models\User;
use App\Services\Turnos\DisponibilidadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DisponibilidadServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function crearHorario(Barberia $barberia, int $diaSemana, string $inicio, string $fin, bool $activo = true): HorarioAtencion
    {
        return HorarioAtencion::create([
            'barberia_id' => $barberia->id,
            'dia_semana' => $diaSemana,
            'hora_inicio' => $inicio,
            'hora_fin' => $fin,
            'activo' => $activo,
        ]);
    }

    private function crearDisponibilidadBarbero(User $barbero, int $diaSemana, string $inicio, string $fin): BarberoDisponibilidad
    {
        return BarberoDisponibilidad::create([
            'user_id' => $barbero->id,
            'dia_semana' => $diaSemana,
            'hora_inicio' => $inicio,
            'hora_fin' => $fin,
        ]);
    }

    private function crearBarbero(Barberia $barberia): User
    {
        return User::factory()->barber()->create(['barberia_id' => $barberia->id]);
    }

    public function test_barberia_con_turnos_desactivados_no_devuelve_slots(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => false]);
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha);

        $this->assertSame([], $slots);
    }

    public function test_excepcion_de_barberia_habilita_un_dia_puntual_pese_a_turnos_enabled_false(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => false]);

        BarberiaTurnoExcepcion::create([
            'barberia_id' => $barberia->id,
            'date' => $fecha->toDateString(),
            'enabled' => true,
        ]);

        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '10:00');
        $barbero = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barbero, $fecha->dayOfWeek, '09:00', '10:00');
        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha, $barbero);

        $this->assertSame(['09:00', '09:30'], array_column($slots, 'hora_inicio'));
        $this->assertSame(['09:30', '10:00'], array_column($slots, 'hora_fin'));
    }

    public function test_barbero_con_excepcion_de_dia_libre_no_tiene_slots_aunque_la_barberia_este_abierta(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => true]);
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '10:00');

        $barbero = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barbero, $fecha->dayOfWeek, '09:00', '10:00');
        BarberoExcepcion::create([
            'user_id' => $barbero->id,
            'fecha' => $fecha->toDateString(),
            'disponible' => false,
        ]);

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha, $barbero);

        $this->assertSame([], $slots);
    }

    public function test_franja_partida_manana_y_tarde_genera_slots_en_ambos_bloques_y_ninguno_en_el_hueco(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => true]);
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '11:00');
        $this->crearHorario($barberia, $fecha->dayOfWeek, '15:00', '16:00');

        $barbero = $this->crearBarbero($barberia);
        // Disponibilidad amplia a propósito: no debe ser ella la que recorte
        // las franjas, sino el horario de atención de la barbería.
        $this->crearDisponibilidadBarbero($barbero, $fecha->dayOfWeek, '08:00', '20:00');

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha, $barbero);

        $this->assertSame(
            ['09:00', '09:30', '10:00', '10:30', '15:00', '15:30'],
            array_column($slots, 'hora_inicio')
        );
    }

    public function test_turno_ya_reservado_no_aparece_como_slot_disponible(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => true]);
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '10:00');

        $barbero = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barbero, $fecha->dayOfWeek, '09:00', '10:00');

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        Turno::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barbero->id,
            'servicio_id' => $servicio->id,
            'fecha' => $fecha->toDateString(),
            'hora_inicio' => '09:00',
            'hora_fin' => '09:30',
            'status' => 'pendiente',
        ]);

        // Un turno cancelado a la misma hora que el otro slot no debería bloquearlo.
        Turno::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barbero->id,
            'servicio_id' => $servicio->id,
            'fecha' => $fecha->toDateString(),
            'hora_inicio' => '09:30',
            'hora_fin' => '10:00',
            'status' => 'cancelado',
        ]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha, $barbero);

        $this->assertSame(['09:30'], array_column($slots, 'hora_inicio'));
    }

    public function test_modo_cualquier_barbero_con_uno_ocupado_y_otro_libre_el_horario_sigue_disponible(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => true]);
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '10:00');

        $barberoOcupado = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barberoOcupado, $fecha->dayOfWeek, '09:00', '10:00');

        $barberoLibre = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barberoLibre, $fecha->dayOfWeek, '09:00', '10:00');

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        Turno::factory()->create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barberoOcupado->id,
            'servicio_id' => $servicio->id,
            'fecha' => $fecha->toDateString(),
            'hora_inicio' => '09:00',
            'hora_fin' => '09:30',
            'status' => 'confirmado',
        ]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha);

        $this->assertSame(['09:00', '09:30'], array_column($slots, 'hora_inicio'));

        $slotOcupado = collect($slots)->firstWhere('hora_inicio', '09:00');
        $this->assertSame([$barberoLibre->id], $slotOcupado['barberos_disponibles']);
    }

    public function test_modo_cualquier_barbero_con_todos_ocupados_el_horario_no_aparece(): void
    {
        $fecha = Carbon::now()->addDays(10);
        $barberia = Barberia::factory()->create(['turnos_enabled' => true]);
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '10:00');

        $barberoA = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barberoA, $fecha->dayOfWeek, '09:00', '10:00');
        $barberoB = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barberoB, $fecha->dayOfWeek, '09:00', '10:00');

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        foreach ([$barberoA, $barberoB] as $barbero) {
            Turno::factory()->create([
                'barberia_id' => $barberia->id,
                'barbero_id' => $barbero->id,
                'servicio_id' => $servicio->id,
                'fecha' => $fecha->toDateString(),
                'hora_inicio' => '09:00',
                'hora_fin' => '09:30',
                'status' => 'pendiente',
            ]);
        }

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha);

        $this->assertSame(['09:30'], array_column($slots, 'hora_inicio'));
    }

    public function test_consulta_para_hoy_no_devuelve_slots_de_horas_ya_pasadas(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-10 11:00:00'));
        $fecha = Carbon::now()->startOfDay();

        // anticipación en 0 para aislar el efecto de "hora ya pasada" del
        // margen de anticipación (cubierto aparte en el test siguiente).
        $barberia = Barberia::factory()->create(['turnos_enabled' => true, 'turno_anticipacion_minutos' => 0]);
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:00', '13:00');

        $barbero = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barbero, $fecha->dayOfWeek, '09:00', '13:00');

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha, $barbero);

        $this->assertSame(['11:00', '11:30', '12:00', '12:30'], array_column($slots, 'hora_inicio'));
    }

    public function test_consulta_para_hoy_respeta_el_margen_de_turno_anticipacion_minutos(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-10 09:00:00'));
        $fecha = Carbon::now()->startOfDay();

        $barberia = Barberia::factory()->create(['turnos_enabled' => true, 'turno_anticipacion_minutos' => 30]);
        // 09:15 (en 15 min, debe descartarse) y 09:45 (en 45 min, debe aparecer).
        $this->crearHorario($barberia, $fecha->dayOfWeek, '09:15', '10:15');

        $barbero = $this->crearBarbero($barberia);
        $this->crearDisponibilidadBarbero($barbero, $fecha->dayOfWeek, '09:15', '10:15');

        $servicio = Servicio::factory()->create(['barberia_id' => $barberia->id, 'duration_minutes' => 30]);

        $slots = (new DisponibilidadService)->slotsDisponibles($barberia, $servicio, $fecha, $barbero);

        $this->assertSame(['09:45'], array_column($slots, 'hora_inicio'));
    }
}
