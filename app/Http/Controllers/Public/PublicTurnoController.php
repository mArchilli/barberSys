<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreTurnoPublicoRequest;
use App\Models\Barberia;
use App\Models\HorarioAtencion;
use App\Models\Servicio;
use App\Models\Turno;
use App\Models\User;
use App\Services\Turnos\DisponibilidadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Único controller del proyecto (junto con Admin\OwnerController, por otra
 * razón) donde BelongsToBarberiaScope no termina filtrando nada: sin usuario
 * autenticado, Auth::user() es null y el scope cae en la misma rama de
 * early-return que usa para admin (ver comentario en la clase). No hace
 * falta ningún withoutGlobalScope(): cada query de acá filtra explícitamente
 * por $barberia->id (resuelta por public_slug vía route model binding, nunca
 * por input del cliente), igual que ya hace Owner\TurnoController como capa
 * extra. Sin riesgo de fuga entre tenants: el alcance lo fija la URL.
 */
class PublicTurnoController extends Controller
{
    public function index(Barberia $barberia): Response
    {
        $tieneHorarios = HorarioAtencion::where('barberia_id', $barberia->id)
            ->where('activo', true)
            ->exists();

        $disponible = $barberia->active && $barberia->turnos_enabled && $tieneHorarios;

        return Inertia::render('Public/Turno', [
            'barberia' => [
                'name' => $barberia->name,
                'whatsapp_number' => $barberia->whatsapp_number,
            ],
            'slug' => $barberia->public_slug,
            'disponible' => $disponible,
            'servicios' => $disponible
                ? Servicio::where('barberia_id', $barberia->id)
                    ->where('active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'price', 'duration_minutes'])
                : [],
            'barberos' => $disponible
                ? User::where('barberia_id', $barberia->id)
                    ->where('role', 'barber')
                    ->where('active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
        ]);
    }

    public function slots(Request $request, Barberia $barberia, DisponibilidadService $disponibilidadService): JsonResponse
    {
        $validated = $request->validate([
            'servicio_id' => ['required', 'integer'],
            // A diferencia de Owner\TurnoController::slots(), acá barbero_id
            // es opcional: ausente = modo "cualquier barbero disponible".
            'barbero_id' => ['nullable', 'integer'],
            'fecha' => ['required', 'date'],
        ]);

        $servicio = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($validated['servicio_id']);

        $barbero = null;
        if (! empty($validated['barbero_id'])) {
            $barbero = User::where('barberia_id', $barberia->id)
                ->where('role', 'barber')
                ->where('active', true)
                ->findOrFail($validated['barbero_id']);
        }

        $fecha = Carbon::parse($validated['fecha'])->startOfDay();

        return response()->json(
            $disponibilidadService->slotsDisponibles($barberia, $servicio, $fecha, $barbero)
        );
    }

    public function store(StoreTurnoPublicoRequest $request, Barberia $barberia, DisponibilidadService $disponibilidadService): JsonResponse
    {
        $servicio = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->servicio_id);

        $barberoSolicitado = null;
        if ($request->filled('barbero_id')) {
            $barberoSolicitado = User::where('barberia_id', $barberia->id)
                ->where('role', 'barber')
                ->where('active', true)
                ->findOrFail($request->barbero_id);
        }

        $fecha = Carbon::parse($request->fecha)->startOfDay();

        // Primera pasada, fuera de la transacción: la única fuente de verdad
        // para franjas/excepciones/anticipación es DisponibilidadService, tal
        // cual la usa el resto del sistema. Si el modo es "cualquier barbero",
        // barberos_disponibles trae, en orden, a todos los candidatos que
        // libraron ese horario en esta lectura.
        $slots = $disponibilidadService->slotsDisponibles($barberia, $servicio, $fecha, $barberoSolicitado);
        $slotElegido = collect($slots)->firstWhere('hora_inicio', $request->hora_inicio);

        if (! $slotElegido) {
            throw ValidationException::withMessages([
                'hora_inicio' => 'Ese horario ya no está disponible: elegí otro.',
            ]);
        }

        $candidatoIds = $barberoSolicitado ? [$barberoSolicitado->id] : $slotElegido['barberos_disponibles'];

        $turno = DB::transaction(function () use ($barberia, $servicio, $request, $fecha, $slotElegido, $candidatoIds) {
            $horaInicio = Carbon::parse($fecha->toDateString().' '.$slotElegido['hora_inicio']);
            $horaFin = Carbon::parse($fecha->toDateString().' '.$slotElegido['hora_fin']);

            foreach ($candidatoIds as $barberoId) {
                // Revalidación real, bajo lock: el slot que el cliente vio
                // hace un minuto puede haberse ocupado en el ínterin. El lock
                // recae sobre los turnos vigentes de ESTE barbero en ESTA
                // fecha (mismo índice compuesto que usa DisponibilidadService),
                // así que dos reservas concurrentes para el mismo horario
                // quedan serializadas acá, no en una carrera a nivel PHP.
                $ocupados = Turno::where('barberia_id', $barberia->id)
                    ->where('barbero_id', $barberoId)
                    ->whereDate('fecha', $fecha->toDateString())
                    ->vigentes()
                    ->lockForUpdate()
                    ->get(['hora_inicio', 'hora_fin']);

                $solapa = $ocupados->contains(function ($turnoOcupado) use ($fecha, $horaInicio, $horaFin) {
                    $inicioOcupado = Carbon::parse($fecha->toDateString().' '.$turnoOcupado->hora_inicio);
                    $finOcupado = Carbon::parse($fecha->toDateString().' '.$turnoOcupado->hora_fin);

                    return $horaInicio->lt($finOcupado) && $horaFin->gt($inicioOcupado);
                });

                if (! $solapa) {
                    return Turno::create([
                        'barberia_id' => $barberia->id,
                        'barbero_id' => $barberoId,
                        'servicio_id' => $servicio->id,
                        'cliente_nombre' => $request->cliente_nombre,
                        'cliente_telefono' => $request->cliente_telefono,
                        'fecha' => $fecha->toDateString(),
                        'hora_inicio' => $slotElegido['hora_inicio'],
                        'hora_fin' => $slotElegido['hora_fin'],
                        'status' => 'pendiente',
                    ]);
                }
            }

            return null;
        });

        if (! $turno) {
            throw ValidationException::withMessages([
                'hora_inicio' => 'Ese horario se acaba de ocupar, elegí otro.',
            ]);
        }

        return response()->json([
            'turno' => [
                'servicio' => $servicio->name,
                'fecha' => $turno->fecha->toDateString(),
                'hora_inicio' => substr($turno->hora_inicio, 0, 5),
                'barbero' => User::find($turno->barbero_id)?->name,
            ],
        ]);
    }
}
