<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const STATUSES_ORIGINALES = ['pendiente', 'confirmado', 'cancelado', 'completado', 'no_show'];

    private const STATUSES_CON_EXPIRADO = ['pendiente', 'confirmado', 'cancelado', 'completado', 'no_show', 'expirado'];

    // Sin doctrine/dbal en el proyecto, ->change() no está disponible para
    // enums. En MySQL (producción) se modifica la columna con SQL crudo. En
    // SQLite (test suite, ver phpunit.xml) el enum es en realidad un CHECK
    // constraint (ver SQLiteGrammar::typeEnum) y SQLite no soporta ALTER
    // COLUMN: hay que reconstruir la tabla completa para cambiarlo.
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildSqliteTurnosTable(self::STATUSES_CON_EXPIRADO);
            return;
        }

        $lista = "'".implode("', '", self::STATUSES_CON_EXPIRADO)."'";
        DB::statement("ALTER TABLE turnos MODIFY status ENUM({$lista}) NOT NULL DEFAULT 'pendiente'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildSqliteTurnosTable(self::STATUSES_ORIGINALES);
            return;
        }

        $lista = "'".implode("', '", self::STATUSES_ORIGINALES)."'";
        DB::statement("ALTER TABLE turnos MODIFY status ENUM({$lista}) NOT NULL DEFAULT 'pendiente'");
    }

    private function rebuildSqliteTurnosTable(array $statuses): void
    {
        Schema::rename('turnos', 'turnos_old');

        // SQLite no renombra el índice junto con la tabla (queda apuntando a
        // turnos_old, con su nombre original): hay que sacarlo de en medio
        // antes de crear la tabla nueva con un índice del mismo nombre.
        DB::statement('DROP INDEX IF EXISTS turnos_barberia_id_fecha_barbero_id_index');

        Schema::create('turnos', function (Blueprint $table) use ($statuses) {
            $table->id();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->foreignId('barbero_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('servicio_id')->constrained('servicios')->cascadeOnDelete();
            $table->string('cliente_nombre');
            $table->string('cliente_telefono');
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->enum('status', $statuses)->default('pendiente');
            $table->timestamps();

            $table->index(['barberia_id', 'fecha', 'barbero_id']);
        });

        DB::statement('
            INSERT INTO turnos (id, barberia_id, barbero_id, servicio_id, cliente_nombre, cliente_telefono, fecha, hora_inicio, hora_fin, status, created_at, updated_at)
            SELECT id, barberia_id, barbero_id, servicio_id, cliente_nombre, cliente_telefono, fecha, hora_inicio, hora_fin, status, created_at, updated_at FROM turnos_old
        ');

        Schema::dropIfExists('turnos_old');
    }
};
