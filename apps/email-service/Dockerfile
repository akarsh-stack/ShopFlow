FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9.0.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
# Build workspace dependencies that need building
RUN pnpm --filter @shopflow/kafka... build

FROM deps AS runner
COPY --from=deps /app/package.json /app/package.json
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/email-service /app/apps/email-service
COPY --from=deps /app/packages /app/packages
WORKDIR /app/apps/email-service
EXPOSE 8004
CMD ["pnpm", "start"]