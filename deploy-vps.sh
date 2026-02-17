#!/bin/bash

# 🚀 VPS Deployment Script for Turist Pro Planner
# Usage: bash deploy.sh

set -e

echo "🚀 Deploying Turist Pro Planner to VPS..."

# Update system
echo "📦 Updating system..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Install certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# Clone or update repository
APP_DIR="/var/www/turist-pro-planner"
if [ -d "$APP_DIR" ]; then
    echo "📥 Updating repository..."
    cd $APP_DIR
    git pull
else
    echo "📥 Cloning repository..."
    sudo mkdir -p /var/www
    sudo git clone https://github.com/Melnikovjj/turist-pro-planner.git $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup systemd service
echo "⚙️ Setting up systemd service..."
sudo tee /etc/systemd/system/turist-pro.service > /dev/null <<EOF
[Unit]
Description=Turist Pro Planner
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npx serve . -l 3000
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable turist-pro
sudo systemctl restart turist-pro

# Setup Nginx config
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/turist-pro > /dev/null <<'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/turist-pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update domain in /etc/nginx/sites-available/turist-pro"
echo "2. Run: sudo certbot --nginx -d YOUR_DOMAIN"
echo "3. Your app is running at http://YOUR_SERVER_IP"
