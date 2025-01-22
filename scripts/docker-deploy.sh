#!/bin/bash

# Configuration
APP_DIR="/opt/weekly-report"
REPO_URL="your-git-repo-url"

# Create app directory if it doesn't exist
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone/pull repository
if [ -d "$APP_DIR/.git" ]; then
    echo "Pulling latest changes..."
    cd $APP_DIR
    git pull
else
    echo "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Create .env file for production
cat > .env << EOL
# Database Configuration
DB_RW_USER=weekly_report_user
DB_RW_PASSWORD=${DB_RW_PASSWORD:-$(openssl rand -base64 32)}
DB_RW_DATABASE=weekly_report
DB_RO_HOST=${DB_RO_HOST}
DB_RO_USER=${DB_RO_USER}
DB_RO_PASSWORD=${DB_RO_PASSWORD}
DB_RO_DATABASE=${DB_RO_DATABASE}

# JWT Configuration
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}

# Google Search Configuration
GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY}
GOOGLE_SEARCH_ENGINE_ID=${GOOGLE_SEARCH_ENGINE_ID}
EOL

# Create nginx configuration directory
mkdir -p nginx/conf.d nginx/ssl nginx/logs

# Create nginx configuration
cat > nginx/conf.d/app.conf << EOL
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npm run migrate

# Show container status
docker-compose -f docker-compose.prod.yml ps 