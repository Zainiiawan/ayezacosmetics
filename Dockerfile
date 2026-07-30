# Railway API image — monorepo root as build context.
# Forces Express API build (avoids Nixpacks mistaking the repo for Next.js).
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY turbo.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci

COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm run build --workspace=@ayeza/shared \
  && npm run build --workspace=@ayeza/api \
  && test -f backend/dist/index.js \
  && test -f packages/shared/dist/index.js \
  && echo "Railway build OK: backend/dist/index.js"

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5001

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Ensure package entry points resolve to compiled JS
RUN test -f backend/dist/index.js \
  && test -f packages/shared/dist/index.js \
  && node -e "require('./packages/shared/dist/index.js'); console.log('shared ok')"

EXPOSE 5001

CMD ["node", "backend/dist/index.js"]
