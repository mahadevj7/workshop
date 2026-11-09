# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Production Backend
# ==========================================
FROM node:20-slim AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

# ==========================================
# Stage 3: Final Production Runner (OpenShift Compliant)
# ==========================================
FROM node:20-slim
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

# Default OpenShift environment variables
ENV PORT=8080
ENV NODE_ENV=production
ENV MONGO_URI="mongodb+srv://mahadevjayan4_db_user:8nGOHuXEOfgsuuzT@cluster0.aqatdrz.mongodb.net/classroom_db?retryWrites=true&w=majority"
ENV JWT_SECRET="classroom_secret_jwt_key_2026_super_secure"

EXPOSE 8080

# Run as non-root user for OpenShift security compliance
USER 1001

CMD ["node", "server.js"]
