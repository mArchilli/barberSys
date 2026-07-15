<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Datos fiscales del owner para la Factura C (Facturante).
            // Opcionales: si están vacíos se factura a consumidor final con
            // el nombre de la cuenta. Se piden en la activación de la
            // suscripción, no en el registro.
            $table->string('cuit')->nullable()->after('phone');
            $table->string('razon_social')->nullable()->after('cuit');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cuit', 'razon_social']);
        });
    }
};
