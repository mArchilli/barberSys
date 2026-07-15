# Deploy a producción

## Variables de entorno

Partí de `.env.example` y ajustá al menos esto para producción:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
APP_KEY=                    # generar con `php artisan key:generate` si no existe

APP_LOCALE=es
APP_FALLBACK_LOCALE=es

DB_CONNECTION=mysql
DB_HOST=...
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

LOG_CHANNEL=daily
LOG_LEVEL=warning           # 'debug' es demasiado verboso para producción

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

`APP_DEBUG=false` es obligatorio: con `true` en producción, cualquier excepción no controlada expone stack traces (rutas de archivo, queries, credenciales de config) a quien la dispare.

## Migraciones

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build

php artisan migrate --force   # --force es necesario porque APP_ENV=production bloquea migrate interactivo
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Si cambiás `.env` después de un deploy, corré `php artisan config:clear` (o `config:cache` de nuevo) — con la config cacheada, Laravel ya no relee el archivo `.env` en cada request.

## Cron del scheduler (obligatorio)

`GenerarGastosMensuales` (el job que genera los `gasto_registros` del mes) está programado en `bootstrap/app.php` vía `$schedule->command(...)->monthlyOn(1, '00:00')`. Laravel **no tiene un daemon propio** para esto — necesita que el cron del sistema operativo dispare `schedule:run` cada minuto, y el scheduler interno decide qué comandos le tocan correr en ese minuto:

```
* * * * * cd /ruta/al/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

Agregalo con `crontab -e` en el usuario que corre la app. Sin esta línea, el comando mensual de gastos recurrentes nunca se ejecuta solo — solo corre si alguien lo dispara a mano con `php artisan app:generar-gastos-mensuales`.

Para confirmar que quedó bien enganchado sin esperar al día 1 del mes:

```bash
php artisan schedule:list    # muestra la próxima corrida programada
```

## Integraciones externas (MercadoPago + Facturante)

Pasar de test a producción es **solo cambiar variables de entorno** — el código no distingue entornos por su cuenta.

### MercadoPago Suscripciones

```
MERCADOPAGO_ACCESS_TOKEN=   # TEST-... en desarrollo, APP_USR-... en producción
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_URL=https://tu-dominio.com/webhooks/mercadopago
```

- El sistema **detecta el modo automáticamente** por el prefijo del access token y lo muestra en Admin → Salud técnica ("Modo: Prueba" / "Modo: Producción"). Antes de dar por cerrado un deploy a producción, verificá ahí que diga **Producción** — si quedó "Modo: Prueba", quedaron credenciales de test olvidadas. Ojo: esta detección es solo por prefijo (`APP_USR-`), así que una cuenta de prueba vendedor (sandbox) también puede mostrar "Producción" — no usar el badge como única fuente de verdad si hay dudas, confirmar el `collector_id`/nombre de la app en el panel de MercadoPago.
- **Configurá el webhook DENTRO de la aplicación real de producción, no de ninguna app/cuenta de prueba usada durante desarrollo** — la URL y los eventos de webhook se configuran por aplicación de MercadoPago, no se heredan entre apps ni entre cuentas. Apuntá a `POST /webhooks/mercadopago` (con el path completo) con los eventos `payment` y `subscription_preapproval`. La ruta es pública y está excluida de CSRF; la autenticidad se verifica consultando cada recurso contra la API. Si un pago se acredita en MercadoPago pero `subscription_payments` nunca se completa y no aparece nada en `system_error_logs`, sospechar primero de un webhook mal configurado (o configurado en la app equivocada) antes que de un bug de código — se puede confirmar mandando un POST de prueba directo a la ruta y viendo si el controller responde.
- Recordá `php artisan config:cache` después de rotar credenciales.
- **Si el deploy corre detrás de un load balancer o CDN que termina TLS** (no aplica a un Nginx+PHP-FPM simple en el mismo servidor, que ya informa el esquema correcto vía `fastcgi_param`): agregar `$middleware->trustProxies(...)` en `bootstrap/app.php` (`withMiddleware`), o Laravel va a generar URLs con `http://` aunque el visitante esté en `https://` — el navegador bloquea eso como "contenido mixto" en cualquier request que arme una URL absoluta (ej. el `back_url` de MercadoPago, o cualquier link). Detectable en desarrollo local probando detrás de un túnel como ngrok, que reproduce el mismo escenario.

**Desarrollo local con credenciales reales (test o producción)**: MercadoPago exige que el `back_url` del checkout sea un dominio público — rechaza `localhost` (`"Invalid value for back_url, must be a valid URL"`). Para probar el flujo completo en local hace falta un túnel (ej. `ngrok http 8000`) y setear `APP_PUBLIC_URL` con ese dominio en `.env`:
```
APP_PUBLIC_URL=https://tu-subdominio.ngrok-free.dev
```
Esta variable es opcional y **solo** afecta el `back_url` que se envía a MercadoPago (vía `MercadoPagoSubscriptionService::publicRouteUrl()`) — a propósito no se usa `APP_URL` ni se fuerza el root URL global de Laravel, porque eso rompería el resto de la app (Ziggy, CSRF, cookies de sesión dejarían de ser same-origin con el navegador). Dejar `APP_PUBLIC_URL` vacía en producción: ahí `APP_URL` ya es el dominio público real y alcanza.

### Facturante

```
FACTURANTE_API_KEY=         # vacío = sin facturación automática (fallback silencioso)
```

- Sin API key, los cobros se registran igual pero no generan Factura C (`NullInvoicingService`). Con la key cargada, cada pago aprobado emite factura automáticamente.
- Las emisiones fallidas NO bloquean el cobro: quedan en Admin → Salud técnica (errores con `subscription_payment_id` en el contexto) para reintento manual o backfill.
- El estado conectado/no conectado también se ve en Admin → Salud técnica → Estado de integraciones externas.

## Backups de MySQL

No hay ningún paquete de backup instalado (evaluá `spatie/laravel-backup` si más adelante querés algo integrado a Artisan). Como piso mínimo, dado que son datos financieros reales de terceros:

- **Frecuencia recomendada**: dump diario completo + retención de al menos 14-30 días. Si el proveedor de hosting ya ofrece snapshots automáticos de la instancia de MySQL (RDS, Cloud SQL, etc.), preferí eso a un script casero.
- **Cron de ejemplo** (dump diario a las 3am, comprimido, con rotación manual de los últimos 14 días):

```
0 3 * * * mysqldump -u USUARIO -pCONTRASEÑA barberSys | gzip > /ruta/backups/barberSys-$(date +\%Y\%m\%d).sql.gz && find /ruta/backups -name "barberSys-*.sql.gz" -mtime +14 -delete
```

- Guardá los dumps fuera del mismo disco/servidor de la base (S3, otro host) — un backup que vive al lado de la base que respalda no sobrevive una falla de disco.
- Probá una restauración de vez en cuando. Un backup nunca verificado es una suposición, no una garantía.

## Logging y monitoreo de errores

**Piso actual**: `LOG_CHANNEL=daily` (ver arriba) escribe a `storage/logs/laravel-YYYY-MM-DD.log` con rotación automática (`LOG_DAILY_DAYS`, 14 días por default — ajustable en `config/logging.php`). Sin esto, el canal `single` por default escribe todo a un único archivo que crece sin límite.

**Si más adelante se quiere sumar Sentry** (recomendado apenas haya usuarios reales — un log en disco no alertea a nadie):

```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=TU_DSN
```

Eso agrega `SENTRY_LARAVEL_DSN` a `.env` y engancha automáticamente el reporte de excepciones no controladas. No está instalado todavía — es deliberadamente el próximo paso, no parte de este cierre de fase.
