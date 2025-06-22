# Multi-stage build for Next.js frontend
FROM node:18-alpine AS base

# Development stage
FROM base AS development
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command with hot reload
CMD ["npm", "run", "dev:next"]

# Production stage (for future use)
FROM base AS production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Production command
CMD ["npm", "start"]