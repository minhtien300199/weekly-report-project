#!/bin/bash

# Check if application is running
if ! pm2 show weekly-report > /dev/null 2>&1; then
    echo "Application is down! Restarting..."
    cd /var/www/weekly-report
    pm2 start app.js --name weekly-report
    
    # Send notification (customize as needed)
    # mail -s "Weekly Report App Restarted" your@email.com
fi

# Check MySQL
if ! systemctl is-active --quiet mysqld; then
    echo "MySQL is down! Restarting..."
    sudo systemctl restart mysqld
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down! Restarting..."
    sudo systemctl restart nginx
fi 