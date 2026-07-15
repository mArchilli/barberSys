<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Fecha del próximo cobro automático, tal como la calcula
            // MercadoPago (preapproval.next_payment_date) — se actualiza cada
            // vez que se resuelve el preapproval (retorno() del checkout,
            // webhook de subscription_preapproval) y también cuando se
            // registra un pago aprobado. Puramente informativo para el
            // owner ("vigente hasta"); nunca se usa para decidir el estado
            // real de la suscripción, eso lo maneja `status`.
            $table->timestamp('mp_next_payment_date')->nullable()->after('mp_preapproval_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('mp_next_payment_date');
        });
    }
};
