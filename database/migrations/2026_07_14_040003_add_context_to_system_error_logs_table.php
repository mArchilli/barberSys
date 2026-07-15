<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_error_logs', function (Blueprint $table) {
            // Datos estructurados del error (ej. subscription_payment_id de
            // una factura fallida) para poder reintentar desde un backfill
            // sin parsear el mensaje.
            $table->json('context')->nullable()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('system_error_logs', function (Blueprint $table) {
            $table->dropColumn('context');
        });
    }
};
