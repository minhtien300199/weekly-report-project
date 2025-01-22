#!/bin/bash

# Configuration
APP_DIR="/var/www/weekly-report"
REPO_URL="your-git-repo-url"
NODE_ENV="production"

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

# Install dependencies
npm install --production

# Create production .env file
cat > .env << EOL
# Read-only Database (Production)
DB_RO_HOST=${DB_RO_HOST}
DB_RO_USER=${DB_RO_USER}
DB_RO_PASSWORD=${DB_RO_PASSWORD}
DB_RO_DATABASE=${DB_RO_DATABASE}
DB_RO_CHARSET=utf8

# Read-Write Database (Production)
DB_RW_HOST=localhost
DB_RW_USER=${DB_RW_USER}
DB_RW_PASSWORD=${DB_RW_PASSWORD}
DB_RW_DATABASE=${DB_RW_DATABASE}
DB_RW_CHARSET=utf8

PORT=3000

# Other configurations
JWT_SECRET=${JWT_SECRET}
GOOGLE_SEARCH_API_KEY=${GOOGLE_SEARCH_API_KEY}
GOOGLE_SEARCH_ENGINE_ID=${GOOGLE_SEARCH_ENGINE_ID}
EOL

# Setup PM2 for process management
sudo npm install -g pm2
pm2 delete weekly-report 2>/dev/null || true
pm2 start app.js --name weekly-report

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER 