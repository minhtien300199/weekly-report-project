#!/bin/bash

# Update system
sudo yum update -y

# Install Docker dependencies
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create production environment file
cat << EOF > .env
DB_RW_USER=your_db_user
DB_RW_PASSWORD=your_secure_password
DB_RW_DATABASE=weekly_report
JWT_SECRET=your_jwt_secret
EOF

# Build and start containers
sudo docker-compose up -d --build

# Run migrations
sudo docker-compose exec app npm run migrate 