# ============================================================
# WebSocket Dockerfile — PHP Ratchet/Workerman server
# Place this file at: websocket/Dockerfile
# ============================================================

FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    oniguruma-dev \
    libxml2-dev \
    && docker-php-ext-install \
        pcntl \
        sockets \
        mbstring \
    && rm -rf /var/cache/apk/*

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --optimize-autoloader

COPY . .

# Railway assigns PORT dynamically; default to 8080 for WebSocket
ENV WEBSOCKET_PORT=8080

EXPOSE 8080

CMD ["php", "websocket_server.php"]
