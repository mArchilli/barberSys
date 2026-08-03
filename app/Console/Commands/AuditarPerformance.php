<?php

namespace App\Console\Commands;

use App\Models\Barberia;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Mide queries y tiempo de DB de dos categorías de flujos, por separado, contra
 * los headers X-Debug-Query-Count / X-Debug-Query-Time-Ms que adjunta
 * App\Http\Middleware\LogSlowRequests (solo activo en local):
 *
 *  - single-tenant: pantallas de UN owner (Dashboard, Finanzas, Caja, Turnos,
 *    reserva pública), medidas contra el owner/barbería de mayor volumen del
 *    seeder (owner.mega@barbersys.test) — el peor caso dentro de un tenant.
 *  - cross-tenant: todo el panel admin (BusinessMetricsService, listado de
 *    owners, salud técnica), medido con el dataset completo del seeder
 *    cargado — el terreno más probable para problemas reales de escala SaaS.
 *
 * Despacha los requests IN-PROCESS (Kernel::handle(), sin servidor HTTP real):
 * autentica escribiendo directo el usuario en el guard (Auth::guard('web')
 * ->setUser(), el mismo mecanismo que usa TestCase::actingAs() en tests), lo
 * que evita tener que resolver login/CSRF/cookies para un comando de
 * diagnóstico. Requiere App\Support\QueryProfiler registrado (solo pasa en
 * local, ver AppServiceProvider::boot) — si los headers no aparecen, aborta
 * con un mensaje explícito en vez de reportar ceros engañosos.
 *
 * Uso: php artisan app:auditar-performance
 * Requiere MultiTenantVolumeSeeder ya corrido.
 */
class AuditarPerformance extends Command
{
    protected $signature = 'app:auditar-performance';

    protected $description = 'Mide queries/tiempo de flujos single-tenant vs. cross-tenant (requiere MultiTenantVolumeSeeder ya corrido)';

    /**
     * Hipótesis de causa conocidas de antemano por lectura de código — no son
     * el resultado de esta corrida, son contexto para no tener que releer cada
     * controller/servicio al interpretar la tabla. Quedan sueltas a propósito:
     * esto reporta y clasifica, no corrige (eso es la fase siguiente).
     */
    private const HIPOTESIS = [
        'admin.owners.index' => 'User::get() sin paginate() + subquery agregada de barberos por owner en PHP; crece linealmente con la cantidad de owners.',
        'admin.dashboard' => 'BusinessMetricsService::mrr()/ownersNearPlanLimit() traen TODAS las subscriptions/owners activos a PHP (->get()->map()) para calcular ratios/sumas que podrían resolverse en SQL.',
        'admin.owners.show' => 'Varias queries independientes (barberías, suscripción, cortes recientes, activity log) sin combinar; no crece con el dataset total pero sí con la antigüedad del owner puntual.',
        'admin.onboarding' => 'newOwnersOnboarding() hace 4 leftJoinSub agregados sobre toda la tabla cortes/servicios/medios_pago/users — no filtra por owner_id antes de agregar, barre todo el dataset aunque el resultado final sea "owners de los últimos 30 días".',
        'admin.salud' => 'Consultas acotadas con limit(), no debería escalar con el dataset — buena señal si aparece bajo en el ranking.',
        'owner.barberias.dashboard' => 'Probable agregación de cortes/gastos del período sobre la barbería más grande del dataset — candidato natural a N+1 si arma rankings por barbero en PHP en vez de GROUP BY.',
        'owner.barberias.clientes.index' => 'ClienteController::index sin paginate(): con decenas de miles de cortes acumulados, la cantidad de clientes de la barbería más grande ya no es chica.',
        'owner.barberias.turnos.index' => 'Recalcula slots/disponibilidad por barbero visible ese día; escala con cantidad de barberos, no con historial.',
    ];

    public function handle(): int
    {
        if (! app()->environment('local')) {
            $this->error('Este comando solo corre en local: la instrumentación de queries (LogSlowRequests) no está activa en otros entornos.');

            return self::FAILURE;
        }

        $owner = User::where('email', 'owner.mega@barbersys.test')->first();
        $admin = User::where('role', 'admin')->first();

        if (! $owner) {
            $this->error('No existe owner.mega@barbersys.test — corré primero: php artisan db:seed --class=MultiTenantVolumeSeeder');

            return self::FAILURE;
        }

        if (! $admin) {
            $this->error('No hay ningún usuario role=admin en la base — corré primero UsersTestSeeder o DemoDataSeeder.');

            return self::FAILURE;
        }

        // Mutación en memoria, nunca persistida: evita que ForcePasswordChange
        // redirija estos requests de auditoría a la pantalla de cambio de
        // contraseña, sin tocar el estado real de los usuarios en la base.
        $owner->must_change_password = false;
        $admin->must_change_password = false;

        $barberiaId = $this->barberiaConMasCortes($owner->id);

        if (! $barberiaId) {
            $this->error('owner.mega@barbersys.test no tiene barberías con cortes — el seeder no corrió como se esperaba.');

            return self::FAILURE;
        }

        $publicSlug = Barberia::whereKey($barberiaId)->value('public_slug');

        $this->info('Flujos single-tenant — owner.mega@barbersys.test, barbería #'.$barberiaId);
        $singleTenant = $this->medirCategoria($owner, $this->rutasSingleTenant($barberiaId, $publicSlug));
        $this->reportar($singleTenant);

        $this->newLine();
        $this->info('Flujos cross-tenant — panel admin, dataset completo');
        $crossTenant = $this->medirCategoria($admin, $this->rutasCrossTenant($owner->id));
        $this->reportar($crossTenant);

        return self::SUCCESS;
    }

    private function barberiaConMasCortes(int $ownerId): ?int
    {
        $barberiaIds = Barberia::where('owner_id', $ownerId)->pluck('id');

        return DB::table('cortes')
            ->select('barberia_id')
            ->selectRaw('count(*) as total')
            ->whereIn('barberia_id', $barberiaIds)
            ->groupBy('barberia_id')
            ->orderByDesc('total')
            ->value('barberia_id');
    }

    private function rutasSingleTenant(int $barberiaId, ?string $publicSlug): array
    {
        $rutas = [
            'owner.barberias.dashboard' => route('owner.barberias.dashboard', $barberiaId),
            'owner.barberias.finanzas' => route('owner.barberias.finanzas', $barberiaId),
            'owner.barberias.caja.index (hoy)' => route('owner.barberias.caja.index', $barberiaId),
            'owner.barberias.caja.index (-7d)' => route('owner.barberias.caja.index', $barberiaId).'?day='.now()->subDays(7)->toDateString(),
            'owner.barberias.turnos.index (hoy)' => route('owner.barberias.turnos.index', $barberiaId),
            'owner.barberias.turnos.index (+1d)' => route('owner.barberias.turnos.index', $barberiaId).'?day='.now()->addDay()->toDateString(),
            'owner.barberias.barberos.index' => route('owner.barberias.barberos.index', $barberiaId),
            'owner.barberias.clientes.index' => route('owner.barberias.clientes.index', $barberiaId),
            'owner.barberias.cortes.index' => route('owner.barberias.cortes.index', $barberiaId),
            'owner.consolidado' => route('owner.consolidado'),
            'owner.barberias.index' => route('owner.barberias.index'),
            'owner.suscripcion.index' => route('owner.suscripcion.index'),
        ];

        if ($publicSlug) {
            $rutas['public.turno.index'] = route('public.turno.index', $publicSlug);
        }

        return $rutas;
    }

    private function rutasCrossTenant(int $ownerMuestraId): array
    {
        return [
            'admin.dashboard' => route('admin.dashboard'),
            'admin.owners.index' => route('admin.owners.index'),
            'admin.owners.index (search)' => route('admin.owners.index').'?search=a',
            'admin.owners.index (status=active)' => route('admin.owners.index').'?status=active',
            'admin.owners.show' => route('admin.owners.show', $ownerMuestraId),
            'admin.onboarding.index' => route('admin.onboarding.index'),
            'admin.salud.index' => route('admin.salud.index'),
            'admin.soporte.index' => route('admin.soporte.index'),
            'admin.coupons.index' => route('admin.coupons.index'),
            'admin.surveys.index' => route('admin.surveys.index'),
            'admin.plans.index' => route('admin.plans.index'),
        ];
    }

    /** @return list<array{label: string, status: int, queries: int, time_ms: float}> */
    private function medirCategoria(User $usuario, array $rutas): array
    {
        Auth::guard('web')->setUser($usuario);

        $resultados = [];

        foreach ($rutas as $label => $uri) {
            $resultados[] = $this->medir($label, $uri);
        }

        return $resultados;
    }

    private function medir(string $label, string $uri): array
    {
        /** @var HttpKernel $kernel */
        $kernel = $this->laravel->make(HttpKernel::class);

        $request = Request::create($uri, 'GET');
        $response = $kernel->handle($request);
        $kernel->terminate($request, $response);

        $queries = $response->headers->get('X-Debug-Query-Count');
        $timeMs = $response->headers->get('X-Debug-Query-Time-Ms');

        return [
            'label' => $label,
            'status' => $response->getStatusCode(),
            'queries' => $queries !== null ? (int) $queries : -1,
            'time_ms' => $timeMs !== null ? (float) $timeMs : -1.0,
        ];
    }

    private function reportar(array $resultados): void
    {
        if ($resultados !== [] && $resultados[0]['queries'] === -1) {
            $this->error('Los headers X-Debug-Query-Count no aparecieron en la respuesta: revisá que LogSlowRequests esté registrado en bootstrap/app.php.');

            return;
        }

        usort($resultados, fn ($a, $b) => $b['queries'] <=> $a['queries']);

        $filas = array_map(fn (array $r) => [
            $r['label'],
            $r['status'],
            $r['queries'],
            $r['time_ms'],
            self::HIPOTESIS[$this->rutaBase($r['label'])] ?? '—',
        ], array_slice($resultados, 0, 10));

        $this->table(['Endpoint', 'HTTP', 'Queries', 'Tiempo DB (ms)', 'Hipótesis'], $filas);
    }

    private function rutaBase(string $label): string
    {
        return trim(preg_replace('/\s*\(.*\)$/', '', $label));
    }
}
