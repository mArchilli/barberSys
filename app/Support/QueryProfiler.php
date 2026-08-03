<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Cuenta queries y tiempo de DB del request en curso. El listener de DB::listen
 * se registra una única vez (ver AppServiceProvider::boot, solo en entorno local)
 * para que llamadas repetidas al kernel dentro de un mismo proceso PHP (ej. el
 * comando app:auditar-performance, que despacha varios requests in-process) no
 * acumulen listeners duplicados y infle los conteos.
 */
class QueryProfiler
{
    private int $queryCount = 0;

    private float $totalTimeMs = 0.0;

    private bool $listening = false;

    public function listen(): void
    {
        if ($this->listening) {
            return;
        }

        $this->listening = true;

        DB::listen(function ($query): void {
            $this->queryCount++;
            $this->totalTimeMs += $query->time;
        });
    }

    public function reset(): void
    {
        $this->queryCount = 0;
        $this->totalTimeMs = 0.0;
    }

    public function queryCount(): int
    {
        return $this->queryCount;
    }

    public function totalTimeMs(): float
    {
        return round($this->totalTimeMs, 2);
    }
}
