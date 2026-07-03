<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cortes', function (Blueprint $table) {
            $table->index(['barberia_id', 'performed_at']);
            $table->index(['barbero_id', 'performed_at']);
        });
    }

    public function down(): void
    {
        // MySQL usa estos índices compuestos para respaldar las FK de barberia_id/barbero_id
        // (consolidó los índices simples originales al crear estos). Hay que restaurar un
        // índice simple en cada columna antes de poder borrar los compuestos.
        Schema::table('cortes', function (Blueprint $table) {
            $table->index('barberia_id');
            $table->index('barbero_id');
        });

        Schema::table('cortes', function (Blueprint $table) {
            $table->dropIndex(['barberia_id', 'performed_at']);
            $table->dropIndex(['barbero_id', 'performed_at']);
        });
    }
};
