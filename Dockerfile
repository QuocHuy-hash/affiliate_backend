FROM node:18 AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Create logs directory
RUN mkdir -p /app/logs

# Expose the port
EXPOSE 9000

# Command to run the application
CMD ["node", "dist/index.js"] 