<?php

namespace App\Services\Invoicing;

use App\Models\SubscriptionPayment;
use App\Models\SystemErrorLog;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Emisión de Factura C vía la API de Facturante.
 *
 * Cumple el contrato de la interface: cualquier fallo (red, credenciales,
 * respuesta inválida) se registra en system_error_logs con el
 * subscription_payment_id en context y NO se propaga — el cobro confirmado
 * nunca se rompe por un problema de facturación. El pago queda con
 * invoice_reference null para reintentar manualmente o vía backfill.
 */
class FacturanteInvoicingService implements InvoicingServiceInterface
{
    public function issueInvoiceFor(SubscriptionPayment $payment): void
    {
        // Idempotencia: si el comprobante ya se emitió, no se factura dos veces.
        if ($payment->isInvoiced()) {
            return;
        }

        try {
            $subscription = $payment->subscription()->with(['owner', 'plan'])->first();
            $owner = $subscription->owner;
            $periodo = ($payment->paid_at ?? $payment->created_at)->format('m/Y');

            $response = Http::withToken((string) config('services.facturante.api_key'))
                ->acceptJson()
                ->timeout(15)
                ->post(rtrim((string) config('services.facturante.base_url'), '/').'/api/comprobantes', [
                    'tipo_comprobante' => 'FACTURA_C',
                    'concepto' => sprintf(
                        'Suscripción Pelito — Plan %s — [%s]',
                        $subscription->plan->name,
                        $periodo
                    ),
                    'importe_total' => (float) $payment->amount,
                    'cliente' => [
                        // "Nombre o razón social para la factura": la mayoría de
                        // los owners son personas físicas, no empresas.
                        'razon_social' => $owner->razon_social ?: $owner->name,
                        // Sin CUIT/DNI cargado se emite a consumidor final.
                        'tipo_documento' => $owner->cuit ? 'CUIT' : 'CONSUMIDOR_FINAL',
                        'numero_documento' => $owner->cuit,
                        'email' => $owner->email,
                    ],
                ])
                ->throw()
                ->json();

            $reference = $response['numero_comprobante'] ?? $response['id'] ?? null;

            if ($reference === null) {
                throw new \RuntimeException('Facturante respondió sin número de comprobante ni id.');
            }

            $payment->update([
                'invoice_reference' => (string) $reference,
                'invoice_issued_at' => now(),
            ]);
        } catch (Throwable $e) {
            SystemErrorLog::create([
                'exception_class' => get_class($e),
                'message' => 'Fallo al emitir factura en Facturante: '.$e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => null,
                'user_id' => null,
                'context' => [
                    'subscription_payment_id' => $payment->id,
                    'mp_payment_id' => $payment->mp_payment_id,
                ],
            ]);
        }
    }
}
