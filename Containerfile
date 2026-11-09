# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Production Backend
# ==========================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

# ==========================================
# Stage 3: Final Production Runner (OpenShift Compliant)
# ==========================================
FROM node:20-alpine
WORKDIR /app

# Red Hat OpenShift Security Context: Support arbitrary UIDs in group 0
RUN mkdir -p /app/backend /app/frontend/dist && \
    chgrp -R 0 /app && \
    chmod -R g=u /app

# Copy production backend dependencies and source
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY backend/ /app/backend/

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend

# Default OpenShift port
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Run as non-root user for OpenShift security compliance
USER 1001

CMD ["node", "server.js"]
