# Pelito — Contexto del proyecto

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
id, name, slug (unique), max_barberias (int, nullable=ilimitado), max_barberos (int, nullable=ilimitado), price (decimal 10,2), is_custom (boolean), active (boolean), features (json, nullable — feature flags que gatean funcionalidad real, ver regla abajo), included_items (json, nullable, default `[]` — array de strings descriptivos, ver regla abajo)

### subscriptions
id, owner_id (FK users), plan_id (FK plans), custom_max_barberias (int, nullable), custom_max_barberos (int, nullable), status (enum: trial/active/past_due/cancelled), starts_at (date), trial_ends_at (date, nullable), ends_at (date, nullable), coupon_id (FK coupons, nullable), coupon_discount_snapshot (json, nullable — congela type/value/duration_months del cupón al momento del canje, ver regla de cupones abajo)

### coupons (catálogo, alta por admin)
id, code (string, unique), type (enum: percentage/fixed), value (decimal 10,2), max_uses (int, nullable=ilimitado), used_count (int, default 0), duration_months (int, nullable=indefinido), applicable_plan_ids (json, nullable=aplica a todos los planes), expires_at (date, nullable), active (boolean, default true), created_by (FK users, el admin que lo creó)

### users (extiende la tabla de Breeze)
+ role (enum: admin/owner/barber), barberia_id (FK barberias, nullable, solo barber), salary_type (enum: fixed/commission, nullable, solo barber), salary_amount (decimal, nullable), commission_pct (decimal, nullable), phone (nullable), active (boolean)

### barberias
id, owner_id (FK users), name, address (nullable), active (boolean)

### servicios
id, barberia_id (FK), name, price (decimal), active (boolean)

### medios_pago
id, barberia_id (FK), name, active (boolean)

### clientes
id, barberia_id (FK), name, phone (nullable), active (boolean, default true)

### cortes (tabla transaccional central)
id, barberia_id (FK, denormalizado), barbero_id (FK users), servicio_id (FK), cliente_id (FK), medio_pago_id (FK), price (decimal, autocompletado desde servicio pero editable), performed_at (date)

### gastos (plantilla recurrente)
id, barberia_id (FK), name, amount (decimal), type (enum: fijo/variable), is_recurring (boolean), active (boolean)

### gasto_registros (instancia mensual)
id, gasto_id (FK, nullable), barberia_id (FK), amount (decimal), month (date), is_deleted_for_month (boolean)
Índice único recomendado: (gasto_id, month)

## Reglas de negocio clave
- **Multi-tenancy**: modelos que cuelgan de `barberia_id` (Servicio, Cliente, Corte, Gasto, MedioPago) usan un Global Scope de Eloquent que filtra automáticamente por las barberías accesibles al usuario autenticado.
- **Única excepción al Global Scope**: `App\Http\Controllers\Admin\OwnerController` (vista de soporte de solo lectura, Fase 9) es el ÚNICO lugar del proyecto donde está permitido bypasear `BelongsToBarberiaScope` (vía `withoutGlobalScope`), porque el admin necesita ver datos across todos los tenants por diseño. Cada bypass debe ir documentado con un comentario explícito en la query. Ningún otro controller (Owner, Barber, ni futuros) debe tomar esto como precedente — si otro lugar del código necesita bypasear el scope, es señal de un bug de tenancy, no de un caso legítimo nuevo.
- **Límites de plan**: se validan en el momento de crear una barbería o un barbero (Form Request o middleware `CheckPlanLimits`), comparando contra `subscriptions` (con fallback a `plans` si no hay override custom). Nunca es una restricción solo visual.
- **Sueldo fijo**: se resta `salary_amount` del total facturado del mes, sin importar cuánto facturó el barbero.
- **Sueldo por comisión**: `commission_pct` sobre la suma de `cortes.price` de ese barbero en el período.
- **Gastos recurrentes**: un job mensual (Laravel Task Scheduling) genera `gasto_registros` a partir de `gastos` activos con `is_recurring=true`. El dueño puede editar o marcar `is_deleted_for_month=true` una instancia puntual sin afectar la plantilla ni meses futuros.
- **Neto mensual**: Σ(cortes.price) − Σ(sueldos calculados) − Σ(gasto_registros.amount, excluyendo is_deleted_for_month).
- **Clientes implícitos**: los clientes se crean de forma implícita al cargar un corte (autocompletar un cliente existente vía search, o crear uno nuevo con el nombre tipeado en el mismo request). No existe alta manual de clientes como flujo principal — el CRUD de Clientes es solo de consulta, edición y baja.
- **`must_change_password`**: se fuerza en `true` únicamente cuando la contraseña fue generada por un tercero en nombre del usuario (alta de barbero por el owner, reseteo de clave). Cuando el usuario elige su propia contraseña (registro de owner), el flag se setea explícitamente en `false`. Este criterio aplica a cualquier flujo de alta futuro, no solo a los actuales.
- **Grandfathering de precio de planes**: editar `price` en el catálogo de un plan existente (Admin → Planes) NUNCA afecta retroactivamente a los owners ya suscriptos a ese plan — solo aplica a suscripciones nuevas de ahí en adelante. Hoy, sin billing real integrado, esto no requiere ningún mecanismo especial (no hay nada que recalcule cobros existentes). Cuando se integre MercadoPago, el precio de catálogo NO debe usarse para modificar preapprovals ya autorizados de owners existentes — solo para altas nuevas. Si un owner necesita un precio distinto al de catálogo, se maneja vía `subscriptions.custom_price` (override puntual), nunca editando el plan.
- **`features` vs. `included_items` (no confundir)**: `features` es un json de flags booleanos (catálogo en `Plan::KNOWN_FEATURES`) que gatea funcionalidad real en código — hoy solo `ranking_barberos`. `included_items` es un array de strings puramente descriptivo (lo que el owner ve al elegir el plan en el registro, y lo que el equipo ve como referencia en Admin → Planes): no activa nada por sí solo. Si un ítem de `included_items` menciona algo que en realidad depende de un feature flag, quien edite el catálogo debe activar también ese flag — si no, el plan promete algo que no cumple. Cada plan carga su propia lista completa y autocontenida (nunca "todo lo anterior +", eso es solo para lectura humana en la especificación de negocio).
- **Cupones de descuento — LIMITACIÓN CONOCIDA sin cobro real integrado**: el sistema de cupones (`Coupon`, `CouponRedemptionService`, Admin → Cupones) está completo a nivel de datos y validación — canje atómico con `lockForUpdate` para evitar condiciones de carrera sobre `max_uses`, snapshot congelado en `subscriptions.coupon_discount_snapshot` (type/value/duration_months tal como estaban al canjear, para que una edición posterior del cupón no altere retroactivamente lo que un owner ya tiene aplicado) — pero **el descuento no tiene ningún efecto sobre un cobro procesado todavía**, porque no existe integración de MercadoPago Suscripciones (solo está documentada la estrategia). Quien construya esa integración de cobro **debe leer `subscriptions.coupon_discount_snapshot`** (nunca el `Coupon` vigente vía `coupon_id`, que puede haber cambiado desde el canje) al calcular el monto a enviar a MercadoPago. Hasta que eso exista, aplicar un cupón no cambia el `effectivePrice()` de la suscripción ni ningún cobro real.

## Estructura de carpetas
app/Http/Controllers/{Owner,Barber,Admin}/
app/Http/Middleware/{CheckRole,CheckPlanLimits,CheckBarberiaOwnership}.php
app/Http/Requests/
app/Models/
app/Policies/
app/Scopes/BelongsToBarberiaScope.php
app/Services/{ComisionCalculator,GastoRecurrenteGenerator,PlanLimitService,CouponRedemptionService}.php
app/Console/Commands/GenerarGastosMensuales.php
resources/js/Pages/{Owner,Barber,Admin}/
routes/web.php (rutas agrupadas por prefijo de rol + middleware)

## Patrón de rutas anidadas por barbería (owner)

Todas las rutas de gestión del owner viven bajo `/owner/barberias/{barberia}/...`. La barbería es un parámetro de ruta resuelto por route model binding, no un query param.

```
GET  /owner/barberias                    → selector (o redirect si solo hay 1)
GET  /owner/barberias/{barberia}/dashboard
GET  /owner/barberias/{barberia}/barberos
GET  /owner/barberias/{barberia}/servicios
GET  /owner/barberias/{barberia}/medios-pago
```

**Naming convention**: `owner.barberias.{seccion}.{accion}`, ej. `owner.barberias.barberos.index`.

**Middleware `checkBarberiaOwnership`**: valida que `$barberia->owner_id === Auth::id()`. Se aplica a todo el grupo nested.

**`currentBarberia`**: se inyecta como shared prop lazy en `HandleInertiaRequests` leyendo el route param `barberia`. Las páginas lo consumen con `usePage().props.currentBarberia` — nunca lo reciben como prop explícita.

**Rutas en frontend**: siempre pasar `{ barberia: currentBarberia.id }` como segundo argumento a `route()`.

**Seguridad en capas**:
1. `BelongsToBarberiaScope` filtra colecciones (solo barberías del owner autenticado).
2. `checkBarberiaOwnership` middleware bloquea acceso directo por ID a barberías ajenas.
3. Controllers verifican explícitamente que la entidad pertenece a la barbería del parámetro de ruta (no solo al owner).

## Plan de desarrollo por fases
El proyecto avanza por funcionalidades completas de punta a punta (migración + modelo + controlador + vista), no por capas. Fases: 0-Setup, 1-Fundación (auth/roles/tenancy), 2-Gestión de barberos, 3-Catálogos (servicios/medios de pago), 4-Clientes, 5-Registro de cortes, 6-Dashboard y métricas, 7-Módulo financiero, 8-Multi-barbería, 9-Panel admin, 10-Pulido y testing.

Cuando te pida implementar una fase, ceñite estrictamente a su alcance — no adelantes funcionalidad de fases posteriores.

## Definición de hecho (Definition of Done)

Una funcionalidad está terminada cuando cumple **todos** los puntos siguientes:

### Backend
- Migración existe, corre limpia y tiene `down()` correcto.
- Modelo con `$fillable`, `casts()` y relaciones definidas.
- Controlador con todas las acciones requeridas por la fase, **scopeado** por owner/barbería (ningún owner puede tocar datos de otro).
- Form Request con validación server-side completa; nunca validación solo en frontend.
- Límites de plan chequeados server-side vía `PlanLimitService` donde aplica.
- Rutas registradas en `routes/web.php` bajo el grupo de rol correcto con middleware `role:X`.

### Frontend
- Vistas necesarias implementadas en `resources/js/Pages/{Rol}/`.
- **Link en el menú de navegación** del layout del rol correspondiente (`AuthenticatedLayout` con lógica por rol) — ninguna pantalla queda accesible solo por URL directa.
- Estado activo del ítem de menú resuelto con `route().current(...)`.
- Errores de validación del servidor mostrados en el formulario con `InputError`.
- Acciones destructivas o irreversibles con confirmación antes de ejecutar.

### Seguridad y calidad
- Ninguna ruta o acción permite leer/modificar datos de otro owner (verificado en controller, no solo en middleware).
- Sin código de fases futuras introducido.
- Sin `console.log`, `dd()` ni `dump()` en el código entregado.

## Pendientes conocidos

Ninguno — la deuda de tokens Tailwind detectada en Fase 8 se resolvió en Fase 10 (todas las pantallas usan `shadow-brand-card` / `bg-brand-primary-soft` / `text-brand-primary-soft-text`).