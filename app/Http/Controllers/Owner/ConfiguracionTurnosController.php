<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreTurnoExcepcionRequest;
use App\Http\Requests\Owner\UpdateBarberoDisponibilidadRequest;
use App\Http\Requests\Owner\UpdateConfiguracionTurnosGeneralRequest;
use App\Http\Requests\Owner\UpdateHorariosAtencionRequest;
use App\Models\Barberia;
use App\Models\BarberiaTurnoExcepcion;
use App\Models\HorarioAtencion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionTurnosController extends Controller
{
    public function index(Barberia $barberia): Response
    {
        $horarios = HorarioAtencion::where('barberia_id', $barberia->id)
            ->orderBy('dia_semana')
            ->get(['id', 'dia_semana', 'hora_inicio', 'hora_fin', 'activo']);

        $excepciones = BarberiaTurnoExcepcion::where('barberia_id', $barberia->id)
            ->orderByDesc('date')
            ->get(['id', 'date', 'enabled']);

        $barberos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
            ->orderBy('name')
            ->with(['disponibilidad' => fn ($query) => $query->orderBy('dia_semana')])
            ->get()
            ->map(fn (User $barbero) => [
                'id' => $barbero->id,
                'name' => $barbero->name,
                'disponibilidad' => $barbero->disponibilidad->map(fn ($fila) => [
                    'id' => $fila->id,
                    'dia_semana' => $fila->dia_semana,
                    'hora_inicio' => substr($fila->hora_inicio, 0, 5),
                    'hora_fin' => substr($fila->hora_fin, 0, 5),
                ]),
            ]);

        return Inertia::render('Owner/Barberias/Turnos/Configuracion', [
            'configuracion' => [
                'turnos_enabled' => $barberia->turnos_enabled,
                'public_slug' => $barberia->public_slug,
                'whatsapp_number' => $barberia->whatsapp_number,
            ],
            'horarios' => $horarios->map(fn ($horario) => [
                'id' => $horario->id,
                'dia_semana' => $horario->dia_semana,
                'hora_inicio' => substr($horario->hora_inicio, 0, 5),
                'hora_fin' => substr($horario->hora_fin, 0, 5),
                'activo' => $horario->activo,
            ]),
            'excepciones' => $excepciones,
            'barberos' => $barberos,
        ]);
    }

    public function updateGeneral(UpdateConfiguracionTurnosGeneralRequest $request, Barberia $barberia): RedirectResponse
    {
        $barberia->update([
            'turnos_enabled' => $request->turnos_enabled,
            'public_slug' => $request->public_slug,
            'whatsapp_number' => $request->whatsapp_number,
        ]);

        $redirect = redirect()->route('owner.barberias.turnos.configuracion.index', $barberia->id);

        $sinHorariosCargados = $request->turnos_enabled
            && ! HorarioAtencion::where('barberia_id', $barberia->id)->where('activo', true)->exists();

        if ($sinHorariosCargados) {
            return $redirect->with('warning', 'Activaste los turnos pero todavía no cargaste horarios de atención: la barbería no va a mostrar disponibilidad hasta que los cargues.');
        }

        return $redirect->with('success', 'Configuración de turnos actualizada.');
    }

    public function updateHorarios(UpdateHorariosAtencionRequest $request, Barberia $barberia): RedirectResponse
    {
        DB::transaction(function () use ($request, $barberia) {
            HorarioAtencion::where('barberia_id', $barberia->id)->delete();

            foreach ($request->input('horarios', []) as $horario) {
                HorarioAtencion::create([
                    'barberia_id' => $barberia->id,
                    'dia_semana' => $horario['dia_semana'],
                    'hora_inicio' => $horario['hora_inicio'],
                    'hora_fin' => $horario['hora_fin'],
                    'activo' => $horario['activo'],
                ]);
            }
        });

        return redirect()->route('owner.barberias.turnos.configuracion.index', $barberia->id)
            ->with('success', 'Horarios de atención actualizados.');
    }

    public function storeExcepcion(StoreTurnoExcepcionRequest $request, Barberia $barberia): RedirectResponse
    {
        BarberiaTurnoExcepcion::updateOrCreate(
            ['barberia_id' => $barberia->id, 'date' => $request->date],
            ['enabled' => $request->enabled]
        );

        return redirect()->route('owner.barberias.turnos.configuracion.index', $barberia->id)
            ->with('success', 'Excepción guardada.');
    }

    public function destroyExcepcion(Barberia $barberia, BarberiaTurnoExcepcion $excepcion): RedirectResponse
    {
        $this->authorizeExcepcion($excepcion, $barberia);
        $excepcion->delete();

        return redirect()->route('owner.barberias.turnos.configuracion.index', $barberia->id)
            ->with('success', 'Excepción eliminada: ese día vuelve a valer la configuración general.');
    }

    public function updateDisponibilidadBarbero(UpdateBarberoDisponibilidadRequest $request, Barberia $barberia, User $barbero): RedirectResponse
    {
        $this->authorizeBarbero($barbero, $barberia);

        DB::transaction(function () use ($request, $barbero) {
            $barbero->disponibilidad()->delete();

            foreach ($request->input('disponibilidad', []) as $fila) {
                $barbero->disponibilidad()->create([
                    'dia_semana' => $fila['dia_semana'],
                    'hora_inicio' => $fila['hora_inicio'],
                    'hora_fin' => $fila['hora_fin'],
                ]);
            }
        });

        return redirect()->route('owner.barberias.turnos.configuracion.index', $barberia->id)
            ->with('success', "Disponibilidad de {$barbero->name} actualizada.");
    }

    private function authorizeExcepcion(BarberiaTurnoExcepcion $excepcion, Barberia $barberia): void
    {
        if ($excepcion->barberia_id !== $barberia->id) {
            abort(403);
        }
    }

    private function authorizeBarbero(User $barbero, Barberia $barberia): void
    {
        if ($barbero->barberia_id !== $barberia->id || $barbero->role !== 'barber') {
            abort(403);
        }
    }
}
