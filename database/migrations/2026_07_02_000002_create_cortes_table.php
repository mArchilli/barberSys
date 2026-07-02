<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cortes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->foreignId('barbero_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('servicio_id')->constrained('servicios')->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('medio_pago_id')->constrained('medios_pago')->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->date('performed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cortes');
    }
};
