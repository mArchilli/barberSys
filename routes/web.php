<?php

use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\OnboardingController as AdminOnboardingController;
use App\Http\Controllers\Admin\OwnerController as AdminOwnerController;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Admin\SaludController as AdminSaludController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Barber\DashboardController as BarberDashboard;
use App\Http\Controllers\CorteController;
use App\Http\Controllers\Owner\BarberiaController;
use App\Http\Controllers\Owner\BarberoController;
use App\Http\Controllers\Owner\ClienteController;
use App\Http\Controllers\Owner\ConsolidadoController;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\Owner\FinanzasController;
use App\Http\Controllers\Owner\GastoController;
use App\Http\Controllers\Owner\GastoRegistroController;
use App\Http\Controllers\Owner\MedioPagoController;
use App\Http\Controllers\Owner\ServicioController;
use App\Http\Controllers\Owner\SubscriptionController as OwnerSubscriptionController;
use App\Http\Controllers\PasswordChangeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\Webhooks\MercadoPagoWebhookController;
use App\Models\Plan;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'plans' => Plan::where('active', true)->orderBy('id')->get([
            'id', 'name', 'slug', 'price', 'annual_price', 'is_custom', 'max_barberias', 'max_barberos', 'included_items',
        ]),
    ]);
});

// Redirige /dashboard al landing del rol correspondiente
Route::get('/dashboard', function () {
    return match (Auth::user()->role) {
        'owner' => redirect()->route('owner.barberias.index'),
        'barber' => redirect()->route('barber.dashboard'),
        'admin' => redirect()->route('admin.dashboard'),
        default => abort(403),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// --- Rutas owner ---

Route::prefix('owner')
    ->middleware(['auth', 'verified', 'role:owner'])
    ->name('owner.')
    ->group(function () {

        // Selector de barberías (redirige automáticamente si solo hay una)
        Route::get('/barberias', [BarberiaController::class, 'index'])->name('barberias.index');
        Route::get('/barberias/create', [BarberiaController::class, 'create'])->name('barberias.create');
        Route::post('/barberias', [BarberiaController::class, 'store'])->name('barberias.store');

        // Vista consolidada multi-barbería (solo aplica con 2+ barberías activas;
        // el propio controller redirige si no corresponde)
        Route::get('/consolidado', [ConsolidadoController::class, 'index'])->name('consolidado');

        // Suscripción: panel, activación del débito automático (preapproval),
        // retorno del checkout de MP y cambio de plan. Vive a nivel owner,
        // fuera del grupo anidado por barbería.
        Route::get('/suscripcion', [OwnerSubscriptionController::class, 'index'])->name('suscripcion.index');
        Route::post('/suscripcion/activar', [OwnerSubscriptionController::class, 'activate'])->name('suscripcion.activate');
        Route::get('/suscripcion/retorno', [OwnerSubscriptionController::class, 'retorno'])->name('suscripcion.retorno');
        Route::post('/suscripcion/upgrade', [OwnerSubscriptionController::class, 'upgrade'])->name('suscripcion.upgrade');

        // Gestión anidada por barbería (activa o cerrada: el middleware
        // blockIfBarberiaInactive deja pasar las lecturas siempre, y bloquea
        // las acciones de escritura si la barbería está cerrada)
        Route::prefix('barberias/{barberia}')
            ->middleware(['checkBarberiaOwnership', 'blockIfBarberiaInactive'])
            ->name('barberias.')
            ->group(function () {

                Route::get('/dashboard', [OwnerDashboard::class, 'index'])->name('dashboard');
                Route::get('/edit', [BarberiaController::class, 'edit'])->name('edit');
                Route::put('/', [BarberiaController::class, 'update'])->name('update');
                Route::patch('/deactivate', [BarberiaController::class, 'deactivate'])->name('deactivate');
                Route::patch('/reactivate', [BarberiaController::class, 'reactivate'])->name('reactivate');

                Route::get('cortes', [CorteController::class, 'index'])->name('cortes.index');
                Route::post('cortes', [CorteController::class, 'store'])->name('cortes.store');

                Route::resource('barberos', BarberoController::class)->except(['destroy']);
                Route::patch('barberos/{barbero}/deactivate', [BarberoController::class, 'deactivate'])->name('barberos.deactivate');
                Route::patch('barberos/{barbero}/reset-password', [BarberoController::class, 'resetPassword'])->name('barberos.resetPassword');

                Route::resource('servicios', ServicioController::class)->except(['destroy', 'show']);
                Route::patch('servicios/{servicio}/deactivate', [ServicioController::class, 'deactivate'])->name('servicios.deactivate');

                Route::resource('medios-pago', MedioPagoController::class, [
                    'parameters' => ['medios-pago' => 'medioPago'],
                ])->except(['destroy', 'show']);
                Route::patch('medios-pago/{medioPago}/deactivate', [MedioPagoController::class, 'deactivate'])->name('medios-pago.deactivate');

                Route::get('clientes/search', [ClienteController::class, 'search'])->name('clientes.search');
                Route::resource('clientes', ClienteController::class)->except(['destroy', 'show', 'create']);
                Route::patch('clientes/{cliente}/deactivate', [ClienteController::class, 'deactivate'])->name('clientes.deactivate');

                Route::get('/finanzas', [FinanzasController::class, 'index'])->name('finanzas');

                Route::resource('gastos', GastoController::class)->except(['destroy', 'show']);
                Route::patch('gastos/{gasto}/deactivate', [GastoController::class, 'deactivate'])->name('gastos.deactivate');

                // gasto-registros: modifican la INSTANCIA de un mes puntual,
                // nunca la plantilla (Gasto) ni meses futuros.
                Route::patch('gasto-registros/{gastoRegistro}', [GastoRegistroController::class, 'update'])->name('gasto-registros.update');
                Route::patch('gasto-registros/{gastoRegistro}/excluir', [GastoRegistroController::class, 'excluir'])->name('gasto-registros.excluir');
            });
    });

// --- Rutas barber ---

Route::prefix('barber')
    ->middleware(['auth', 'verified', 'role:barber'])
    ->name('barber.')
    ->group(function () {
        Route::get('/dashboard', [BarberDashboard::class, 'index'])->name('dashboard');

        Route::get('/cortes', [CorteController::class, 'index'])->name('cortes.index');
        Route::post('/cortes', [CorteController::class, 'store'])->name('cortes.store');

        Route::get('/clientes/search', [ClienteController::class, 'search'])->name('clientes.search');
    });

// --- Rutas admin ---

Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

        Route::get('/owners', [AdminOwnerController::class, 'index'])->name('owners.index');
        Route::get('/owners/{owner}', [AdminOwnerController::class, 'show'])->name('owners.show');
        Route::patch('/owners/{owner}/reset-password', [AdminOwnerController::class, 'resetPassword'])->name('owners.resetPassword');
        Route::patch('/owners/{owner}/subscription', [AdminSubscriptionController::class, 'update'])->name('subscriptions.update');
        Route::patch('/owners/{owner}/subscription/coupon', [AdminSubscriptionController::class, 'applyCoupon'])->name('subscriptions.applyCoupon');
        Route::delete('/owners/{owner}/subscription/coupon', [AdminSubscriptionController::class, 'removeCoupon'])->name('subscriptions.removeCoupon');

        // Catálogo comercial de planes — sin destroy: un plan se desactiva
        // (active=false), nunca se borra, porque subscriptions.plan_id lo referencia.
        Route::resource('plans', AdminPlanController::class)->except(['destroy', 'show']);

        // Cupones de descuento — sin destroy físico: se desactivan (active=false).
        // El descuento no tiene efecto real hasta integrar el cobro de MercadoPago
        // (ver comentario en App\Models\Coupon y CLAUDE.md).
        Route::resource('coupons', AdminCouponController::class)->except(['destroy', 'show']);

        Route::get('/salud', [AdminSaludController::class, 'index'])->name('salud.index');

        Route::get('/onboarding', [AdminOnboardingController::class, 'index'])->name('onboarding.index');
    });

// --- Webhooks (públicos, sin auth ni CSRF — ver bootstrap/app.php) ---
// La seguridad no depende de esta ruta: el controller verifica cada
// notificación consultando el recurso contra la API de MP.

Route::post('/webhooks/mercadopago', MercadoPagoWebhookController::class)->name('webhooks.mercadopago');

// --- Cambio de contraseña forzado ---

Route::middleware('auth')->group(function () {
    Route::get('/password/change', [PasswordChangeController::class, 'show'])->name('password.change');
    Route::post('/password/change', [PasswordChangeController::class, 'update'])->name('password.change.update');
});

// --- Perfil (Breeze) ---

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::patch('/tours/{tourKey}/seen', [TourController::class, 'markSeen'])->name('tours.mark-seen');
});

require __DIR__.'/auth.php';
