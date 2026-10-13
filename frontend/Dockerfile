# syntax=docker/dockerfile:1

# Node version matches the repo's Volta pin (24.x). Yarn comes from
# package.json "packageManager" via corepack.
ARG NODE_VERSION=24.21.0

# ---------- base: Node + corepack-managed Yarn ----------
FROM node:${NODE_VERSION}-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache,sharing=locked \
    yarn install --immutable

# ---------- build: next build -> .next/standalone ----------
FROM deps AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN yarn build

# ---------- runtime ----------
FROM node:${NODE_VERSION}-alpine AS runtime
# tini as PID 1: node as PID 1 ignores SIGTERM (no default handler).
RUN apk add --no-cache tini
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# uid/gid 1000 = "node" user in the official image.
COPY --chown=1000:1000 --from=build /app/public ./public
COPY --chown=1000:1000 --from=build /app/.next/standalone ./
COPY --chown=1000:1000 --from=build /app/.next/static ./.next/static

# Numeric uid so Kubernetes runAsNonRoot can verify it.
USER 1000:1000
EXPOSE 3001

# For docker/compose only; Kubernetes ignores HEALTHCHECK.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1

# API_URL (backend base URL) is read server-side at runtime; pass it with -e.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
