<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PartyController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AttarController;

use App\Http\Controllers\Api\ProductSetController;
use App\Http\Controllers\Api\SettingController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->name('api.')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    Route::apiResource('products', ProductController::class);
    Route::apiResource('parties', PartyController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('attars', AttarController::class);
    Route::apiResource('product-sets', ProductSetController::class);
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::get('orders/{order}/invoice', [OrderController::class, 'downloadInvoice']);
});
