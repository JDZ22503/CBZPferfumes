#!/bin/bash

# CBZ Perfumes - Production Deployment Script
# Run this on your production server

echo "🚀 Starting CBZ Perfumes Deployment..."

# Navigate to project directory
cd /var/www/CBZPerfumes || exit

echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

echo "🔧 Installing Laravel Sanctum..."
composer require laravel/sanctum

echo "📊 Running database migrations..."
php artisan migrate --force

echo "🧹 Clearing all caches..."
php artisan optimize:clear

echo "⚙️ Caching configuration..."
php artisan config:cache

echo "🛣️ Caching routes..."
php artisan route:cache

echo "👁️ Caching views..."
php artisan view:cache

echo "🔐 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "🔄 Restarting Apache..."
systemctl restart apache2

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Verification:"
echo "Run these commands to verify:"
echo "  php artisan route:list --path=api"
echo "  curl -X POST https://cbzperfumes.cbzsoda.me/api/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@admin.com\",\"password\":\"password\"}'"
echo ""
