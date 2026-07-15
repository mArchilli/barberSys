<?php

namespace App\Services\Invoicing;

use App\Models\SubscriptionPayment;

/**
 * Implementación no-op: el sistema opera sin facturación automática mientras
 * no haya credenciales de Facturante cargadas. El pago queda con
 * invoice_reference null, listo para un backfill cuando se configure la
 * integración real.
 */
class NullInvoicingService implements InvoicingServiceInterface
{
    public function issueInvoiceFor(SubscriptionPayment $payment): void
    {
        // Intencionalmente vacío: no bloquear el cobro por falta de facturación.
    }
}
