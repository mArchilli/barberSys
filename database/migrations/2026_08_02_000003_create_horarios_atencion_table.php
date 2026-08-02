<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_atencion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Sin unique: a propósito, para permitir más de un bloque horario
            // por día (turno mañana/tarde) sin tener que tocar el esquema más
            // adelante. Se va a consultar mucho desde el motor de
            // disponibilidad, de ahí el índice compuesto desde ya.
            $table->index(['barberia_id', 'dia_semana']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios_atencion');
    }
};
