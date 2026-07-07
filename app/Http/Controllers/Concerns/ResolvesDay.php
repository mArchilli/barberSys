<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Resuelve el día activo de un dashboard desde el query param `?day=YYYY-MM-DD`
 * (estado en URL, no en sesión). Con formato inválido, fecha inexistente o futura,
 * cae al día actual.
 */
trait ResolvesDay
{
    protected function resolveDay(Request $request): Carbon
    {
        $day = $request->query('day');

        if (is_string($day) && preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $day, $matches)
            && checkdate((int) $matches[2], (int) $matches[3], (int) $matches[1])) {
            $date = Carbon::createFromDate((int) $matches[1], (int) $matches[2], (int) $matches[3])->startOfDay();

            if (! $date->isFuture()) {
                return $date;
            }
        }

        return Carbon::now()->startOfDay();
    }
}
