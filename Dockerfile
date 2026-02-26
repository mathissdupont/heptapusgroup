# ─────────────────────────────────────────────────────
# Heptapus Group — Multi-stage Dockerfile
# ─────────────────────────────────────────────────────

# ── Stage 1: Dependencies ──
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Eski SQLite migration'larını temizle, PostgreSQL baseline oluştur
RUN sed -i 's/\r$//' scripts/init-pg-migrations.sh && sh scripts/init-pg-migrations.sh

# Prisma generate (PostgreSQL client)
RUN npx prisma generate

# Next.js standalone build — skip prisma migrate during Docker build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# ── Stage 3: Production ──
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy prisma schema + migrations for runtime migrate deploy
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Upload directory (will be mounted as volume)
RUN mkdir -p /app/data/uploads && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations then start server
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
