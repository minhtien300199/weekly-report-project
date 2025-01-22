#!/bin/bash

# Update system
sudo yum update -y

# Install EPEL repository
sudo yum install epel-release -y

# Install Node.js and npm
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install development tools
sudo yum groupinstall 'Development Tools' -y

# Install Git
sudo yum install git -y

# Install MySQL 8
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
sudo yum install -y mysql-community-server

# Install Nginx
sudo yum install nginx -y

# Start and enable MySQL and Nginx
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo systemctl start nginx
sudo systemctl enable nginx

# Get initial MySQL root password
echo "Initial MySQL root password:"
sudo grep 'temporary password' /var/log/mysqld.log 