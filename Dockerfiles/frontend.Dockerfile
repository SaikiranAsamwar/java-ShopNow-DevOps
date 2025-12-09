# ------------------------------------------------------------
# FRONTEND DOCKERFILE - Static HTML/CSS/JS Application
# Multi-stage Dockerfile to serve static files with Nginx
# ------------------------------------------------------------

# ---------- STAGE 1: Prepare ----------
FROM alpine:3.18 AS builder

WORKDIR /app

# Copy all static files
COPY src/main/resources/static/ ./static/

# ---------- STAGE 2: Serve with Nginx ----------
FROM nginx:1.25-alpine

# Copy static files to nginx directory
COPY --from=builder /app/static /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
