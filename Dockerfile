# ─────────────────────────────────────────────────────
# Heptapus Group — Multi-stage Dockerfile
# ─────────────────────────────────────────────────────

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS production-deps
RUN npm prune --omit=dev

# ── Stage 2: Build ──
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Validate checked-in PostgreSQL migrations without changing their history.
RUN sed -i 's/\r$//' scripts/init-pg-migrations.sh && sh scripts/init-pg-migrations.sh

# Prisma generate (PostgreSQL client)
RUN npx prisma generate

# Build-time args for NEXT_PUBLIC_* variables (must be present at build time)
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

# Next.js standalone build — skip prisma migrate during Docker build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# ── Stage 3: Production ──
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts/start-production.mjs ./scripts/start-production.mjs
COPY --from=builder /app/scripts/rotating-log.mjs ./scripts/rotating-log.mjs
COPY --from=builder /app/scripts/check-production-db.mjs ./scripts/check-production-db.mjs

# Copy prisma schema + migrations for runtime migrate deploy
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Upload directory (will be mounted as volume)
RUN mkdir -p /app/data/uploads /app/data/logs /app/.next/cache \
    && chown -R nextjs:nodejs /app/data /app/.next/cache

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations then start server
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && exec node scripts/start-production.mjs"]
