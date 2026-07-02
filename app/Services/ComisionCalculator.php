<?php

namespace App\Services;

use App\Models\Corte;
use App\Models\User;
use Illuminate\Support\Carbon;

class ComisionCalculator
{
    // Calcula el sueldo de un barbero para el período [$inicio, $fin]:
    // - fixed: salary_amount tal cual, sin importar lo facturado.
    // - commission: commission_pct sobre la suma de cortes.price del período.
    public function calcular(User $barbero, Carbon $inicio, Carbon $fin): float
    {
        if ($barbero->salary_type === 'fixed') {
            return (float) $barbero->salary_amount;
        }

        $facturado = (float) Corte::where('barbero_id', $barbero->id)
            ->whereBetween('performed_at', [$inicio->toDateString(), $fin->toDateString()])
            ->sum('price');

        return round($facturado * ((float) $barbero->commission_pct / 100), 2);
    }
}
