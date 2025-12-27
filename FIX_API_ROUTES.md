# Fix API Routes on Production Server

## Problem
Mobile app shows "api/login not found" when connecting to production server.

## Solution - Run These Commands on Your Production Server

### Step 1: SSH into your server
```bash
ssh your-user@your-server.com
cd /var/www/CBZPerfumes
```

### Step 2: Ensure API routes file exists
```bash
# Check if routes/api.php exists
ls -la routes/api.php

# If it doesn't exist, you need to pull from Git or copy it
```

### Step 3: Verify bootstrap/app.php has API routes registered
```bash
cat bootstrap/app.php | grep "api.php"
```

Should show:
```php
api: __DIR__.'/../routes/api.php',
```

### Step 4: Install Sanctum (if not already done)
```bash
composer require laravel/sanctum
```

### Step 5: Run migrations
```bash
php artisan migrate --force
```

### Step 6: Clear all caches and regenerate
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 7: Verify API routes are registered
```bash
php artisan route:list --path=api
```

You should see routes like:
- POST api/login
- GET api/dashboard
- GET api/products
- etc.

### Step 8: Check .htaccess is in public folder
```bash
ls -la public/.htaccess
```

### Step 9: Ensure mod_rewrite is enabled (Apache)
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Step 10: Check Apache configuration
```bash
sudo nano /etc/apache2/sites-available/cbzperfumes.conf
```

Make sure it has:
```apache
<Directory /var/www/CBZPerfumes/public>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

### Step 11: Set proper permissions
```bash
sudo chown -R www-data:www-data /var/www/CBZPerfumes
sudo chmod -R 755 /var/www/CBZPerfumes
sudo chmod -R 775 /var/www/CBZPerfumes/storage
sudo chmod -R 775 /var/www/CBZPerfumes/bootstrap/cache
```

### Step 12: Restart Apache
```bash
sudo systemctl restart apache2
```

## Quick Test

### Test API endpoint directly:
```bash
curl -X POST https://cbzperfumes.cbzsoda.me/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@admin.com","password":"password"}'
```

Should return a token, not a 404 error.

### Test if routes are accessible:
```bash
curl https://cbzperfumes.cbzsoda.me/api/dashboard
```

## Common Issues & Fixes

### Issue 1: "404 Not Found" for /api/*
**Fix:** API routes not registered
```bash
# Check bootstrap/app.php
cat bootstrap/app.php

# Should contain:
# ->withRouting(
#     web: __DIR__.'/../routes/web.php',
#     api: __DIR__.'/../routes/api.php',
# )
```

### Issue 2: "Class 'Laravel\Sanctum\...' not found"
**Fix:** Sanctum not installed
```bash
composer require laravel/sanctum
php artisan migrate --force
php artisan optimize:clear
```

### Issue 3: Routes work locally but not on server
**Fix:** Cache issue
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

### Issue 4: .htaccess not working
**Fix:** AllowOverride not set
```bash
# Edit Apache config
sudo nano /etc/apache2/sites-available/cbzperfumes.conf

# Add/Update:
<Directory /var/www/CBZPerfumes/public>
    AllowOverride All
</Directory>

# Restart Apache
sudo systemctl restart apache2
```

## Verification Checklist

- [ ] `composer.json` has `laravel/sanctum`
- [ ] `routes/api.php` exists
- [ ] `bootstrap/app.php` registers API routes
- [ ] `config/auth.php` has `api` guard
- [ ] `php artisan route:list` shows API routes
- [ ] `.htaccess` exists in `public/` folder
- [ ] Apache `mod_rewrite` is enabled
- [ ] Apache config has `AllowOverride All`
- [ ] Permissions are correct (775 for storage)
- [ ] Caches are cleared

## After Fixing

1. Test API login:
   ```bash
   curl -X POST https://cbzperfumes.cbzsoda.me/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@admin.com","password":"password"}'
   ```

2. Open mobile app and try logging in

3. If still not working, check Laravel logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```

## Emergency: If Nothing Works

### Option 1: Reinstall everything
```bash
cd /var/www/CBZPerfumes
composer install --no-dev --optimize-autoloader
php artisan migrate:fresh --force --seed
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
sudo systemctl restart apache2
```

### Option 2: Check if API is even accessible
```bash
# Create a test file
echo "<?php echo 'API works!'; ?>" > public/api-test.php

# Test it
curl https://cbzperfumes.cbzsoda.me/api-test.php

# If this doesn't work, it's an Apache/server config issue
```

## Need More Help?

Send me the output of:
```bash
php artisan route:list --path=api
php artisan about
cat bootstrap/app.php
ls -la routes/
```
