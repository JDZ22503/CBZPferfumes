#!/bin/bash

# Quick Fix for Duplicate Route Names on Production Server
# This script updates routes/api.php to add 'api.' prefix to avoid conflicts

echo "🔧 Fixing duplicate route names..."

cd /var/www/CBZPerfumes

# Backup current api.php
cp routes/api.php routes/api.php.backup

# Update the routes/api.php file
# Change: Route::middleware(['auth:sanctum'])->group(function () {
# To: Route::middleware(['auth:sanctum'])->name('api.')->group(function () {

sed -i "s/Route::middleware(\['auth:sanctum'\])->group(function () {/Route::middleware(['auth:sanctum'])->name('api.')->group(function () {/g" routes/api.php

echo "✅ Updated routes/api.php"

# Clear route cache
php artisan route:clear

# Try to cache routes
php artisan route:cache

if [ $? -eq 0 ]; then
    echo "✅ Routes cached successfully!"
else
    echo "❌ Route caching failed. Reverting changes..."
    cp routes/api.php.backup routes/api.php
    php artisan route:clear
    exit 1
fi

# Clear all caches
php artisan optimize:clear
php artisan config:cache

# Restart Apache
systemctl restart apache2

echo ""
echo "✅ All done! Routes fixed."
echo ""
echo "Test with:"
echo "  php artisan route:list --path=api"
