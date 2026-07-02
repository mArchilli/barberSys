<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\UpdateGastoRegistroRequest;
use App\Models\Barberia;
use App\Models\GastoRegistro;
use Illuminate\Http\RedirectResponse;

class GastoRegistroController extends Controller
{
    // Modifica la INSTANCIA de un mes puntual: solo afecta ese
    // gasto_registro, nunca la plantilla (Gasto) ni meses futuros.
    public function update(UpdateGastoRegistroRequest $request, Barberia $barberia, GastoRegistro $gastoRegistro): RedirectResponse
    {
        $this->authorizeGastoRegistro($gastoRegistro, $barberia);

        $gastoRegistro->update(['amount' => $request->amount]);

        return redirect()->route('owner.barberias.finanzas', $barberia->id);
    }

    // Excluye la instancia del cálculo del neto de ese mes puntual,
    // sin afectar la recurrencia futura ni la plantilla.
    public function excluir(Barberia $barberia, GastoRegistro $gastoRegistro): RedirectResponse
    {
        $this->authorizeGastoRegistro($gastoRegistro, $barberia);

        $gastoRegistro->update(['is_deleted_for_month' => true]);

        return redirect()->route('owner.barberias.finanzas', $barberia->id);
    }

    private function authorizeGastoRegistro(GastoRegistro $gastoRegistro, Barberia $barberia): void
    {
        if ($gastoRegistro->barberia_id !== $barberia->id) {
            abort(403);
        }
    }
}
