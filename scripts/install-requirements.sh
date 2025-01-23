#!/bin/bash

# Make script exit on any error
set -e

echo "Installing requirements for deployment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install EPEL repository if not already installed
if ! rpm -qa | grep -q epel-release; then
    echo "Installing EPEL repository..."
    sudo yum install epel-release -y
fi

# Install development tools
echo "Installing development tools..."
sudo yum groupinstall 'Development Tools' -y

# Install required packages
echo "Installing required packages..."
sudo yum install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    yum-utils \
    device-mapper-persistent-data \
    lvm2 \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Node.js if not installed
if ! command_exists node; then
    echo "Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install PM2 globally if not installed
if ! command_exists pm2; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install MySQL 8 if not installed
if ! command_exists mysql; then
    echo "Installing MySQL 8..."
    sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
    sudo yum install -y mysql-community-server
fi

# Install Docker if not installed
if ! command_exists docker; then
    echo "Installing Docker..."
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not installed
if ! command_exists docker-compose; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create necessary directories
echo "Creating necessary directories..."
sudo mkdir -p /var/www/weekly-report
sudo mkdir -p /var/log/weekly-report
sudo chown -R $USER:$USER /var/www/weekly-report
sudo chown -R $USER:$USER /var/log/weekly-report

# Start and enable services
echo "Starting and enabling services..."
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo systemctl start nginx
sudo systemctl enable nginx

# Print versions for verification
echo -e "\nInstalled versions:"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "MySQL: $(mysql --version)"

echo -e "\nInstallation complete! You can now run deploy.sh"
echo "Note: You may need to log out and back in for Docker group changes to take effect." 