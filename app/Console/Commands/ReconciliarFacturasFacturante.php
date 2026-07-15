<?php

namespace App\Console\Commands;

use App\Models\SubscriptionPayment;
use Illuminate\Console\Command;

/**
 * ESQUELETO — NO IMPLEMENTADO todavía.
 *
 * Reconcilia el estado de las facturas que quedaron en 'solicitado': la
 * autorización de comprobantes en Facturante es asincrónica contra AFIP, así
 * que al solicitar un comprobante sólo obtenemos un IdComprobante provisorio
 * (guardado en subscription_payments.invoice_reference) y el CAE se confirma
 * después. Este comando recorre esos pagos y consulta su estado real.
 *
 * QUÉ FALTA PARA COMPLETARLO (bloqueado en el WSDL + credenciales de Facturante):
 *   1. Inyectar el servicio de facturación real (FacturanteInvoicingService,
 *      a reescribir con SOAP) y llamar a su operación `DetalleComprobante`
 *      con el IdComprobante de cada pago.
 *   2. Interpretar el estado devuelto por AFIP:
 *        - autorizado → invoice_status = 'autorizado', completar cae,
 *          cae_vencimiento e invoice_issued_at.
 *        - rechazado/definitivamente fallido → invoice_status = 'fallido'
 *          (registrar en system_error_logs con el subscription_payment_id).
 *        - todavía en trámite → dejar en 'solicitado' para el próximo pase.
 *   3. Registrar la corrida en SystemJobRun (mismo patrón que
 *      GenerarGastosMensuales) para que aparezca en Admin > Salud técnica.
 *   4. Programarlo en bootstrap/app.php (hay una línea comentada ahí).
 *
 * ALTERNATIVA: si Facturante confirma que ofrece webhooks de estado (ver el
 * pedido a su soporte técnico), este polling puede reemplazarse por un
 * segundo endpoint de webhook que reciba el CAE y actualice el pago. En ese
 * caso este comando no haría falta — pero el modelo de datos (invoice_status,
 * cae, cae_vencimiento) sirve igual para ambos caminos.
 */
class ReconciliarFacturasFacturante extends Command
{
    protected $signature = 'app:reconciliar-facturas-facturante';

    protected $description = 'Reconcilia contra AFIP las facturas de Facturante en estado solicitado (pendiente de implementar)';

    public function handle(): int
    {
        // El esqueleto ya deja resuelta la selección de candidatos; sólo falta
        // la llamada a Facturante (bloqueada en el WSDL). Se corta acá a
        // propósito para no operar sin el servicio real.
        $pendientes = SubscriptionPayment::where('invoice_status', SubscriptionPayment::INVOICE_SOLICITADO)->count();

        $this->warn('Reconciliación de facturas: pendiente de implementar (requiere el SoapClient de Facturante).');
        $this->line("Pagos en estado 'solicitado' esperando CAE: {$pendientes}");

        return self::SUCCESS;
    }
}
