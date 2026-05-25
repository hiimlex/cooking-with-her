# Build context must be the project root so that shared/ is accessible.
# In docker-compose: build: { context: .., dockerfile: server/Dockerfile }

FROM node:20-alpine
WORKDIR /app/server

# shared/ sits one level above server/ in the monorepo.
# Server routes import it via: ../../../shared/api  (routes→src→server→app)
# Placing it at /app/shared/ makes that relative path resolve correctly.
COPY shared/ /app/shared/

# Install server dependencies
COPY server/package*.json ./
RUN npm ci

# Copy server source (node_modules excluded via .dockerignore)
COPY server/ ./

# Generate the Prisma client for the current platform
RUN npx prisma generate

EXPOSE 3333

COPY server/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
