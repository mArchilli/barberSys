<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caja_cierre_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caja_cierre_id')->constrained('caja_cierres')->cascadeOnDelete();
            $table->foreignId('medio_pago_id')->constrained('medios_pago')->cascadeOnDelete();
            $table->decimal('expected_amount', 10, 2);

            // El conteo es completamente opcional e independiente por medio de
            // pago: sin default 0, para poder distinguir "sin verificar" (null)
            // de "se contó y dio 0" (valor explícito).
            $table->decimal('counted_amount', 10, 2)->nullable();

            // Se calcula (counted_amount - expected_amount) únicamente cuando
            // counted_amount no es null. Si es null, representa "sin
            // verificar" y nunca se interpreta como diferencia contra el
            // total esperado.
            $table->decimal('difference', 10, 2)->nullable();

            $table->timestamps();

            $table->unique(['caja_cierre_id', 'medio_pago_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caja_cierre_detalles');
    }
};
