# Use Node.js LTS version
FROM node:18-alpine

# Add labels
LABEL maintainer="your-email@example.com"
LABEL version="1.0"
LABEL description="Weekly Report Application"

# Create app directory
WORKDIR /usr/src/app

# Install production dependencies first
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create volume for persistent data
VOLUME ["/usr/src/app/logs"]

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start command
CMD ["npm", "start"] 