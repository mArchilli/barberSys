<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caja_cierres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->date('day');

            // Nullable: al reabrir la caja se limpian estos dos, sin borrar
            // la fila ni sus detalles (ver CajaCierreDetalle), justamente
            // para no perder los conteos ya cargados. closed_at null =
            // "abierta" (recién creada nunca o reabierta); no null = "cerrada".
            $table->foreignId('closed_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Un solo cierre por barbería y día.
            $table->unique(['barberia_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caja_cierres');
    }
};
