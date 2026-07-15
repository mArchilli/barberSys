<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Cobro individual de una suscripción, registrado desde el webhook de
 * MercadoPago (nunca se crea a mano).
 *
 * La facturación tiene su propio ciclo de vida (`invoice_status`), separado
 * del estado del pago (`status`), porque la autorización de comprobantes en
 * Facturante es asincrónica contra AFIP: primero se SOLICITA el comprobante
 * (se obtiene un IdComprobante provisorio → invoice_reference) y recién
 * después AFIP lo AUTORIZA con un CAE. Ver CLAUDE.md.
 */
class SubscriptionPayment extends Model
{
    use HasFactory;

    public const STATUS_APPROVED = 'approved';

    // Ciclo de vida de la factura (columna invoice_status).
    public const INVOICE_NO_FACTURADO = 'no_facturado';

    public const INVOICE_SOLICITADO = 'solicitado';

    public const INVOICE_AUTORIZADO = 'autorizado';

    public const INVOICE_FALLIDO = 'fallido';

    protected $fillable = [
        'subscription_id',
        'mp_payment_id',
        'amount',
        'status',
        'paid_at',
        'invoice_status',
        'invoice_reference',
        'cae',
        'cae_vencimiento',
        'invoice_issued_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'cae_vencimiento' => 'date',
            'invoice_issued_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * El comprobante ya obtuvo su CAE de AFIP. Sólo en este estado el owner
     * puede ver la factura como "lista" o descargarla (regla de CLAUDE.md).
     */
    public function isInvoiceAuthorized(): bool
    {
        return $this->invoice_status === self::INVOICE_AUTORIZADO;
    }

    /**
     * Comprobante solicitado a Facturante pero todavía sin autorizar por AFIP.
     * El job de reconciliación recorre exactamente estos registros.
     */
    public function isInvoiceRequested(): bool
    {
        return $this->invoice_status === self::INVOICE_SOLICITADO;
    }

    /**
     * Todavía no se emitió (o el intento falló): candidato a (re)solicitar la
     * factura. Idempotencia del servicio de facturación.
     */
    public function needsInvoice(): bool
    {
        return in_array($this->invoice_status, [self::INVOICE_NO_FACTURADO, self::INVOICE_FALLIDO], true);
    }

    /**
     * Compatibilidad con el NullInvoicingService/FacturanteInvoicingService
     * actual (stub REST a reescribir con SOAP). Una vez que el servicio real
     * maneje invoice_status, este chequeo se reemplaza por needsInvoice().
     */
    public function isInvoiced(): bool
    {
        return $this->invoice_reference !== null;
    }
}
