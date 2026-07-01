<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Barber\DashboardController as BarberDashboard;
use App\Http\Controllers\Owner\BarberoController;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\PasswordChangeController;
use App\Http\Controllers\ProfileController;
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
    ]);
});

// Redirige /dashboard al panel del rol correspondiente
Route::get('/dashboard', function () {
    $role = Auth::user()->role;
    return match ($role) {
        'owner'  => redirect()->route('owner.dashboard'),
        'barber' => redirect()->route('barber.dashboard'),
        'admin'  => redirect()->route('admin.dashboard'),
        default  => abort(403),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// --- Rutas por rol ---

Route::prefix('owner')
    ->middleware(['auth', 'verified', 'role:owner'])
    ->name('owner.')
    ->group(function () {
        Route::get('/dashboard', [OwnerDashboard::class, 'index'])->name('dashboard');

        Route::resource('barberos', BarberoController::class)->except(['destroy', 'show']);
        Route::patch('barberos/{barbero}/deactivate', [BarberoController::class, 'deactivate'])->name('barberos.deactivate');
        Route::patch('barberos/{barbero}/reset-password', [BarberoController::class, 'resetPassword'])->name('barberos.resetPassword');
    });

Route::prefix('barber')
    ->middleware(['auth', 'verified', 'role:barber'])
    ->name('barber.')
    ->group(function () {
        Route::get('/dashboard', [BarberDashboard::class, 'index'])->name('dashboard');
    });

Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
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
