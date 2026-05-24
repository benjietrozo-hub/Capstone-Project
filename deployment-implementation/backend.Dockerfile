# ============================================================
# Backend Dockerfile — Laravel 11 API (role-based-OIMS)
# Place this file at: backend/Dockerfile
# ============================================================

# ── Stage 1: Composer dependencies ──────────────────────────
FROM composer:2.7 AS composer-deps

WORKDIR /app

# Copy only composer files first for better layer caching
COPY composer.json composer.lock ./

# Install production dependencies (no dev)
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --ignore-platform-reqs

# ── Stage 2: Production image ────────────────────────────────
FROM php:8.3-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        opcache \
        xml \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

# Copy vendor from Stage 1
COPY --from=composer-deps /app/vendor ./vendor

# Copy application source
COPY . .

# Copy nginx and supervisor configs
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Optimize Laravel for production
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
