<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Concerns\ResolvesDay;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreTurnoRequest;
use App\Http\Requests\UpdateTurnoStatusRequest;
use App\Models\Barberia;
use App\Models\Servicio;
use App\Models\Turno;
use App\Models\User;
use App\Services\Turnos\DisponibilidadService;
use App\Services\Turnos\TurnoCompletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TurnoController extends Controller
{
    use ResolvesDay;

    public function index(Request $request, Barberia $barberia): Response
    {
        $dia = $this->resolveDay($request);
        $barberoId = $request->integer('barbero_id') ?: null;

        $turnos = Turno::where('barberia_id', $barberia->id)
            ->whereDate('fecha', $dia->toDateString())
            ->when($barberoId, fn ($query) => $query->where('barbero_id', $barberoId))
            ->with(['servicio:id,name,duration_minutes', 'barbero:id,name'])
            ->orderBy('hora_inicio')
            ->get()
            ->map(fn (Turno $turno) => $this->mapTurno($turno));

        $barberos = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $servicios = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'duration_minutes']);

        return Inertia::render('Owner/Barberias/Turnos/Calendario', [
            'turnos' => $turnos,
            'barberos' => $barberos,
            'servicios' => $servicios,
            'dia' => $dia->toDateString(),
            'esHoy' => $dia->isToday(),
            'barberoFiltro' => $barberoId,
            'publicTurnoUrl' => $barberia->publicTurnoUrl(),
        ]);
    }

    public function slots(Request $request, Barberia $barberia, DisponibilidadService $disponibilidadService): JsonResponse
    {
        $validated = $request->validate([
            'servicio_id' => ['required', 'integer'],
            'barbero_id' => ['required', 'integer'],
            'fecha' => ['required', 'date'],
        ]);

        $servicio = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($validated['servicio_id']);

        $barbero = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
            ->findOrFail($validated['barbero_id']);

        $fecha = Carbon::parse($validated['fecha'])->startOfDay();

        return response()->json(
            $disponibilidadService->slotsDisponibles($barberia, $servicio, $fecha, $barbero)
        );
    }

    public function store(StoreTurnoRequest $request, Barberia $barberia, DisponibilidadService $disponibilidadService): RedirectResponse
    {
        $servicio = Servicio::where('barberia_id', $barberia->id)
            ->where('active', true)
            ->findOrFail($request->servicio_id);

        $barbero = User::where('barberia_id', $barberia->id)
            ->where('role', 'barber')
            ->where('active', true)
            ->findOrFail($request->barbero_id);

        $fecha = Carbon::parse($request->fecha)->startOfDay();

        $slots = $disponibilidadService->slotsDisponibles($barberia, $servicio, $fecha, $barbero);
        $slotElegido = collect($slots)->firstWhere('hora_inicio', $request->hora_inicio);

        if (! $slotElegido) {
            throw ValidationException::withMessages([
                'hora_inicio' => 'Ese horario ya no está disponible: elegí otro.',
            ]);
        }

        Turno::create([
            'barberia_id' => $barberia->id,
            'barbero_id' => $barbero->id,
            'servicio_id' => $servicio->id,
            'cliente_nombre' => $request->cliente_nombre,
            'cliente_telefono' => $request->cliente_telefono,
            'fecha' => $fecha->toDateString(),
            'hora_inicio' => $slotElegido['hora_inicio'],
            'hora_fin' => $slotElegido['hora_fin'],
            'status' => 'confirmado',
        ]);

        return redirect()
            ->route('owner.barberias.turnos.index', ['barberia' => $barberia->id, 'day' => $fecha->toDateString()])
            ->with('success', 'Turno cargado correctamente.');
    }

    public function update(UpdateTurnoStatusRequest $request, Barberia $barberia, Turno $turno, TurnoCompletionService $turnoCompletionService): JsonResponse
    {
        abort_if($turno->barberia_id !== $barberia->id, 403);

        if (! in_array($turno->status, ['pendiente', 'confirmado'], true)) {
            return response()->json(['message' => 'Este turno ya no se puede modificar.'], 422);
        }

        $turno->update(['status' => $request->status]);

        return response()->json([
            'turno' => ['id' => $turno->id, 'status' => $turno->status],
            'precarga' => $request->status === 'completado' ? $turnoCompletionService->resolvePrecarga($turno) : null,
        ]);
    }

    // Acción separada del update genérico a propósito: confirmar un pendiente
    // es la transición más importante y urgente del flujo de turnos, y
    // conviene tener su propio endpoint/label en vez de mezclarla con el
    // resto de los cambios de estado. Exclusiva del owner — el barbero solo
    // ve el pendiente destacado y puede avisarle por WhatsApp, no confirmar.
    public function confirmar(Barberia $barberia, Turno $turno): JsonResponse
    {
        abort_if($turno->barberia_id !== $barberia->id, 403);

        if ($turno->status !== 'pendiente') {
            return response()->json(['message' => 'Este turno ya no está pendiente de confirmación.'], 422);
        }

        $turno->update(['status' => 'confirmado']);

        return response()->json([
            'turno' => ['id' => $turno->id, 'status' => $turno->status],
        ]);
    }

    private function mapTurno(Turno $turno): array
    {
        return [
            'id' => $turno->id,
            'barbero' => $turno->barbero ? ['id' => $turno->barbero->id, 'name' => $turno->barbero->name] : null,
            'servicio' => $turno->servicio ? [
                'id' => $turno->servicio->id,
                'name' => $turno->servicio->name,
                'duration_minutes' => $turno->servicio->duration_minutes,
            ] : null,
            'cliente_nombre' => $turno->cliente_nombre,
            'cliente_telefono' => $turno->cliente_telefono,
            'hora_inicio' => substr($turno->hora_inicio, 0, 5),
            'hora_fin' => substr($turno->hora_fin, 0, 5),
            'status' => $turno->status,
        ];
    }
}
