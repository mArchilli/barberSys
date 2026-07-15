<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // ID del preapproval autorizado en MercadoPago. Null = la
            // suscripción todavía no activó el débito automático (trial).
            $table->string('mp_preapproval_id')->nullable()->unique()->after('coupon_discount_snapshot');
            // Email de la cuenta de MP con la que el owner autorizó el débito
            // (puede diferir del email de login).
            $table->string('mp_payer_email')->nullable()->after('mp_preapproval_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropUnique(['mp_preapproval_id']);
            $table->dropColumn(['mp_preapproval_id', 'mp_payer_email']);
        });
    }
};
