<?php

namespace App\Http\Middleware;

use App\Models\Barberia;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Una barbería cerrada queda en modo solo lectura: se puede seguir
 * consultando su dashboard, finanzas e historial con normalidad, pero
 * cualquier acción de escritura (cargar corte, crear gasto, crear barbero,
 * editar catálogo, etc.) devuelve 403. Renombrar la barbería y reactivarla
 * son las únicas excepciones permitidas mientras está cerrada.
 */
class BlockIfBarberiaInactive
{
    private const ALLOWED_WHEN_INACTIVE = [
        'owner.barberias.update',
        'owner.barberias.reactivate',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethodSafe()) {
            return $next($request);
        }

        $barberia = $request->route('barberia');

        if ($barberia instanceof Barberia
            && ! $barberia->active
            && ! in_array($request->route()->getName(), self::ALLOWED_WHEN_INACTIVE, true)
        ) {
            abort(403, 'Esta barbería está cerrada.');
        }

        return $next($request);
    }
}
