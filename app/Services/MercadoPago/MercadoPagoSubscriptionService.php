<?php

namespace App\Services\MercadoPago;

use App\Models\Subscription;
use Illuminate\Support\Facades\Http;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\PreApproval\PreApprovalClient;
use MercadoPago\Client\PreApprovalPlan\PreApprovalPlanClient;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Net\MPSearchRequest;
use MercadoPago\Resources\Payment;
use MercadoPago\Resources\PreApproval;
use MercadoPago\Resources\PreApprovalPlan;

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
     * URL absoluta pública para el back_url del checkout (u otras URLs que
     * MercadoPago necesite alcanzar). En producción APP_URL ya es el dominio
     * público real y route() alcanza. En desarrollo local detrás de un túnel
     * (ej. ngrok), la app se navega por localhost pero MercadoPago exige un
     * dominio público — para eso existe APP_PUBLIC_URL (opcional).
     *
     * A propósito NO se resuelve forzando el root URL global de Laravel
     * (URL::forceRootUrl): eso rompería el resto de la app, que debe seguir
     * generando rutas same-origin con el host real desde el que se navega
     * (Ziggy en el frontend, CSRF, cookies de sesión). Solo esta URL puntual
     * usa el dominio del túnel.
     */
    public static function publicRouteUrl(string $routeName, array $parameters = []): string
    {
        $publicBase = config('services.mercadopago.public_app_url');

        if (! $publicBase) {
            return route($routeName, $parameters);
        }

        return rtrim($publicBase, '/').route($routeName, $parameters, false);
    }

    /**
     * Monto real a cobrar en este ciclo (mensual o anual, según
     * Subscription::amountToCharge()) con el descuento del cupón aplicado si
     * corresponde. Reemplaza al antiguo monthlyAmountFor(): con planes
     * anuales el monto ya no es necesariamente "mensual", así que ahora
     * parte de amountToCharge() en vez de effectivePrice() — para
     * billing_cycle=monthly ambos valen lo mismo, así que el comportamiento
     * mensual no cambia.
     *
     * REGLA (CLAUDE.md): el descuento se lee SIEMPRE de coupon_discount_snapshot
     * (congelado al momento del canje), nunca del Coupon vigente vía coupon_id.
     *
     * Ventana de descuento:
     *  - Mensual: los primeros duration_months COBROS aprobados (como el
     *    snapshot no guarda fecha de canje, se mide contando pagos aprobados
     *    ya registrados, no meses calendario).
     *  - Anual: el descuento aplica UNA ÚNICA VEZ, sobre el primer cobro
     *    anual completo — duration_months no aplica a un cobro que ocurre
     *    una vez al año. Desde el segundo cobro aprobado en adelante, precio
     *    pleno.
     */
    public function chargeAmountFor(Subscription $subscription): float
    {
        $base = $subscription->amountToCharge();
        $snapshot = $subscription->coupon_discount_snapshot;

        if (! $snapshot) {
            return round($base, 2);
        }

        if ($subscription->isAnnual()) {
            if ($subscription->approvedPaymentsCount() >= 1) {
                return round($base, 2);
            }
        } else {
            $duration = $snapshot['duration_months'] ?? null;

            if ($duration !== null && $subscription->approvedPaymentsCount() >= (int) $duration) {
                return round($base, 2);
            }
        }

        $discounted = match ($snapshot['type'] ?? null) {
            'percentage' => $base * (1 - ((float) $snapshot['value']) / 100),
            'fixed' => $base - (float) $snapshot['value'],
            default => $base,
        };

        return round(max($discounted, 0), 2);
    }

    /**
     * Crea el Plan de MercadoPago (preapproval_plan) para esta suscripción y
     * devuelve el recurso (incluye init_point, la URL de checkout hosteada a
     * la que se redirige al owner para autorizar el débito).
     *
     * NO se crea el preapproval directamente (auto_recurring suelto): la
     * aplicación de MercadoPago exige que todo preapproval esté vinculado a
     * un plan (confirmado empíricamente — sin plan, la API devuelve un 500
     * genérico), y crear el preapproval nosotros mismos vinculado a un plan
     * exige tokenizar la tarjeta del owner (card_token_id, documentado por
     * MP como obligatorio en ese caso). Redirigiendo al init_point del PLAN,
     * en cambio, MercadoPago aloja todo el checkout (elegir/tokenizar medio
     * de pago) y crea el preapproval del otro lado — Pelito nunca maneja
     * datos de tarjeta.
     *
     * Cada suscripción recibe su PROPIO plan (no uno compartido por Plan de
     * Pelito): el checkout hosteado no admite pasar external_reference al
     * preapproval resultante, así que preapproval_plan_id es la única clave
     * de correlación disponible para saber, al recibir el webhook, a qué
     * Subscription le corresponde el preapproval recién autorizado.
     *
     * billing_cycle=annual se modela con frequency=12/frequency_type=months
     * (MercadoPago no tiene un frequency_type "years") y transaction_amount
     * en base a amountToCharge() (el equivalente mensual × 12): un único
     * cargo anual, no 12 cuotas mensuales reducidas.
     */
    public function createPreapprovalPlan(Subscription $subscription, string $backUrl): PreApprovalPlan
    {
        $client = new PreApprovalPlanClient;
        $isAnnual = $subscription->isAnnual();

        return $client->create([
            'reason' => 'Suscripción Pelito — Plan '.$subscription->plan->name.($isAnnual ? ' (anual)' : ''),
            'back_url' => $backUrl,
            'auto_recurring' => [
                'frequency' => $isAnnual ? 12 : 1,
                'frequency_type' => 'months',
                'transaction_amount' => $this->chargeAmountFor($subscription),
                'currency_id' => 'ARS',
            ],
        ]);
    }

    public function getPreapproval(string $preapprovalId): PreApproval
    {
        return (new PreApprovalClient)->get($preapprovalId);
    }

    /**
     * Busca el preapproval generado por el checkout hosteado de un plan
     * puntual. Se usa tanto en el retorno del checkout (para reflejar el
     * estado sin esperar al webhook) como en el webhook mismo (para resolver
     * a qué Subscription corresponde, vía mp_preapproval_plan_id). Devuelve
     * null si el owner todavía no completó el checkout.
     *
     * Puede haber MÁS DE UN preapproval para el mismo plan — confirmado
     * empíricamente: un intento de pago rechazado dentro del checkout de MP
     * (ej. tarjeta inválida) genera un preapproval `cancelled`, y el reintento
     * ("Pagar con otro medio", sin salir del checkout) genera uno SEGUNDO,
     * `authorized`, para el mismo preapproval_plan_id. Por eso nunca alcanza
     * con tomar el primer resultado de la búsqueda: se prioriza el que esté
     * `authorized`, y si ninguno lo está todavía, el más reciente por
     * date_created (probablemente el intento en curso).
     */
    public function findPreapprovalByPlan(string $preapprovalPlanId): ?PreApproval
    {
        $client = new PreApprovalClient;
        $search = $client->search(new MPSearchRequest(10, 0, [
            'preapproval_plan_id' => $preapprovalPlanId,
        ]));

        $results = $search->results ?? [];

        if (empty($results)) {
            return null;
        }

        $chosen = null;

        foreach ($results as $result) {
            if ($result->status === 'authorized') {
                $chosen = $result;
                break;
            }

            if ($chosen === null || ($result->date_created ?? '') > ($chosen->date_created ?? '')) {
                $chosen = $result;
            }
        }

        return $this->getPreapproval($chosen->id);
    }

    /**
     * Actualiza el monto de un preapproval ya autorizado (upgrade de plan o
     * fin de la ventana de descuento del cupón). NUNCA usar el precio de
     * catálogo directamente acá: siempre chargeAmountFor() de la suscripción
     * concreta (regla de grandfathering, ver CLAUDE.md).
     *
     * No usar para una suscripción billing_cycle=annual con motivo de
     * upgrade de plan: ver SubscriptionController::upgrade() — el nuevo
     * monto anual se aplica recién en la próxima renovación, no de forma
     * inmediata con prorrateo (regla documentada en CLAUDE.md).
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

    /**
     * Igual que getPayment(), pero devuelve el JSON crudo en vez del recurso
     * tipado del SDK. Necesario porque MercadoPago\Resources\Payment\TransactionData
     * no declara `subscription_id` ni `plan_id` — son campos reales que la API
     * devuelve dentro de `point_of_interaction.transaction_data` para pagos
     * generados por una suscripción, pero el deserializador del SDK descarta
     * en silencio cualquier campo que la clase de destino no declare como
     * propiedad (ver MercadoPago\Serialization\Serializer::_deserializeFromJson).
     * Esos dos campos son la única forma de enlazar un pago recurrente con el
     * preapproval/plan que lo originó — external_reference viene null.
     */
    public function getPaymentRaw(string $paymentId): array
    {
        $response = Http::withToken((string) config('services.mercadopago.access_token'))
            ->get("https://api.mercadopago.com/v1/payments/{$paymentId}")
            ->throw();

        return $response->json();
    }
}
