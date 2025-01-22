#!/bin/bash

# Check containers status
containers=("weekly-report-app" "weekly-report-db" "weekly-report-nginx")

for container in "${containers[@]}"; do
    if ! docker container inspect "$container" >/dev/null 2>&1; then
        echo "Container $container is not running! Restarting..."
        docker start "$container"
        
        # Send notification (customize as needed)
        # mail -s "Docker Container $container Restarted" your@email.com
    fi
done

# Check container health
for container in "${containers[@]}"; do
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
    if [ "$health" = "unhealthy" ]; then
        echo "Container $container is unhealthy! Restarting..."
        docker restart "$container"
    fi
done

# Log container stats
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" >> /var/log/docker-stats.log 