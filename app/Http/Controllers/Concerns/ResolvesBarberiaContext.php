<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Barberia;
use Illuminate\Http\Request;

/**
 * Resuelve la barbería activa para acciones compartidas entre owner y barber:
 * el owner la trae resuelta por route model binding (ya validada por
 * checkBarberiaOwnership), el barber siempre opera sobre la suya propia.
 */
trait ResolvesBarberiaContext
{
    protected function resolveBarberia(Request $request, ?Barberia $barberia): Barberia
    {
        $user = $request->user();

        if ($user->isBarber()) {
            abort_if(! $user->barberia, 403);

            return $user->barberia;
        }

        abort_if(! $barberia, 404);

        return $barberia;
    }
}
