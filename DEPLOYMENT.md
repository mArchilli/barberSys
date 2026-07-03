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
