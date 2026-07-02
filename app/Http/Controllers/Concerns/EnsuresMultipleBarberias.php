<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * El consolidado multi-barbería solo tiene sentido con 2+ barberías activas.
 * No es una restricción de permisos (por eso redirige en vez de abortar): un
 * owner con una sola barbería no tiene nada que consolidar, así que se lo
 * manda directo a su dashboard individual.
 */
trait EnsuresMultipleBarberias
{
    protected function redirectIfConsolidadoNoAplica(Request $request): ?RedirectResponse
    {
        $owner = $request->user();
        $barberias = $owner->barberias()->where('active', true)->get(['id']);

        if ($barberias->count() >= 2) {
            return null;
        }

        if ($barberias->count() === 1) {
            return redirect()->route('owner.barberias.dashboard', $barberias->first()->id);
        }

        return redirect()->route('owner.barberias.index');
    }
}
