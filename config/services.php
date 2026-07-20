<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // MercadoPago Suscripciones (preapproval). El entorno (test/producción)
    // se deduce del prefijo del access token — TEST- o APP_USR- — vía
    // MercadoPagoSubscriptionService::environment(); nunca de una env var aparte.
    'mercadopago' => [
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
        'webhook_url' => env('MERCADOPAGO_WEBHOOK_URL'),
        // Opcional, solo para desarrollo local detrás de un túnel (ej. ngrok):
        // dominio público desde el que MercadoPago puede alcanzar la app para
        // el back_url del checkout. NO se usa para nada más — no reemplaza
        // APP_URL ni afecta cómo el resto de la app genera sus rutas (Ziggy,
        // CSRF, sesión). En producción queda vacío: APP_URL ya es el dominio
        // público real y route() alcanza. Ver MercadoPagoSubscriptionService::publicRouteUrl().
        'public_app_url' => env('APP_PUBLIC_URL'),
    ],

    // Facturante (facturación electrónica). Si api_key está vacía, el sistema
    // opera con NullInvoicingService (sin facturación automática) — ver el
    // binding condicional en AppServiceProvider.
    'facturante' => [
        'api_key' => env('FACTURANTE_API_KEY'),
        'base_url' => env('FACTURANTE_BASE_URL', 'https://api.facturante.com'),
    ],

    // Números de WhatsApp para el patrón wa.me (link con mensaje precargado,
    // sin envío automático vía WhatsApp Business API). Soporte y ventas son
    // casos de uso distintos (owner ya activo vs. prospecto en la landing) y
    // pueden terminar en números/personas distintas — cada uno se lee de su
    // propia env var, aunque hoy compartan el mismo valor.
    'whatsapp' => [
        'support_number' => env('WHATSAPP_SUPPORT_NUMBER'),
        'sales_number' => env('WHATSAPP_SALES_NUMBER'),
    ],

];
