<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesBarberiaContext;
use App\Http\Controllers\Concerns\ResolvesDay;
use App\Http\Requests\UpdateTurnoStatusRequest;
use App\Models\Turno;
use App\Services\Turnos\TurnoCompletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BarberTurnoController extends Controller
{
    use ResolvesBarberiaContext, ResolvesDay;

    public function index(Request $request): Response
    {
        $barberia = $this->resolveBarberia($request, null);
        $dia = $this->resolveDay($request);

        $turnos = Turno::where('barberia_id', $barberia->id)
            ->where('barbero_id', Auth::id())
            ->whereDate('fecha', $dia->toDateString())
            ->with('servicio:id,name,duration_minutes')
            ->orderBy('hora_inicio')
            ->get()
            ->map(fn (Turno $turno) => $this->mapTurno($turno));

        return Inertia::render('Barber/Turnos/Index', [
            'turnos' => $turnos,
            'dia' => $dia->toDateString(),
            'esHoy' => $dia->isToday(),
            // El barbero no puede confirmar turnos (ver Owner\TurnoController::confirmar,
            // exclusivo del owner): para un pendiente, su única acción es avisarle
            // al dueño por WhatsApp, reusando el mismo número que ya carga la
            // barbería para contacto público (ver ConfiguracionTurnosController).
            'whatsappNumber' => $barberia->whatsapp_number,
        ]);
    }

    // Un barbero nunca ve ni modifica turnos de otro barbero de la misma
    // barbería: el Global Scope de Turno solo aísla por barbería, así que la
    // pertenencia al barbero se valida acá explícitamente.
    public function update(UpdateTurnoStatusRequest $request, Turno $turno, TurnoCompletionService $turnoCompletionService): JsonResponse
    {
        abort_if($turno->barbero_id !== Auth::id(), 403);

        if (! in_array($turno->status, ['pendiente', 'confirmado'], true)) {
            return response()->json(['message' => 'Este turno ya no se puede modificar.'], 422);
        }

        $turno->update(['status' => $request->status]);

        return response()->json([
            'turno' => ['id' => $turno->id, 'status' => $turno->status],
            'precarga' => $request->status === 'completado' ? $turnoCompletionService->resolvePrecarga($turno) : null,
        ]);
    }

    private function mapTurno(Turno $turno): array
    {
        return [
            'id' => $turno->id,
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
