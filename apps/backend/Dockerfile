FROM node:22-bookworm-slim AS builder

WORKDIR /workspace

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DATABASE_URL=$DATABASE_URL

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/tsconfig.json apps/backend/prisma.config.ts ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/src ./apps/backend/src

RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend prisma:generate
RUN pnpm --filter backend build

FROM node:22-bookworm-slim AS prod-deps

WORKDIR /workspace

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm install --filter backend --prod --frozen-lockfile

FROM node:22-bookworm-slim AS runtime

WORKDIR /app/apps/backend

ENV NODE_ENV=production

COPY --from=prod-deps /workspace/node_modules /app/node_modules
COPY --from=prod-deps /workspace/package.json /app/package.json
COPY --from=prod-deps /workspace/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=builder /workspace/apps/backend/package.json ./package.json
COPY --from=prod-deps /workspace/apps/backend/node_modules ./node_modules
COPY --from=builder /workspace/apps/backend/dist ./dist
COPY --from=builder /workspace/apps/backend/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/src/server.js"]
