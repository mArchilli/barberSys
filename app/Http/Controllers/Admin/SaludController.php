<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemErrorLog;
use App\Models\SystemJobRun;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SaludController extends Controller
{
    private const GASTOS_JOB_NAME = 'app:generar-gastos-mensuales';

    private const DIAS_MAX_SIN_CORRER = 32;

    private const HORAS_ERRORES_RECIENTES = 24;

    public function index(): Response
    {
        $jobRuns = SystemJobRun::orderByDesc('started_at')->limit(20)->get();

        $ultimoRunGastos = SystemJobRun::where('job_name', self::GASTOS_JOB_NAME)
            ->orderByDesc('started_at')
            ->first();

        $ultimoRunExitosoGastos = SystemJobRun::where('job_name', self::GASTOS_JOB_NAME)
            ->where('status', 'success')
            ->orderByDesc('started_at')
            ->first();

        $diasSinCorrer = $ultimoRunExitosoGastos
            ? $ultimoRunExitosoGastos->started_at->diffInDays(Carbon::now())
            : null;

        $alertaGastos = ($ultimoRunGastos !== null && $ultimoRunGastos->status === 'failed')
            || $diasSinCorrer === null
            || $diasSinCorrer > self::DIAS_MAX_SIN_CORRER;

        $errorLogs = SystemErrorLog::with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $erroresRecientes = SystemErrorLog::where('created_at', '>=', Carbon::now()->subHours(self::HORAS_ERRORES_RECIENTES))
            ->exists();

        $todoEnOrden = ! $alertaGastos && ! $erroresRecientes;

        return Inertia::render('Admin/Salud/Index', [
            'todoEnOrden' => $todoEnOrden,
            'alertaGastos' => [
                'activa' => $alertaGastos,
                'ultimoStatus' => $ultimoRunGastos?->status,
                'ultimoRunExitosoAt' => optional($ultimoRunExitosoGastos?->started_at)->toDateTimeString(),
                'diasSinCorrer' => $diasSinCorrer,
            ],
            'jobRuns' => $jobRuns->map(fn (SystemJobRun $run) => [
                'id' => $run->id,
                'job_name' => $run->job_name,
                'started_at' => $run->started_at->toDateTimeString(),
                'finished_at' => optional($run->finished_at)->toDateTimeString(),
                'status' => $run->status,
                'summary' => $run->summary,
                'error_message' => $run->error_message,
            ]),
            'errorLogs' => $errorLogs->map(fn (SystemErrorLog $log) => [
                'id' => $log->id,
                'exception_class' => $log->exception_class,
                'message' => $log->message,
                'file' => $log->file,
                'line' => $log->line,
                'url' => $log->url,
                'user_name' => $log->user?->name,
                'created_at' => $log->created_at->toDateTimeString(),
            ]),
        ]);
    }
}
