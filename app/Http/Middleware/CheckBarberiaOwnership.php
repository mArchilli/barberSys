<?php

namespace App\Http\Middleware;

use App\Models\Barberia;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckBarberiaOwnership
{
    public function handle(Request $request, Closure $next): Response
    {
        $barberia = $request->route('barberia');

        if (! $barberia instanceof Barberia) {
            abort(404);
        }

        if ($barberia->owner_id !== Auth::id()) {
            abort(403);
        }

        return $next($request);
    }
}
