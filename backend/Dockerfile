# syntax=docker/dockerfile:1

# Node version matches backend/package.json "volta.node" (24.x).
# Yarn comes from package.json "packageManager" via corepack.
ARG NODE_VERSION=24.21.0

# ---------- base: Node + corepack-managed Yarn ----------
FROM node:${NODE_VERSION}-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# ---------- deps: full install (dev deps needed for nest build) ----------
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache,sharing=locked \
    yarn install --immutable

# ---------- build: compile TypeScript -> dist ----------
# Calls `nest build` directly; lint runs in CI, not in the image build.
FROM deps AS build
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

# ---------- prod-deps: production dependencies only ----------
FROM base AS prod-deps
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache,sharing=locked \
    yarn workspaces focus --production

# ---------- runtime ----------
FROM node:${NODE_VERSION}-alpine AS runtime
# tini as PID 1: node as PID 1 ignores SIGTERM (no default handler).
RUN apk add --no-cache tini
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

# uid/gid 1000 = "node" user in the official image.
COPY --chown=1000:1000 package.json ./
COPY --chown=1000:1000 --from=prod-deps /app/node_modules ./node_modules
COPY --chown=1000:1000 --from=build /app/dist ./dist

# Numeric uid so Kubernetes runAsNonRoot can verify it.
USER 1000:1000
EXPOSE 3000

# No HEALTHCHECK: Kubernetes ignores it, and /health-check currently
# hardcodes 127.0.0.1:5431 (see app.service.ts), so it fails in a container.

# Pending TypeORM migrations also run on start (migrationsRun: true).
# One-off migrations from this image:
#   node node_modules/typeorm/cli.js migration:run -d dist/data-source.js
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
