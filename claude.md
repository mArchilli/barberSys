# BarberSys — Contexto del proyecto

## Descripción
Plataforma SaaS de gestión operativa y financiera para barberías. No es un sistema de turnos ni de cobro online: es una herramienta de administración interna. Los dueños de barbería gestionan sus sucursales, sus barberos, y controlan su rentabilidad real. Los barberos cargan manualmente los servicios que van prestando.

## Stack tecnológico
- Backend: Laravel
- Frontend: React vía Inertia.js (sin API REST separada para el uso normal de la app)
- Estilos: Tailwind CSS
- Base de datos: MySQL, instancia única con multi-tenancy lógico (no una BD por cliente)
- Starter kit: Laravel Breeze (stack Inertia + React)

## Roles del sistema (columna `users.role`)
- `admin`: dueños de la marca BarberSys. Acceso de soporte a todos los clientes.
- `owner`: dueño de barbería/s. Puede operar también como barbero (cargar sus propios servicios).
- `barber`: cuenta creada por su owner. Solo ve y carga su propia actividad.

## Rol vs. Plan — regla de oro
Son conceptos distintos y NUNCA deben mezclarse en el código:
- **Rol** controla qué acciones puede ejecutar un usuario (permisos).
- **Plan** (vía `subscriptions`) controla límites de creación (cuántas barberías, cuántos barberos puede tener un owner) — nunca controla qué secciones ve. Las secciones se muestran según los datos reales existentes (ej. el panel consolidado aparece solo cuando el owner ya tiene más de una barbería cargada, sin importar el plan).

## Modelo de datos completo

### plans (catálogo)
id, name, slug (unique), max_barberias (int, nullable=ilimitado), max_barberos (int, nullable=ilimitado), price (decimal 10,2), is_custom (boolean), active (boolean)

### subscriptions
id, owner_id (FK users), plan_id (FK plans), custom_max_barberias (int, nullable), custom_max_barberos (int, nullable), status (enum: trial/active/past_due/cancelled), starts_at (date), trial_ends_at (date, nullable), ends_at (date, nullable)

### users (extiende la tabla de Breeze)
+ role (enum: admin/owner/barber), barberia_id (FK barberias, nullable, solo barber), salary_type (enum: fixed/commission, nullable, solo barber), salary_amount (decimal, nullable), commission_pct (decimal, nullable), phone (nullable), active (boolean)

### barberias
id, owner_id (FK users), name, address (nullable), active (boolean)

### servicios
id, barberia_id (FK), name, price (decimal), active (boolean)

### medios_pago
id, barberia_id (FK), name, active (boolean)

### clientes
id, barberia_id (FK), name, phone (nullable)

### cortes (tabla transaccional central)
id, barberia_id (FK, denormalizado), barbero_id (FK users), servicio_id (FK), cliente_id (FK), medio_pago_id (FK), price (decimal, autocompletado desde servicio pero editable), performed_at (date)

### gastos (plantilla recurrente)
id, barberia_id (FK), name, amount (decimal), type (enum: fijo/variable), is_recurring (boolean), active (boolean)

### gasto_registros (instancia mensual)
id, gasto_id (FK, nullable), barberia_id (FK), amount (decimal), month (date), is_deleted_for_month (boolean)
Índice único recomendado: (gasto_id, month)

## Reglas de negocio clave
- **Multi-tenancy**: modelos que cuelgan de `barberia_id` (Servicio, Cliente, Corte, Gasto, MedioPago) usan un Global Scope de Eloquent que filtra automáticamente por las barberías accesibles al usuario autenticado.
- **Límites de plan**: se validan en el momento de crear una barbería o un barbero (Form Request o middleware `CheckPlanLimits`), comparando contra `subscriptions` (con fallback a `plans` si no hay override custom). Nunca es una restricción solo visual.
- **Sueldo fijo**: se resta `salary_amount` del total facturado del mes, sin importar cuánto facturó el barbero.
- **Sueldo por comisión**: `commission_pct` sobre la suma de `cortes.price` de ese barbero en el período.
- **Gastos recurrentes**: un job mensual (Laravel Task Scheduling) genera `gasto_registros` a partir de `gastos` activos con `is_recurring=true`. El dueño puede editar o marcar `is_deleted_for_month=true` una instancia puntual sin afectar la plantilla ni meses futuros.
- **Neto mensual**: Σ(cortes.price) − Σ(sueldos calculados) − Σ(gasto_registros.amount, excluyendo is_deleted_for_month).

## Estructura de carpetas
app/Http/Controllers/{Owner,Barber,Admin}/
app/Http/Middleware/{CheckRole,CheckPlanLimits}.php
app/Http/Requests/
app/Models/
app/Policies/
app/Scopes/BelongsToBarberiaScope.php
app/Services/{ComisionCalculator,GastoRecurrenteGenerator}.php
app/Console/Commands/GenerarGastosMensuales.php
resources/js/Pages/{Owner,Barber,Admin}/
routes/web.php (rutas agrupadas por prefijo de rol + middleware)

## Plan de desarrollo por fases
El proyecto avanza por funcionalidades completas de punta a punta (migración + modelo + controlador + vista), no por capas. Fases: 0-Setup, 1-Fundación (auth/roles/tenancy), 2-Gestión de barberos, 3-Catálogos (servicios/medios de pago), 4-Clientes, 5-Registro de cortes, 6-Dashboard y métricas, 7-Módulo financiero, 8-Multi-barbería, 9-Panel admin, 10-Pulido y testing.

Cuando te pida implementar una fase, ceñite estrictamente a su alcance — no adelantes funcionalidad de fases posteriores.