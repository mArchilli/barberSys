<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreGastoRequest;
use App\Http\Requests\Owner\UpdateGastoRequest;
use App\Models\Barberia;
use App\Models\Gasto;
use App\Models\GastoRegistro;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class GastoController extends Controller
{
    // El listado de plantillas vive dentro de la pantalla de Finanzas
    // (facturación/sueldos/gastos/neto en un mismo lugar), no en una
    // vista propia — este endpoint solo existe para completar la
    // convención de rutas del resource.
    public function index(Barberia $barberia): RedirectResponse
    {
        return redirect()->route('owner.barberias.finanzas', $barberia->id);
    }

    public function create(Barberia $barberia): Response
    {
        return Inertia::render('Owner/Gastos/Create');
    }

    public function store(StoreGastoRequest $request, Barberia $barberia): RedirectResponse
    {
        $gasto = Gasto::create([
            'barberia_id'  => $barberia->id,
            'name'         => $request->name,
            'amount'       => $request->amount,
            'type'         => $request->type,
            'is_recurring' => $request->is_recurring,
        ]);

        // Generamos ya mismo el registro del mes en curso en vez de esperar
        // al job mensual, para que el owner vea el impacto en el neto del
        // mismo mes en que carga el gasto. Esto aplica también a gastos no
        // recurrentes: son un gasto único y esta es su única oportunidad de
        // generar registro (el job mensual solo continúa los recurrentes).
        GastoRegistro::firstOrCreate(
            [
                'gasto_id' => $gasto->id,
                'month'    => Carbon::now()->startOfMonth()->toDateString(),
            ],
            [
                'barberia_id' => $barberia->id,
                'amount'      => $gasto->amount,
            ]
        );

        return redirect()->route('owner.barberias.finanzas', $barberia->id);
    }

    public function edit(Barberia $barberia, Gasto $gasto): Response
    {
        $this->authorizeGasto($gasto, $barberia);

        return Inertia::render('Owner/Gastos/Edit', [
            'gasto' => $gasto->only(['id', 'name', 'amount', 'type', 'is_recurring', 'active']),
        ]);
    }

    // Modifica la PLANTILLA: afecta la generación de gastos hacia el futuro,
    // nunca toca gasto_registros ya generados (ni pasados ni el del mes actual).
    public function update(UpdateGastoRequest $request, Barberia $barberia, Gasto $gasto): RedirectResponse
    {
        $this->authorizeGasto($gasto, $barberia);

        $gasto->update([
            'name'         => $request->name,
            'amount'       => $request->amount,
            'type'         => $request->type,
            'is_recurring' => $request->is_recurring,
            'active'       => $request->active,
        ]);

        return redirect()->route('owner.barberias.finanzas', $barberia->id);
    }

    public function deactivate(Barberia $barberia, Gasto $gasto): RedirectResponse
    {
        $this->authorizeGasto($gasto, $barberia);

        // Deja de generarse hacia adelante; los gasto_registros ya
        // generados (pasados y el del mes actual) no se tocan.
        $gasto->update(['active' => false]);

        return redirect()->route('owner.barberias.finanzas', $barberia->id);
    }

    private function authorizeGasto(Gasto $gasto, Barberia $barberia): void
    {
        if ($gasto->barberia_id !== $barberia->id) {
            abort(403);
        }
    }
}
