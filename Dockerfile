# Frontend Deployment (Next.js Static Export)
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies (allow lockfile updates in CI)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY frontend/. .

# Build Next.js static export
RUN pnpm run build

# Production stage - Nginx for static hosting
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx files
RUN rm -rf ./*

# Copy built static files
COPY --from=builder /app/out ./

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
