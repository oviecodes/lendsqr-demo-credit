# Base stage
FROM node:20-alpine3.17 AS base


WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS dev

ENV NODE_ENV=development

# Use build cache for npm
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

CMD ["sh", "-c", "export NODE_ENV=development && npm run dev"]

# Build stage
FROM base AS builder

RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production

ENV NODE_ENV=production

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy any additional necessary files
COPY --from=builder /app/src ./src

# Create non-root user
USER app

EXPOSE 3000

CMD ["npm", "start"]


