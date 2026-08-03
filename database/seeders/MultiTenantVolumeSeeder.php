<?php

namespace Database\Seeders;

use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeder de VOLUMEN multi-tenant: no es para mostrar pantallas con datos lindos
 * (eso ya lo hace DemoDataSeeder), es para darle a las queries cross-tenant del
 * panel admin (BusinessMetricsService, Admin\OwnerController, etc.) un dataset
 * del orden de magnitud real de una plataforma SaaS con muchos negocios chicos,
 * y así poder medir su performance contra algo, no contra 4 owners de prueba.
 *
 * No pisa datos existentes (no usa firstOrCreate/truncate): agrega OWNER_COUNT
 * owners nuevos con email único generado acá. Se puede correr sobre una base
 * que ya tenga DemoDataSeeder/UsersTestSeeder sin conflicto.
 *
 * OWNER_COUNT=220 queda en el extremo bajo del rango pedido (200-500) a
 * propósito: ya genera ~75-80k cortes (el volumen real que le interesa medir
 * al panel admin), y sembrarlo entero en un dev local tarda un par de minutos.
 * Si hace falta más volumen para un test puntual, subir la constante.
 *
 * Un owner queda marcado como EL más grande de todos (tier 'mega' reforzado,
 * ver $isMegaMax) con email fijo owner.mega@barbersys.test — es el target
 * determinístico para medir el peor caso de un solo tenant (Dashboard,
 * Finanzas, Caja, Turnos, reserva pública) sin tener que adivinar cuál de los
 * 220 es el más grande.
 */
class MultiTenantVolumeSeeder extends Seeder
{
    private const OWNER_COUNT = 220;

    private const PASSWORD = 'password';

    /**
     * share: proporción de owners en este tier.
     * barberias: cantidad fija de barberías del owner.
     * barberos: rango de barberos por barbería.
     * cortes_semana: rango de cortes por barbería por semana.
     * meses: meses de historial de cortes hacia atrás desde hoy.
     */
    private const TIERS = [
        'small' => [
            'share' => 0.55, 'barberias' => 1, 'barberos' => [1, 2],
            'cortes_semana' => [3, 7], 'meses' => 4, 'plan' => 'plan-1',
        ],
        'medium' => [
            'share' => 0.28, 'barberias' => 2, 'barberos' => [2, 3],
            'cortes_semana' => [6, 12], 'meses' => 4, 'plan' => 'plan-2',
        ],
        'large' => [
            'share' => 0.12, 'barberias' => 3, 'barberos' => [3, 5],
            'cortes_semana' => [12, 20], 'meses' => 5, 'plan' => 'plan-3',
        ],
        'mega' => [
            'share' => 0.05, 'barberias' => 3, 'barberos' => [6, 8],
            'cortes_semana' => [20, 35], 'meses' => 6, 'plan' => 'plan-4',
        ],
    ];

    private const SERVICIOS = [
        ['name' => 'Corte Clásico', 'price' => 3500],
        ['name' => 'Corte + Barba', 'price' => 5500],
        ['name' => 'Afeitado Premium', 'price' => 4200],
        ['name' => 'Corte Niño', 'price' => 2800],
    ];

    private const MEDIOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'MercadoPago'];

    private string $hashedPassword;

    /** @var array<string, int> slug => plan id */
    private array $planIds = [];

    private int $barberiaGlobalIndex = 0;

    public function run(): void
    {
        $this->hashedPassword = Hash::make(self::PASSWORD);
        $this->planIds = Plan::pluck('id', 'slug')->all();

        $secuencia = $this->buildTierSequence();
        $total = count($secuencia);

        $bar = $this->command?->getOutput()?->createProgressBar($total);
        $bar?->start();

        foreach ($secuencia as $i => $tier) {
            $this->seedOwner($tier, esMegaMax: $i === 0);
            $bar?->advance();
        }

        $bar?->finish();

        $this->command?->newLine(2);
        $this->command?->info("Owners sembrados: {$total}");
        $this->command?->info('Owner de mayor volumen (single-tenant peor caso): owner.mega@barbersys.test / '.self::PASSWORD);
    }

    /**
     * El primer elemento es siempre 'mega' (reforzado más abajo vía esMegaMax)
     * para garantizar que exista un único owner claramente más grande que el
     * resto; el resto de la secuencia se arma por proporción y se mezcla.
     */
    private function buildTierSequence(): array
    {
        $resto = self::OWNER_COUNT - 1;
        $secuencia = [];

        foreach (self::TIERS as $tier => $config) {
            $cantidad = (int) round($config['share'] * $resto);
            $secuencia = array_merge($secuencia, array_fill(0, $cantidad, $tier));
        }

        // El redondeo por tier puede quedar corto/largo respecto a $resto;
        // se completa o recorta con 'small', el tier por defecto de la plataforma.
        while (count($secuencia) < $resto) {
            $secuencia[] = 'small';
        }
        $secuencia = array_slice($secuencia, 0, $resto);

        shuffle($secuencia);

        array_unshift($secuencia, 'mega');

        return $secuencia;
    }

    private function seedOwner(string $tier, bool $esMegaMax): void
    {
        static $secuencial = 0;
        $secuencial++;

        $config = self::TIERS[$tier];

        $email = $esMegaMax
            ? 'owner.mega@barbersys.test'
            : "owner{$secuencial}.{$tier}@barbersys.test";

        $owner = User::create([
            'name' => $esMegaMax ? 'Owner Mega (mayor volumen)' : fake()->company(),
            'email' => $email,
            'password' => $this->hashedPassword,
            'role' => 'owner',
            'active' => true,
            'must_change_password' => false,
            'email_verified_at' => now(),
        ]);

        $this->seedSubscription($owner, $config['plan']);

        $cortesSemanaRange = $config['cortes_semana'];
        $meses = $config['meses'];

        if ($esMegaMax) {
            // Refuerza el tier 'mega' para que este owner puntual quede muy
            // por encima del resto de owners 'mega' (que ya son el tier más
            // activo) — así el peor caso de un tenant queda inequívoco.
            $cortesSemanaRange = [
                (int) round($cortesSemanaRange[1] * 1.4),
                (int) round($cortesSemanaRange[1] * 1.8),
            ];
            $meses = 7;
        }

        for ($b = 1; $b <= $config['barberias']; $b++) {
            $this->seedBarberia($owner, $config['barberos'], $cortesSemanaRange, $meses, $esMegaMax);
        }
    }

    private function seedSubscription(User $owner, string $planSlug): void
    {
        $roll = fake()->numberBetween(1, 100);
        $status = match (true) {
            $roll <= 70 => 'active',
            $roll <= 85 => 'trial',
            $roll <= 95 => 'past_due',
            default => 'cancelled',
        };

        $trialEndsAt = $status === 'trial'
            ? now()->addDays(fake()->numberBetween(-3, 20))->toDateString()
            : null;

        Subscription::create([
            'owner_id' => $owner->id,
            'plan_id' => $this->planIds[$planSlug],
            'billing_cycle' => fake()->boolean(20) ? 'annual' : 'monthly',
            'status' => $status,
            'starts_at' => now()->subMonths(fake()->numberBetween(1, 8))->toDateString(),
            'trial_ends_at' => $trialEndsAt,
            'ends_at' => $status === 'cancelled'
                ? now()->subDays(fake()->numberBetween(1, 30))->toDateString()
                : null,
        ]);
    }

    private function seedBarberia(User $owner, array $barberosRange, array $cortesSemanaRange, int $meses, bool $esMegaMax): void
    {
        $this->barberiaGlobalIndex++;

        $nombre = $owner->name.' - Sucursal '.$this->barberiaGlobalIndex;
        $turnosEnabled = $esMegaMax || fake()->boolean(60);

        $barberia = Barberia::create([
            'owner_id' => $owner->id,
            'name' => $nombre,
            'address' => fake()->streetAddress(),
            'active' => true,
            'turnos_enabled' => $turnosEnabled,
            'public_slug' => $turnosEnabled
                ? Str::slug($nombre).'-'.$this->barberiaGlobalIndex
                : null,
            'whatsapp_number' => fake()->numerify('54911########'),
        ]);

        $servicios = collect(self::SERVICIOS)->map(
            fn (array $s) => Servicio::create([
                'barberia_id' => $barberia->id,
                'name' => $s['name'],
                'price' => $s['price'],
                'active' => true,
            ])
        );

        $medioPagoIds = collect(self::MEDIOS_PAGO)->map(
            fn (string $nombre) => DB::table('medios_pago')->insertGetId([
                'barberia_id' => $barberia->id,
                'name' => $nombre,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ])
        );

        if ($turnosEnabled) {
            $this->seedHorariosAtencion($barberia->id);
        }

        $barberoIds = $this->seedBarberos($barberia->id, $barberosRange);
        $clienteIds = $this->seedClientes($barberia->id, $esMegaMax ? [40, 70] : [8, 20]);

        $this->seedCortes($barberia->id, $barberoIds, $servicios, $clienteIds, $medioPagoIds, $cortesSemanaRange, $meses);
        $this->seedTurnos($barberia->id, $barberoIds, $servicios, $esMegaMax);
    }

    private function seedHorariosAtencion(int $barberiaId): void
    {
        $rows = [];

        // Lunes(1) a sábado(6), un único bloque 09:00-19:00 — alcanza para que
        // DisponibilidadService devuelva slots reales en la reserva pública.
        for ($dia = 1; $dia <= 6; $dia++) {
            $rows[] = [
                'barberia_id' => $barberiaId,
                'dia_semana' => $dia,
                'hora_inicio' => '09:00:00',
                'hora_fin' => '19:00:00',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('horarios_atencion')->insert($rows);
    }

    /** @return list<int> */
    private function seedBarberos(int $barberiaId, array $barberosRange): array
    {
        $cantidad = fake()->numberBetween($barberosRange[0], $barberosRange[1]);
        $rows = [];

        for ($i = 1; $i <= $cantidad; $i++) {
            $esComision = $i % 2 === 0;

            $rows[] = [
                'name' => fake()->firstName().' '.fake()->lastName(),
                'email' => Str::uuid().'@barbersys.test',
                'email_verified_at' => now(),
                'password' => $this->hashedPassword,
                'role' => 'barber',
                'barberia_id' => $barberiaId,
                'salary_type' => $esComision ? 'commission' : 'fixed',
                'salary_amount' => $esComision ? null : fake()->randomElement([200000, 250000, 300000]),
                'commission_pct' => $esComision ? fake()->randomElement([35, 40, 45, 50]) : null,
                'active' => true,
                'must_change_password' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('users')->insert($rows);

        return DB::table('users')
            ->where('barberia_id', $barberiaId)
            ->where('role', 'barber')
            ->pluck('id')
            ->all();
    }

    /** @return list<int> */
    private function seedClientes(int $barberiaId, array $rango): array
    {
        $cantidad = fake()->numberBetween($rango[0], $rango[1]);
        $rows = [];

        for ($i = 0; $i < $cantidad; $i++) {
            $rows[] = [
                'barberia_id' => $barberiaId,
                'name' => fake()->firstName().' '.fake()->lastName(),
                'phone' => fake()->numerify('11########'),
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('clientes')->insert($rows);

        return DB::table('clientes')->where('barberia_id', $barberiaId)->pluck('id')->all();
    }

    /**
     * Genera semana a semana (no de una, con una cantidad fija total) para que
     * la actividad varíe de semana a semana en vez de quedar perfectamente
     * pareja — más parecido a un negocio real.
     */
    private function seedCortes(int $barberiaId, array $barberoIds, $servicios, array $clienteIds, $medioPagoIds, array $cortesSemanaRange, int $meses): void
    {
        $servicios = $servicios->all();
        $medioPagoIds = $medioPagoIds->all();

        $semanas = (int) round($meses * 4.345);
        $inicio = now()->subMonths($meses)->startOfWeek();
        $ahora = now();

        $rows = [];

        for ($s = 0; $s < $semanas; $s++) {
            $inicioSemana = (clone $inicio)->addWeeks($s);
            $cantidad = fake()->numberBetween($cortesSemanaRange[0], $cortesSemanaRange[1]);

            for ($i = 0; $i < $cantidad; $i++) {
                $performedAt = (clone $inicioSemana)->addDays(fake()->numberBetween(0, 6));

                if ($performedAt->greaterThan($ahora)) {
                    continue;
                }

                /** @var Servicio $servicio */
                $servicio = $servicios[array_rand($servicios)];

                $rows[] = [
                    'barberia_id' => $barberiaId,
                    'barbero_id' => $barberoIds[array_rand($barberoIds)],
                    'servicio_id' => $servicio->id,
                    'cliente_id' => $clienteIds[array_rand($clienteIds)],
                    'medio_pago_id' => $medioPagoIds[array_rand($medioPagoIds)],
                    'price' => max(0, (float) $servicio->price + fake()->randomFloat(2, -300, 500)),
                    'performed_at' => $performedAt->toDateString(),
                    'created_at' => $performedAt,
                    'updated_at' => $performedAt,
                ];

                if (count($rows) >= 1000) {
                    DB::table('cortes')->insert($rows);
                    $rows = [];
                }
            }
        }

        if ($rows !== []) {
            DB::table('cortes')->insert($rows);
        }
    }

    /**
     * Volumen moderado a propósito (no busca stressear la tabla turnos, sino
     * que el calendario del owner y la reserva pública tengan contenido real
     * al abrir un día cualquiera del rango sembrado).
     */
    private function seedTurnos(int $barberiaId, array $barberoIds, $servicios, bool $esMegaMax): void
    {
        $servicios = $servicios->all();
        $porDiaRange = $esMegaMax ? [3, 12] : [0, 6];

        $rows = [];

        for ($d = -30; $d <= 14; $d++) {
            $fecha = now()->addDays($d)->startOfDay();

            if ($fecha->isSunday()) {
                continue;
            }

            $cantidad = fake()->numberBetween($porDiaRange[0], $porDiaRange[1]);

            for ($i = 0; $i < $cantidad; $i++) {
                $horaInicio = fake()->numberBetween(18, 37) * 15;
                $horaInicioCarbon = $fecha->copy()->startOfDay()->addMinutes($horaInicio);
                $duracion = fake()->randomElement([30, 30, 45, 60]);
                $horaFinCarbon = (clone $horaInicioCarbon)->addMinutes($duracion);

                /** @var Servicio $servicio */
                $servicio = $servicios[array_rand($servicios)];

                $rows[] = [
                    'barberia_id' => $barberiaId,
                    'barbero_id' => fake()->boolean(85) ? $barberoIds[array_rand($barberoIds)] : null,
                    'servicio_id' => $servicio->id,
                    'cliente_nombre' => fake()->firstName().' '.fake()->lastName(),
                    'cliente_telefono' => fake()->numerify('11########'),
                    'fecha' => $fecha->toDateString(),
                    'hora_inicio' => $horaInicioCarbon->format('H:i:s'),
                    'hora_fin' => $horaFinCarbon->format('H:i:s'),
                    'status' => $this->rollTurnoStatus($d),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($rows, 1000) as $chunk) {
            DB::table('turnos')->insert($chunk);
        }
    }

    private function rollTurnoStatus(int $diasDesdeHoy): string
    {
        if ($diasDesdeHoy < 0) {
            return fake()->randomElement([
                'completado', 'completado', 'completado', 'completado',
                'no_show', 'cancelado', 'cancelado',
            ]);
        }

        return fake()->randomElement(['pendiente', 'pendiente', 'confirmado', 'confirmado', 'cancelado']);
    }
}
