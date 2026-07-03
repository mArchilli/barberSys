<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\OwnerController as AdminOwnerController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Barber\DashboardController as BarberDashboard;
use App\Http\Controllers\CorteController;
use App\Http\Controllers\Owner\BarberiaController;
use App\Http\Controllers\Owner\BarberoController;
use App\Http\Controllers\Owner\ConsolidadoController;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\Owner\ClienteController;
use App\Http\Controllers\Owner\FinanzasController;
use App\Http\Controllers\Owner\GastoController;
use App\Http\Controllers\Owner\GastoRegistroController;
use App\Http\Controllers\Owner\MedioPagoController;
use App\Http\Controllers\Owner\ServicioController;
use App\Http\Controllers\PasswordChangeController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// Redirige /dashboard al landing del rol correspondiente
Route::get('/dashboard', function () {
    return match (Auth::user()->role) {
        'owner'  => redirect()->route('owner.barberias.index'),
        'barber' => redirect()->route('barber.dashboard'),
        'admin'  => redirect()->route('admin.dashboard'),
        default  => abort(403),
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

        // Gestión anidada por barbería activa
        Route::prefix('barberias/{barberia}')
            ->middleware('checkBarberiaOwnership')
            ->name('barberias.')
            ->group(function () {

                Route::get('/dashboard', [OwnerDashboard::class, 'index'])->name('dashboard');
                Route::get('/edit', [BarberiaController::class, 'edit'])->name('edit');
                Route::put('/', [BarberiaController::class, 'update'])->name('update');

                Route::get('cortes', [CorteController::class, 'index'])->name('cortes.index');
                Route::post('cortes', [CorteController::class, 'store'])->name('cortes.store');

                Route::resource('barberos', BarberoController::class)->except(['destroy', 'show']);
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
    });

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
});

require __DIR__.'/auth.php';
