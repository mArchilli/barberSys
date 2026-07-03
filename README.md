# Pelito

Plataforma SaaS de gestión operativa y financiera para barberías. No es un sistema de turnos ni de cobro online: es una herramienta de administración interna. Los dueños de barbería gestionan sus sucursales y barberos, y controlan su rentabilidad real; los barberos cargan manualmente los servicios que van prestando.

Ver [CLAUDE.md](CLAUDE.md) para el modelo de datos completo, las reglas de negocio y las convenciones del proyecto.

## Stack

- Backend: Laravel 12
- Frontend: React vía Inertia.js
- Estilos: Tailwind CSS
- Base de datos: MySQL (multi-tenancy lógico, instancia única)
- Tests: PHPUnit

## Setup local

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate
```

Editá `.env` con tus credenciales de MySQL local (`DB_CONNECTION=mysql` y el resto de `DB_*`), y dejá `APP_LOCALE=es` como está en el example — la app está en español y depende de `lang/es/validation.php` para los mensajes de error.

```bash
php artisan migrate

npm run dev        # Vite, en una terminal
php artisan serve  # servidor de desarrollo, en otra
```

Para que corran los gastos recurrentes en local sin esperar al cron real:

```bash
php artisan app:generar-gastos-mensuales   # una vez
php artisan schedule:work                  # simula el cron, corre en foreground
```

## Tests

```bash
php artisan test
```

Corre sobre SQLite en memoria (configurado en `phpunit.xml`), no toca la base de datos de desarrollo.

## Deploy a producción

Ver [DEPLOYMENT.md](DEPLOYMENT.md): variables de entorno, migraciones, cron del scheduler, backups y logging.
