#!/bin/bash

# Ensure PORT is set
export PORT=${PORT:-80}

# Update Apache to listen on the Railway-assigned port
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Run Laravel setup/migrations
echo "Running migrations..."
php artisan migrate --force

echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Apache in the foreground
echo "Starting Apache on port ${PORT}..."
exec apache2-foreground
