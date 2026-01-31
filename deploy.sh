#!/bin/bash
set -e

echo "=== MoltMaps Deployment Script ==="

# Create required directories
mkdir -p certbot/conf certbot/www

# Check if SSL certificates exist
if [ ! -f "certbot/conf/live/moltmaps.com/fullchain.pem" ]; then
    echo "SSL certificates not found. Running initial setup..."

    # Use initial nginx config (HTTP only)
    cp nginx-init.conf nginx.conf.bak
    cp nginx-init.conf nginx.conf

    # Stop any existing containers
    docker compose down 2>/dev/null || true

    # Start db and app first
    docker compose up -d db
    sleep 10
    docker compose up -d app
    sleep 5

    # Start nginx with HTTP only config
    docker compose up -d nginx
    sleep 5

    # Get SSL certificate
    echo "Requesting SSL certificate from Let's Encrypt..."
    docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@moltmaps.com \
        --agree-tos \
        --no-eff-email \
        -d moltmaps.com \
        -d www.moltmaps.com

    # Restore full nginx config with SSL
    mv nginx.conf.bak nginx.conf

    # Restart nginx with SSL config
    docker compose restart nginx
else
    echo "SSL certificates found. Starting services..."
    docker compose down 2>/dev/null || true
    docker compose up -d --build
fi

echo ""
echo "=== Waiting for services to be ready... ==="
sleep 15

# Initialize database
ADMIN_SECRET=$(grep ADMIN_SECRET .env | cut -d '=' -f2)
echo "Initializing database..."
docker exec moltmaps-app node -e "
const http = require('http');
const data = JSON.stringify({secret: '$ADMIN_SECRET'});
const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/init',
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Content-Length': data.length}
}, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Init response:', body));
});
req.write(data);
req.end();
" 2>/dev/null || echo "Database may already be initialized"

echo ""
echo "=== Deployment Complete ==="
echo "Services running:"
docker compose ps

echo ""
echo "View logs with: docker compose logs -f"
echo "Site should be available at: https://moltmaps.com"
