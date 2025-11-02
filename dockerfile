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


# FROM node:slim AS base

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# # Install Google Chrome Stable and fonts
# # Note: this installs the necessary libs to make the browser work with Puppeteer.
# RUN apt-get update && apt-get install gnupg wget -y && \
#     wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
#     sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
#     apt-get update && \
#     apt-get install google-chrome-stable -y --no-install-recommends && \
#     rm -rf /var/lib/apt/lists/*

# # Create a user with name 'app' and group that will be used to run the app
# RUN groupadd -r app && useradd -rm -g app -G audio,video app

# WORKDIR /usr/src/app

# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# FROM base AS dev

# ENV NODE_ENV=development

# RUN --mount=type=cache,target=/usr/src/app/.npm \
#     npm set cache /usr/src/app/.npm && \
#     npm ci

# COPY . .

# RUN npm run build

# RUN chown -R app:app /usr/src/app
# RUN chmod -R 777 /usr/src/app
# USER app

# CMD ["sh", "-c", "export NODE_ENV=development && npm run dev"]

# FROM base AS production

# ENV NODE_ENV=production
# RUN npm install --production --silent && mv node_modules ../
# COPY . .
# EXPOSE 3000
# RUN chown -R node /usr/src/app
# USER node
# CMD ["npm", "start"]
