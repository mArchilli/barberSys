<?php

namespace App\Http\Middleware;

use App\Support\QueryProfiler;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Solo se registra en el grupo web cuando APP_ENV=local (ver bootstrap/app.php).
 * Adjunta cantidad de queries y tiempo de DB como headers de respuesta (útiles
 * para el comando app:auditar-performance) y loguea un warning al canal
 * 'performance' cuando el request supera el umbral.
 */
class LogSlowRequests
{
    private const QUERY_COUNT_THRESHOLD = 20;

    private const QUERY_TIME_THRESHOLD_MS = 200.0;

    public function __construct(private readonly QueryProfiler $profiler) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->profiler->reset();

        $response = $next($request);

        $queryCount = $this->profiler->queryCount();
        $queryTimeMs = $this->profiler->totalTimeMs();

        $response->headers->set('X-Debug-Query-Count', (string) $queryCount);
        $response->headers->set('X-Debug-Query-Time-Ms', (string) $queryTimeMs);

        if ($queryCount > self::QUERY_COUNT_THRESHOLD || $queryTimeMs > self::QUERY_TIME_THRESHOLD_MS) {
            Log::channel('performance')->warning('Request con alto volumen de queries', [
                'method' => $request->method(),
                'uri' => $request->path(),
                'query_count' => $queryCount,
                'query_time_ms' => $queryTimeMs,
                'user_id' => $request->user()?->id,
            ]);
        }

        return $response;
    }
}
