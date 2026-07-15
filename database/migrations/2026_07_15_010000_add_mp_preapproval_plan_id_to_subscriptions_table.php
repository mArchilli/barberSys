<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // ID del Plan de MercadoPago (preapproval_plan) creado al activar.
            // Es la clave de correlación real: la app de MP requiere que cada
            // preapproval esté vinculado a un plan (no admite auto_recurring
            // suelto), y el checkout hosteado de MP no expone external_reference
            // en el preapproval resultante — así que mp_preapproval_plan_id es
            // lo único que tenemos para saber, cuando llega el webhook, a qué
            // Subscription le corresponde la suscripción recién autorizada.
            $table->string('mp_preapproval_plan_id')->nullable()->unique()->after('coupon_discount_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropUnique(['mp_preapproval_plan_id']);
            $table->dropColumn('mp_preapproval_plan_id');
        });
    }
};
