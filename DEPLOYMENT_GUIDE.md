# Production Deployment Guide

## Prerequisites
- SSH access to your production server
- Composer installed on the server
- PHP 8.2+ installed

## Deployment Steps

### 1. SSH into your production server
```bash
ssh your-user@your-server.com
cd /var/www/CBZPerfumes
```

### 2. Install Laravel Sanctum
```bash
composer require laravel/sanctum
```

### 3. Run migrations
```bash
php artisan migrate --force
```

### 4. Clear all caches
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Regenerate Ziggy routes
```bash
php artisan ziggy:generate
```

### 6. Set proper permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 7. Restart services
```bash
# For Apache
sudo systemctl restart apache2

# For Nginx + PHP-FPM
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
```

## Verify Installation

### Check if Sanctum is installed:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Test the application:
1. Visit your website
2. Try logging in with: admin@admin.com / password
3. Check if the mobile app can authenticate

## Troubleshooting

### If you get "Class not found" errors:
```bash
composer dump-autoload
php artisan optimize:clear
```

### If migrations fail:
```bash
# Check if personal_access_tokens table already exists
php artisan db:show --table=personal_access_tokens

# If it exists but migration fails, mark it as migrated:
# (Only do this if the table structure is correct)
php artisan migrate:status
```

### If routes are not working:
```bash
php artisan route:clear
php artisan route:cache
php artisan ziggy:generate
```

## Important Files to Check on Server

1. **composer.json** - Should contain:
   ```json
   "laravel/sanctum": "^4.0"
   ```

2. **config/auth.php** - Should have:
   ```php
   'guards' => [
       'api' => [
           'driver' => 'sanctum',
           'provider' => 'users',
       ],
   ],
   ```

3. **bootstrap/app.php** - Should register API routes:
   ```php
   ->withRouting(
       web: __DIR__.'/../routes/web.php',
       api: __DIR__.'/../routes/api.php',
       // ...
   )
   ```

4. **config/fortify.php** - Should have:
   ```php
   'views' => true,
   ```

## Post-Deployment Checklist

- [ ] Sanctum installed via Composer
- [ ] Migrations run successfully
- [ ] Caches cleared
- [ ] Routes regenerated
- [ ] Permissions set correctly
- [ ] Services restarted
- [ ] Web login works
- [ ] Mobile app can authenticate
- [ ] API endpoints accessible

## Quick Deploy Script

Save this as `deploy.sh` on your server:

```bash
#!/bin/bash
cd /var/www/CBZPerfumes

# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan ziggy:generate

# Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```
