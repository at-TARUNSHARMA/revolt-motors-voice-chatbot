# Multi-stage build for production deployment
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Copy backend code and dependencies
COPY backend ./backend
COPY --from=build /app/backend/node_modules ./backend/node_modules

# Copy built frontend
COPY --from=build /app/frontend/build ./frontend/build

# Install serve for serving static files
RUN npm install -g serve

# Create startup script
RUN echo '#!/bin/sh\n\
serve -s frontend/build -l 3000 &\n\
cd backend && node server-live.js &\n\
wait' > start.sh && chmod +x start.sh

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["./start.sh"]
