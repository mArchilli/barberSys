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
id, name, slug (unique), max_barberias (int, nullable=ilimitado), max_barberos (int, nullable=ilimitado), price (decimal 10,2), annual_price (decimal 10,2, nullable — monto MENSUAL-EQUIVALENTE del cobro anual, ej. $15.000 para un plan que se cobra $180.000/año en un único cargo; nullable=sin opción anual, igual criterio que en planes `is_custom`), is_custom (boolean), active (boolean), features (json, nullable — feature flags que gatean funcionalidad real, ver regla abajo), included_items (json, nullable, default `[]` — array de strings descriptivos, ver regla abajo)

### subscriptions
id, owner_id (FK users), plan_id (FK plans), billing_cycle (enum: monthly/annual, default monthly), custom_max_barberias (int, nullable), custom_max_barberos (int, nullable), custom_price (decimal 10,2, nullable — override puntual del precio mensual de catálogo, plan a medida), custom_annual_price (decimal 10,2, nullable — mismo patrón que custom_price pero para el ciclo anual), status (enum: trial/active/past_due/cancelled), starts_at (date), trial_ends_at (date, nullable), ends_at (date, nullable), coupon_id (FK coupons, nullable), coupon_discount_snapshot (json, nullable — congela type/value/duration_months del cupón al momento del canje, ver regla de cupones abajo), mp_preapproval_plan_id (string, unique, nullable — id del Plan de MercadoPago creado al activar; ver regla de Suscripciones con plan abajo), mp_preapproval_id (string, unique, nullable — id del preapproval real, recién se conoce cuando el owner completa el checkout; null=todavía no autorizó el débito), mp_next_payment_date (timestamp, nullable — próximo cobro automático según MercadoPago, puramente informativo), mp_payer_email (string, nullable)

### subscription_payments (cobros de suscripción, creados desde el webhook de MP)
id, subscription_id (FK), mp_payment_id (string, unique — idempotencia del webhook), amount (decimal 10,2), status (string — estado del pago en MP: approved/rejected/…), paid_at (timestamp, nullable), invoice_status (enum: no_facturado/solicitado/autorizado/fallido, default no_facturado — ciclo de vida de la factura, ver regla abajo), invoice_reference (string, nullable — IdComprobante provisorio de Facturante), cae (string, nullable — dato legal de AFIP), cae_vencimiento (date, nullable), invoice_issued_at (timestamp, nullable)

### coupons (catálogo, alta por admin)
id, code (string, unique), type (enum: percentage/fixed), value (decimal 10,2), max_uses (int, nullable=ilimitado), used_count (int, default 0), duration_months (int, nullable=indefinido), applicable_plan_ids (json, nullable=aplica a todos los planes), expires_at (date, nullable), active (boolean, default true), created_by (FK users, el admin que lo creó)

### users (extiende la tabla de Breeze)
+ role (enum: admin/owner/barber), barberia_id (FK barberias, nullable, solo barber), salary_type (enum: fixed/commission, nullable, solo barber), salary_amount (decimal, nullable), commission_pct (decimal, nullable), phone (nullable), cuit (string, nullable — dato fiscal para la factura, solo owner), razon_social (string, nullable — "Nombre o razón social para la factura", solo owner; vacío=consumidor final), active (boolean)

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
- **Grandfathering de precio de planes**: editar `price`/`annual_price` en el catálogo de un plan existente (Admin → Planes) NUNCA afecta retroactivamente a los owners ya suscriptos a ese plan — solo aplica a suscripciones nuevas de ahí en adelante. El precio de catálogo NO debe usarse para modificar preapprovals ya autorizados de owners existentes — solo para altas nuevas. Si un owner necesita un precio distinto al de catálogo, se maneja vía `subscriptions.custom_price`/`custom_annual_price` (override puntual), nunca editando el plan.
- **Planes anuales (billing_cycle)**: una suscripción se cobra mensual o anual (`subscriptions.billing_cycle`), elegido por el owner en `SubscriptionController::activate()` antes de crear el Plan de MercadoPago — no es editable después sin cancelar y reactivar. El anual es un ÚNICO cargo por año (no 12 cuotas reducidas): `Subscription::effectivePrice()` siempre devuelve el monto MENSUAL-EQUIVALENTE (comparable entre ciclos, es lo que se muestra en UI y lo que usa `BusinessMetricsService::mrr()`/`mrrByPlan()` para no inflar el MRR ×12 en cada suscriptor anual), mientras que `Subscription::amountToCharge()` devuelve el monto REAL del ciclo (`effectivePrice()` tal cual si es mensual, ×12 si es anual) — este último es la base que usa `MercadoPagoSubscriptionService::createPreapprovalPlan()` para armar el preapproval, con `frequency=12`/`frequency_type=months` (MercadoPago no tiene un `frequency_type` en años).
- **`features` vs. `included_items` (no confundir)**: `features` es un json de flags booleanos (catálogo en `Plan::KNOWN_FEATURES`) que gatea funcionalidad real en código — hoy solo `ranking_barberos`. `included_items` es un array de strings puramente descriptivo (lo que el owner ve al elegir el plan en el registro, y lo que el equipo ve como referencia en Admin → Planes): no activa nada por sí solo. Si un ítem de `included_items` menciona algo que en realidad depende de un feature flag, quien edite el catálogo debe activar también ese flag — si no, el plan promete algo que no cumple. Cada plan carga su propia lista completa y autocontenida (nunca "todo lo anterior +", eso es solo para lectura humana en la especificación de negocio).
- **Cupones de descuento**: el sistema de cupones (`Coupon`, `CouponRedemptionService`, Admin → Cupones) canjea de forma atómica con `lockForUpdate` para evitar condiciones de carrera sobre `max_uses`, y congela un snapshot en `subscriptions.coupon_discount_snapshot` (type/value/duration_months tal como estaban al canjear, para que una edición posterior del cupón no altere retroactivamente lo que un owner ya tiene aplicado). `MercadoPagoSubscriptionService::chargeAmountFor()` **siempre lee ese snapshot** (nunca el `Coupon` vigente vía `coupon_id`) para calcular el monto real que se manda a MercadoPago al crear el Plan, partiendo de `Subscription::amountToCharge()` (no de `effectivePrice()`, para que el descuento aplique sobre el monto real del ciclo). La ventana de descuento depende del `billing_cycle`:
  - **Mensual**: `duration_months` limita el descuento a los primeros N cobros **aprobados** (contados vía `approvedPaymentsCount()`, no por meses calendario, porque el snapshot no guarda fecha de canje). Cuando la ventana se completa, el webhook (`syncAmountIfDiscountWindowEnded`) actualiza el monto del preapproval ya autorizado al precio pleno.
  - **Anual**: el descuento se aplica **una única vez, sobre el primer cobro anual completo** — `duration_months` se ignora por completo, porque no tiene sentido medir "meses de descuento" sobre un cobro que ocurre una vez al año. Desde el segundo cobro aprobado en adelante (`approvedPaymentsCount() >= 1`), precio pleno; el webhook sincroniza el preapproval al precio pleno apenas se registra ese primer cobro.
- **Suscripciones de MercadoPago — arquitectura verificada (no asumir REST simple)**: la aplicación de MercadoPago de Pelito **exige que todo preapproval esté vinculado a un Plan** (`preapproval_plan`) — crear un preapproval suelto con `auto_recurring` inline devuelve un 500 genérico, confirmado empíricamente contra la API real. Además, crear el preapproval nosotros mismos vinculado a un plan por API **exige tokenizar la tarjeta** (`card_token_id`, documentado por MP como obligatorio en ese caso) — así que Pelito **nunca crea el preapproval**: `MercadoPagoSubscriptionService::createPreapprovalPlan()` crea solo el Plan y `SubscriptionController::activate()` redirige al owner al `init_point` **del Plan**, no de un preapproval. MercadoPago aloja todo el checkout (elegir/tokenizar medio de pago) y crea el preapproval del otro lado — Pelito nunca maneja datos de tarjeta.
  - **Correlación sin `external_reference`**: el checkout hosteado del Plan no permite pasarle `external_reference` al preapproval resultante (viene `null`, confirmado con un pago real). La única clave de correlación es `mp_preapproval_plan_id` (guardado en `activate()`, antes de redirigir) — el webhook de `subscription_preapproval` resuelve la `Subscription` por ese campo y recién ahí completa `mp_preapproval_id`. Por eso cada suscripción tiene su **propio** Plan de MP (no uno compartido por Plan de Pelito): sin esa 1:1, no habría forma de saber a qué owner le corresponde un preapproval recién autorizado.
  - **Pagos recurrentes**: el webhook de `payment` tampoco tiene `external_reference` — el `Payment` de un cobro recurrente trae el id del preapproval de origen en `point_of_interaction.transaction_data.subscription_id` (pese al nombre, ES el preapproval_id) y el plan en `.plan_id`. **Ojo**: el SDK oficial (`mercadopago/dx-php`) descarta esos dos campos en silencio al deserializar (`MercadoPago\Resources\Payment\TransactionData` no los declara como propiedades) — por eso el webhook usa `MercadoPagoSubscriptionService::getPaymentRaw()` (HTTP crudo, no el SDK) para no perderlos. Si algún día se actualiza el SDK y agrega esos campos, `getPayment()` volvería a ser seguro para esto, pero verificarlo antes de simplificar.
  - **`updateAmount()`** (usado en el upgrade de plan, MP-6) sí funciona igual sobre un preapproval vinculado a un plan — verificado contra un preapproval real autorizado, no requiere ningún cambio.
  - **Upgrade de plan (MP-6) sobre una suscripción anual — limitación deliberada**: `SubscriptionController::upgrade()` actualiza `subscriptions.plan_id` de inmediato siempre (el resto de la app ve el plan nuevo al toque: límites, features), pero **NO** llama a `updateAmount()` si `billing_cycle=annual` — el owner ya pagó el cargo anual completo del plan viejo, y prorratear ese cobro agrega complejidad que no se justifica hoy. El monto nuevo se aplica recién en la próxima renovación anual (el preapproval sigue cobrando el monto del plan viejo hasta entonces). Para `billing_cycle=monthly` el comportamiento no cambia: `updateAmount()` se llama de inmediato, como siempre.
  - **Detección de entorno test/producción por prefijo del token — limitación conocida**: una "cuenta de prueba" (vendedor ficticio, distinta de una cuenta real) expone sus propias credenciales bajo la pestaña "Credenciales de producción" de su panel (con prefijo `APP_USR-`, es el comportamiento normal de MercadoPago para cuentas de prueba) — así que `MercadoPagoSubscriptionService::environment()` puede reportar `production` mientras se opera 100% en sandbox con una cuenta de prueba. La heurística por prefijo no puede distinguir "token real de producción" de "token de producción de una cuenta ficticia" sin otra consulta a la API.
  - **Un mismo Plan puede tener MÁS DE UN preapproval — confirmado con un caso real**: si el owner tiene un intento de pago rechazado dentro del checkout de MP (ej. tarjeta inválida) y usa "Pagar con otro medio" sin salir del checkout, MercadoPago genera un preapproval `cancelled` para el primer intento y uno SEGUNDO, `authorized`, para el mismo `preapproval_plan_id`. `findPreapprovalByPlan()` nunca toma el primer resultado de la búsqueda a ciegas: prioriza el que esté `authorized` y, si ninguno lo está todavía, el más reciente por `date_created`. Por la misma razón, `SubscriptionController::retorno()` reintenta la búsqueda mientras `status !== 'active'` (no alcanza con chequear "¿ya tiene `mp_preapproval_id`?", porque puede haber quedado enlazado al cancelado) y el webhook de `subscription_preapproval` deja que un preapproval que llega `authorized` **siempre sobreescriba** uno distinto ya enlazado — nunca al revés, para no pisar una suscripción ya resuelta con una notificación tardía de un intento fallido.
  - **Auto-renovación mensual**: es un comportamiento inherente del preapproval de MercadoPago, no algo que Pelito implementa — una vez autorizado, MP cobra automáticamente cada mes hasta que el preapproval se cancele, sin ninguna acción del owner ni de Pelito. `subscriptions.mp_next_payment_date` (poblado en `retorno()` y en el webhook de `subscription_preapproval`, desde `preapproval.next_payment_date`) es puramente informativo — "vigente hasta" en el panel del owner — nunca se usa para decidir si la suscripción sigue activa; eso lo maneja `status`, que el webhook de `payment`/`subscription_preapproval` actualiza en cada evento real.
  - **Webhooks — configuración por aplicación, no por cuenta**: la URL y los eventos de webhook se configuran POR APLICACIÓN de MercadoPago (Developers → tu app → Webhooks), no a nivel de la cuenta. Si se usa una cuenta de prueba vendedor distinta de la aplicación real para testear, hay que configurar el webhook DE NUEVO ahí — la config de otra aplicación no se hereda. Si un pago se acredita en MercadoPago pero `subscription_payments` nunca se completa y `system_error_logs` no muestra nada, sospechar primero de esto (webhook no configurado para la app en uso) antes que de un bug de código — se puede confirmar mandando un POST de prueba directo a la ruta del webhook y viendo si el controller responde (si responde, el problema es que MP nunca llamó, no que la ruta esté rota).
- **Facturación electrónica (Facturante) — factura SOLICITADA vs. AUTORIZADA**: la autorización de comprobantes en Facturante es **asincrónica contra AFIP**. Cuando se emite un comprobante NO queda autorizado en el acto: primero pasa a `solicitado` (Facturante devuelve un `IdComprobante` provisorio que se guarda en `subscription_payments.invoice_reference`) y recién cuando AFIP emite el CAE pasa a `autorizado` (se completan `cae`, `cae_vencimiento` e `invoice_issued_at`). El ciclo completo de `subscription_payments.invoice_status` es `no_facturado → solicitado → autorizado`, con `fallido` para un intento de emisión que falló (queda en `system_error_logs` con el `subscription_payment_id` para reintentar). **Regla de UI (panel de Suscripción del owner, MP-5)**: mientras `invoice_status` sea `solicitado` mostrar "Factura en proceso" — NUNCA "Factura lista" ni un link de descarga hasta que sea `autorizado`; un `IdComprobante` provisorio no es un comprobante válido. La transición `solicitado → autorizado` la resuelve el job `app:reconciliar-facturas-facturante` (hoy solo esqueleto, `App\Console\Commands\ReconciliarFacturasFacturante`) o, si Facturante ofrece webhooks de estado, un endpoint que reciba el CAE — el modelo de datos sirve para ambos caminos. `FacturanteInvoicingService` está pendiente de reescritura real contra el WSDL SOAP de Facturante (la API es SOAP, no REST); hasta entonces el binding usa `NullInvoicingService` (ver AppServiceProvider).

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

## Hallazgos registrados

- **2026-07-18 — `PricingSection.jsx` desconectado del catálogo real**: la sección de precios de la landing pública (`resources/js/Components/PricingSection.jsx`, usada por `Welcome.jsx`) tenía un array de planes hardcodeado en el componente (nombres, precios, features) en vez de leer `name`/`price`/`annual_price`/`included_items` desde la tabla `plans`. La causa no fue una decisión de diseño: la ruta `Route::get('/', ...)` en `routes/web.php` directamente nunca le pasaba la prop `plans` a `Welcome`, un olvido del routing original (a diferencia de `Auth/Register.jsx`, que sí estuvo siempre conectado vía `RegisteredUserController::create()`). Corregido: la ruta `/` ahora pasa `plans` desde `Plan::where('active', true)`, y `PricingSection` los consume por props.