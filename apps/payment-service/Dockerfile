FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9.0.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
# Build workspace deps and generate Prisma client (needed by product-db)
RUN pnpm --filter @shopflow/kafka... build
RUN pnpm --filter @shopflow/product-db run db:generate

# Build the payment-service itself (tsc -> dist/)
FROM deps AS builder
COPY apps/payment-service/tsconfig.json ./apps/payment-service/tsconfig.json
COPY apps/payment-service/src ./apps/payment-service/src
RUN pnpm --filter payment-service build

FROM builder AS runner
WORKDIR /app/apps/payment-service
# Copy only production node_modules and the compiled dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/payment-service/dist ./dist
EXPOSE 8002
CMD ["node", "dist/index.js"]