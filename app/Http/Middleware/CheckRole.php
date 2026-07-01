<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Uso en rutas: ->middleware('role:owner') o ->middleware('role:admin,owner')
     * Acepta uno o varios roles separados por coma; el usuario pasa si su rol
     * coincide con cualquiera de los valores indicados.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, strict: true)) {
            abort(403);
        }

        return $next($request);
    }
}
