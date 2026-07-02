<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Resuelve el mes activo de un dashboard desde el query param `?month=YYYY-MM`
 * (estado en URL, no en sesión). Con formato inválido o ausente, cae al mes actual.
 */
trait ResolvesPeriod
{
    protected function resolvePeriod(Request $request): Carbon
    {
        $month = $request->query('month');

        if (is_string($month) && preg_match('/^(\d{4})-(0[1-9]|1[0-2])$/', $month, $matches)) {
            return Carbon::createFromDate((int) $matches[1], (int) $matches[2], 1)->startOfMonth();
        }

        return Carbon::now()->startOfMonth();
    }
}
