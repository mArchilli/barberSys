<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->foreignId('barbero_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('servicio_id')->constrained('servicios')->cascadeOnDelete();
            $table->string('cliente_nombre');
            $table->string('cliente_telefono');
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->enum('status', ['pendiente', 'confirmado', 'cancelado', 'completado', 'no_show'])
                ->default('pendiente');
            $table->timestamps();

            // La query más frecuente de todo el sistema de turnos: slots de
            // una barbería en una fecha, filtrados o no por barbero puntual.
            $table->index(['barberia_id', 'fecha', 'barbero_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turnos');
    }
};
