# Stage 1: Build the Angular application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist/modernize /usr/share/nginx/html

# Copy environment configuration script
COPY env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
