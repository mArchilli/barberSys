<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('subscriptions')->cascadeOnDelete();
            // ID del pago en MercadoPago. Unique: el webhook puede notificar
            // el mismo pago varias veces y debe ser idempotente.
            $table->string('mp_payment_id')->unique();
            $table->decimal('amount', 10, 2);
            // Estado tal como lo reporta MP (approved/rejected/pending/etc.).
            $table->string('status');
            $table->timestamp('paid_at')->nullable();

            // --- Facturación electrónica (Facturante), desacoplada del cobro ---
            // La autorización de comprobantes en Facturante es ASINCRÓNICA contra
            // AFIP: al solicitar el comprobante se obtiene un IdComprobante
            // provisorio, y el CAE (dato legal) se confirma después. Por eso el
            // estado de la factura tiene su propio ciclo de vida, separado de
            // `status` (que es el estado del pago en MP). Ver CLAUDE.md.
            //   no_facturado → sin intento de facturación (default; NullInvoicingService)
            //   solicitado   → CrearComprobante OK; IdComprobante en invoice_reference, esperando CAE
            //   autorizado   → CAE confirmado por AFIP (cae + cae_vencimiento poblados)
            //   fallido      → la solicitud de emisión falló (ver system_error_logs para reintentar)
            $table->enum('invoice_status', ['no_facturado', 'solicitado', 'autorizado', 'fallido'])
                ->default('no_facturado');
            // IdComprobante provisorio que devuelve Facturante al solicitar la
            // emisión (todavía sin autorizar). Null hasta pasar a 'solicitado'.
            $table->string('invoice_reference')->nullable();
            // Datos legales del comprobante autorizado — necesarios ante una
            // auditoría, no son anecdóticos. Se completan al pasar a 'autorizado'.
            $table->string('cae')->nullable();
            $table->date('cae_vencimiento')->nullable();
            // Momento en que el comprobante quedó autorizado (CAE emitido).
            $table->timestamp('invoice_issued_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_payments');
    }
};
