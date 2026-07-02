<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gasto_registros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gasto_id')->nullable()->constrained('gastos')->nullOnDelete();
            $table->foreignId('barberia_id')->constrained('barberias')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('month');
            $table->boolean('is_deleted_for_month')->default(false);
            $table->timestamps();

            // Evita que el job mensual (o una carga manual) duplique la
            // instancia de un mismo gasto para el mismo mes.
            $table->unique(['gasto_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gasto_registros');
    }
};
