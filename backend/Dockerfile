# Use the official Node.js LTS image
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for argon2 / prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install all dependencies (including devDeps needed for the build)
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ---------- production image ----------
FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the compiled JS + Prisma client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/server.js"]
