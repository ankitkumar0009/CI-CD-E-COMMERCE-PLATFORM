# ==============================================================================
# Multi-Stage Dockerfile for CloudOps Frontend SPA
# Stage 1: Build static assets via Vite
# Stage 2: Serve via Nginx Alpine with Reverse Proxy
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite Production Distribution
RUN npm run build

# ==============================================================================
# Stage 2: High-Performance Nginx Web Server
# ==============================================================================
FROM nginx:1.25-alpine

# Install curl for container health checks
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration with reverse proxy and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA bundle from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Container Healthcheck
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

