<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\Product;
use App\Models\ProductSet;
use App\Models\Party;
use App\Models\Order;
use App\Models\Stock;
use App\Models\Setting;
use App\Http\Controllers\PartyController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductSetController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AttarController;

// Manually register Fortify View Routes (excluding register)
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\ConfirmablePasswordController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\EmailVerificationPromptController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;

// Disable default registration route (not needed since views are disabled, but explicit fallback prevents confusion if config reverts)
// No manual definition for /register means it 404s automatically.
// Disable default registration route
Route::any('/register', function() {
    abort(404);
});
Route::group(['middleware' => config('fortify.middleware', ['web'])], function () {
    // Login
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->middleware(['guest:'.config('fortify.guard')])
        ->name('login');

    // Password Reset...
    if (Features::enabled(Features::resetPasswords())) {
        Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
            ->middleware(['guest:'.config('fortify.guard')])
            ->name('password.request');

        Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
            ->middleware(['guest:'.config('fortify.guard')])
            ->name('password.reset');
    }

    // Email Verification...
    if (Features::enabled(Features::emailVerification())) {
        Route::get('/email/verify', [EmailVerificationPromptController::class, '__invoke'])
            ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
            ->name('verification.notice');
    }

    // Two Factor Authentication...
    if (Features::enabled(Features::twoFactorAuthentication())) {
        Route::get('/two-factor-challenge', [TwoFactorAuthenticatedSessionController::class, 'create'])
            ->middleware(['guest:'.config('fortify.guard')])
            ->name('two-factor.login');
    }

    // Confirm Password...
    Route::get('/user/confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
        ->name('password.confirm');

    // Admin Registration...
    if (Features::enabled(Features::registration())) {
        Route::get('/admin/register', [RegisteredUserController::class, 'create'])
            ->middleware(['guest:'.config('fortify.guard')])
            ->name('admin.register');

        Route::post('/admin/register', [RegisteredUserController::class, 'store'])
            ->middleware(['guest:'.config('fortify.guard')]);
    }
});
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'products' => Product::latest()->take(4)->get(),
    ]);
})->name('home');

Route::get('/collections', function () {
    return Inertia::render('collections', [
        'products' => Product::latest()->paginate(10), // Pagination for 10 items per page
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('collections');

Route::get('/abilities', function () {
    return Inertia::render('abilities', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('abilities');

Route::get('/about', function () {
    return Inertia::render('about', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('about');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'totalParties' => Party::count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'cancelledOrders' => Order::where('status', 'cancelled')->count(),
        ]);
    })->name('dashboard');

    Route::resource('parties', PartyController::class);
    Route::put('parties/{party}/prices', [PartyController::class, 'updatePrices'])->name('parties.update-prices');
    Route::get('parties/{party}/prices', [PartyController::class, 'getPrices'])->name('parties.get-prices');
    Route::resource('products', ProductController::class);
    Route::resource('product-sets', ProductSetController::class);
    Route::resource('attars', AttarController::class);
    Route::resource('orders', OrderController::class);
    Route::get('orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');
    
    // Stock Management Routes
    Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');
    Route::put('/stocks/{id}', [StockController::class, 'update'])->name('stocks.update');
    Route::post('/stocks/{id}/toggle-status', [StockController::class, 'toggleStatus'])->name('stocks.toggle-status');

    // Settings Routes
    Route::get('/invoice-settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/invoice-settings', [SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/settings.php';
