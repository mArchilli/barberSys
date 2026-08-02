<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barberia_turno_excepciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->date('date');
            $table->boolean('enabled');
            $table->timestamps();

            // Anula turnos_enabled para esa fecha puntual, en cualquier
            // sentido (ver Barberia::turnosActivosEn).
            $table->unique(['barberia_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barberia_turno_excepciones');
    }
};
