<?php

namespace App\Services\Invoicing;

use App\Models\SubscriptionPayment;

/**
 * Emisión de comprobantes por cobros de suscripción.
 *
 * Contrato clave: issueInvoiceFor() NUNCA lanza excepciones. Un problema de
 * facturación (credenciales, red, API caída) jamás debe romper un cobro ya
 * confirmado — la implementación registra el fallo en system_error_logs con
 * el subscription_payment_id para reintentar manualmente o vía backfill.
 *
 * El binding es condicional (ver AppServiceProvider): con FACTURANTE_API_KEY
 * cargada se usa FacturanteInvoicingService; sin ella, NullInvoicingService.
 */
interface InvoicingServiceInterface
{
    public function issueInvoiceFor(SubscriptionPayment $payment): void;
}
