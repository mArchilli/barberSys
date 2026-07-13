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
    protected function resolveRangeDate(?string $value): ?Carbon
    {
        if (! is_string($value) || ! preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $matches)
            || ! checkdate((int) $matches[2], (int) $matches[3], (int) $matches[1])) {
            return null;
        }

        $date = Carbon::createFromDate((int) $matches[1], (int) $matches[2], (int) $matches[3])->startOfDay();

        return $date->isFuture() ? null : $date;
    }

    protected function resolvePeriod(Request $request): Carbon
    {
        $month = $request->query('month');

        if (is_string($month) && preg_match('/^(\d{4})-(0[1-9]|1[0-2])$/', $month, $matches)) {
            return Carbon::createFromDate((int) $matches[1], (int) $matches[2], 1)->startOfMonth();
        }

        return Carbon::now()->startOfMonth();
    }

    /**
     * Resuelve el rango activo del dashboard. Prioriza un rango personalizado,
     * luego un día, el preset de semana calendario y finalmente el mes.
     * Siempre devuelve el mismo shape [mode, start, end].
     */
    protected function resolvePeriodRange(Request $request): object
    {
        if ($request->filled('from') && $request->filled('to')) {
            $from = $this->resolveRangeDate($request->query('from'));
            $to = $this->resolveRangeDate($request->query('to'));

            if ($from && $to) {
                if ($from->gt($to)) {
                    [$from, $to] = [$to, $from];
                }

                return (object) [
                    'mode' => 'range',
                    'start' => $from->copy(),
                    'end' => $to->copy()->endOfDay(),
                ];
            }
        }

        if ($request->filled('day')) {
            $dia = $this->resolveDay($request);

            return (object) [
                'mode' => 'day',
                'start' => $dia->copy(),
                'end' => $dia->copy()->endOfDay(),
            ];
        }

        if ($request->query('preset') === 'week') {
            $hoy = Carbon::now()->startOfDay();

            return (object) [
                'mode' => 'week',
                'start' => $hoy->copy()->startOfWeek(Carbon::MONDAY),
                'end' => $hoy->copy()->endOfDay(),
            ];
        }

        $inicio = $this->resolvePeriod($request);

        return (object) [
            'mode' => 'month',
            'start' => $inicio,
            'end' => $inicio->copy()->endOfMonth(),
        ];
    }
}
