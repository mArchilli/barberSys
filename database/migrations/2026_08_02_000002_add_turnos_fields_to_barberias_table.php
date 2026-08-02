<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barberias', function (Blueprint $table) {
            $table->boolean('turnos_enabled')->default(false)->after('active');
            $table->string('public_slug')->unique()->nullable()->after('turnos_enabled');
            $table->string('whatsapp_number')->nullable()->after('public_slug');
        });
    }

    public function down(): void
    {
        Schema::table('barberias', function (Blueprint $table) {
            $table->dropColumn(['turnos_enabled', 'public_slug', 'whatsapp_number']);
        });
    }
};
