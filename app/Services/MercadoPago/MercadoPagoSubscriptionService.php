<?php

namespace App\Services\MercadoPago;

use App\Models\Subscription;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\PreApproval\PreApprovalClient;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Resources\Payment;
use MercadoPago\Resources\PreApproval;

/**
 * Wrapper del SDK de MercadoPago Suscripciones (preapproval, NO Checkout Pro).
 *
 * El entorno (test/producción) NUNCA se configura a mano: se deduce del
 * prefijo de MERCADOPAGO_ACCESS_TOKEN (TEST- = prueba, APP_USR- = producción).
 * Pasar a producción es únicamente rotar las credenciales en el .env.
 */
class MercadoPagoSubscriptionService
{
    public const ENV_TEST = 'test';

    public const ENV_PRODUCTION = 'production';

    public const ENV_NOT_CONFIGURED = 'not_configured';

    /** Token cargado pero con un prefijo que no es TEST- ni APP_USR- (credencial mal pegada). */
    public const ENV_UNKNOWN = 'unknown';

    public function __construct()
    {
        MercadoPagoConfig::setAccessToken((string) config('services.mercadopago.access_token'));
    }

    /**
     * Detecta el entorno operativo a partir del prefijo del access token.
     * Estático a propósito: el panel de Salud técnica lo consulta sin
     * necesidad de instanciar el SDK.
     */
    public static function environment(): string
    {
        $token = (string) config('services.mercadopago.access_token');

        return match (true) {
            $token === '' => self::ENV_NOT_CONFIGURED,
            str_starts_with($token, 'TEST-') => self::ENV_TEST,
            str_starts_with($token, 'APP_USR-') => self::ENV_PRODUCTION,
            default => self::ENV_UNKNOWN,
        };
    }

    public static function isConfigured(): bool
    {
        return in_array(self::environment(), [self::ENV_TEST, self::ENV_PRODUCTION], true);
    }

    /**
     * Monto mensual real a cobrar: precio efectivo de la suscripción
     * (custom_price u override de catálogo) menos el descuento del cupón.
     *
     * REGLA (CLAUDE.md): el descuento se lee SIEMPRE de coupon_discount_snapshot
     * (congelado al momento del canje), nunca del Coupon vigente vía coupon_id.
     * duration_months limita el descuento a los primeros N cobros aprobados:
     * como el snapshot no guarda fecha de canje, la ventana se mide contando
     * pagos aprobados ya registrados, no meses calendario.
     */
    public function monthlyAmountFor(Subscription $subscription): float
    {
        $base = $subscription->effectivePrice();
        $snapshot = $subscription->coupon_discount_snapshot;

        if (! $snapshot) {
            return round($base, 2);
        }

        $duration = $snapshot['duration_months'] ?? null;

        if ($duration !== null && $subscription->approvedPaymentsCount() >= (int) $duration) {
            return round($base, 2);
        }

        $discounted = match ($snapshot['type'] ?? null) {
            'percentage' => $base * (1 - ((float) $snapshot['value']) / 100),
            'fixed' => $base - (float) $snapshot['value'],
            default => $base,
        };

        return round(max($discounted, 0), 2);
    }

    /**
     * Crea el preapproval en MP y devuelve el recurso (incluye init_point,
     * la URL a la que se redirige al owner para autorizar el débito).
     */
    public function createPreapproval(Subscription $subscription, string $payerEmail, string $backUrl): PreApproval
    {
        $client = new PreApprovalClient;

        return $client->create([
            'reason' => 'Suscripción Pelito — Plan '.$subscription->plan->name,
            'external_reference' => (string) $subscription->id,
            'payer_email' => $payerEmail,
            'back_url' => $backUrl,
            'auto_recurring' => [
                'frequency' => 1,
                'frequency_type' => 'months',
                'transaction_amount' => $this->monthlyAmountFor($subscription),
                'currency_id' => 'ARS',
            ],
        ]);
    }

    public function getPreapproval(string $preapprovalId): PreApproval
    {
        return (new PreApprovalClient)->get($preapprovalId);
    }

    /**
     * Actualiza el monto de un preapproval ya autorizado (upgrade de plan o
     * fin de la ventana de descuento del cupón). NUNCA usar el precio de
     * catálogo directamente acá: siempre monthlyAmountFor() de la suscripción
     * concreta (regla de grandfathering, ver CLAUDE.md).
     */
    public function updateAmount(string $preapprovalId, float $amount): PreApproval
    {
        return (new PreApprovalClient)->update($preapprovalId, [
            'auto_recurring' => [
                'transaction_amount' => $amount,
                'currency_id' => 'ARS',
            ],
        ]);
    }

    public function cancelPreapproval(string $preapprovalId): PreApproval
    {
        return (new PreApprovalClient)->update($preapprovalId, [
            'status' => 'cancelled',
        ]);
    }

    /**
     * Consulta un pago puntual contra la API. El webhook usa esto para
     * verificar cada notificación (nunca se confía en el payload recibido).
     */
    public function getPayment(string $paymentId): Payment
    {
        return (new PaymentClient)->get((int) $paymentId);
    }
}
