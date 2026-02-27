<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\ContactDetail;
use App\Models\Product;
use App\Models\ProductSet;
use App\Models\Attar;
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
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\AttarDetailController;
use App\Http\Controllers\ProductSetDetailController;
use App\Http\Controllers\ContactDetailController;

Route::get('/', function () {
    $products = Product::with('productDetail')->whereHas('productDetail', function($q) { $q->where('is_active', true); })->latest()->take(2)->get();
    $attars = Attar::with('attarDetail')->whereHas('attarDetail', function($q) { $q->where('is_active', true); })->latest()->take(2)->get();
    $productSets = ProductSet::with('productSetDetail')->whereHas('productSetDetail', function($q) { $q->where('is_active', true); })->latest()->take(2)->get();

    $latestItems = collect()
        ->merge($products)
        ->merge($attars)
        ->merge($productSets)
        ->sortByDesc('created_at')
        ->take(4)
        ->values()
        ->all();

    // Featured items for slider
    $featuredProducts = Product::with('productDetail')->whereHas('productDetail', function($q) { $q->where('is_active', true)->where('is_featured', true); })->get();
    $featuredAttars = Attar::with('attarDetail')->whereHas('attarDetail', function($q) { $q->where('is_active', true)->where('is_featured', true); })->get();
    $featuredSets = ProductSet::with('productSetDetail')->whereHas('productSetDetail', function($q) { $q->where('is_active', true)->where('is_featured', true); })->get();

    $featuredItems = collect()
        ->merge($featuredProducts)
        ->merge($featuredAttars)
        ->merge($featuredSets)
        ->sortByDesc('created_at')
        ->values()
        ->all();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'products' => $latestItems,
        'featuredItems' => $featuredItems,
    ]);
})->name('home');

Route::get('/collections', [App\Http\Controllers\CollectionsController::class, 'index'])->name('collections');

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

Route::get('/contact', function () {
    return Inertia::render('contact', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('contact');

Route::get('/faq', function () {
    return Inertia::render('faq', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('faq');

Route::get('/terms', function () {
    return Inertia::render('terms', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('privacy', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('privacy');

Route::get('/returns', function () {
    return Inertia::render('returns', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('returns');

Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::get('/products', [ProductController::class, 'publicIndex'])->name('products.public');

Route::get('/gift-sets/{productSet}', [ProductSetController::class, 'show'])->name('product-sets.show');
Route::get('/gift-sets', [ProductSetController::class, 'publicIndex'])->name('product-sets.public');

Route::get('/attars/{attar}', [AttarController::class, 'show'])->name('attars.show');
Route::get('/attars', [AttarController::class, 'publicIndex'])->name('attars.public');

Route::middleware(['auth', 'verified'])->prefix('cbz-admin')->group(function () {
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
    Route::resource('product-details', ProductDetailController::class);
    Route::post('product-details/{productDetail}/toggle-status', [ProductDetailController::class, 'toggleStatus'])->name('product-details.toggle-status');
    Route::post('product-details/{productDetail}/toggle-featured', [ProductDetailController::class, 'toggleFeatured'])->name('product-details.toggle-featured');
    Route::resource('attar-details', AttarDetailController::class);
    Route::post('attar-details/{attarDetail}/toggle-status', [AttarDetailController::class, 'toggleStatus'])->name('attar-details.toggle-status');
    Route::post('attar-details/{attarDetail}/toggle-featured', [AttarDetailController::class, 'toggleFeatured'])->name('attar-details.toggle-featured');
    Route::resource('gift-set-details', ProductSetDetailController::class);
    Route::post('gift-set-details/{gift_set_detail}/toggle-status', [ProductSetDetailController::class, 'toggleStatus'])->name('gift-set-details.toggle-status');
    Route::post('gift-set-details/{gift_set_detail}/toggle-featured', [ProductSetDetailController::class, 'toggleFeatured'])->name('gift-set-details.toggle-featured');
    Route::resource('orders', OrderController::class);
    Route::get('orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');
    
    // Stock Management Routes
    Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');
    Route::put('/stocks/{id}', [StockController::class, 'update'])->name('stocks.update');
    Route::post('/stocks/{id}/toggle-status', [StockController::class, 'toggleStatus'])->name('stocks.toggle-status');

    // Settings Routes
    Route::get('/invoice-settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/invoice-settings', [SettingController::class, 'update'])->name('settings.update');

    // Contact Details Routes
    Route::get('/contact-details', [ContactDetailController::class, 'index'])->name('contact-details.index');
    Route::post('/contact-details', [ContactDetailController::class, 'update'])->name('contact-details.update');
});

require __DIR__.'/settings.php';
