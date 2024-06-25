FROM php:8.2-fpm

# Install necessary packages
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN docker-php-ext-enable mysqli

# Copy application code to the container
COPY ./php /var/www/html/

# Set permissions for /var/www/html
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html
