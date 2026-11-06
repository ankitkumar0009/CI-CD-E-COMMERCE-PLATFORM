# ==============================================================================
# Multi-Stage Dockerfile for CloudOps Backend API
# Stage 1: Builder (Install dependencies & run tests)
# Stage 2: Production Runner (Minimal non-root alpine image)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools if any native modules need compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Run automated tests during Docker build to enforce CI quality gate
RUN npm test -- --passWithNoTests

# Remove devDependencies to produce a slim bundle
RUN npm prune --production

# ==============================================================================
# Stage 2: Production Minimal Image
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Run as non-root user for security best practices
USER node

# Copy dependencies and application code from builder
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/src ./src

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Docker Healthcheck targeting Kubernetes/L7 endpoint
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]

