FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9.0.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @shopflow/kafka... build

FROM base AS build
ARG NEXT_PUBLIC_PRODUCT_SERVICE_URL
ARG NEXT_PUBLIC_ORDER_SERVICE_URL
ARG NEXT_PUBLIC_AUTH_SERVICE_URL
ARG NEXT_PUBLIC_PAYMENT_SERVICE_URL
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
ENV NEXT_PUBLIC_PRODUCT_SERVICE_URL=$NEXT_PUBLIC_PRODUCT_SERVICE_URL
ENV NEXT_PUBLIC_ORDER_SERVICE_URL=$NEXT_PUBLIC_ORDER_SERVICE_URL
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL
ENV NEXT_PUBLIC_PAYMENT_SERVICE_URL=$NEXT_PUBLIC_PAYMENT_SERVICE_URL
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
RUN pnpm --filter admin build

FROM base AS runner
COPY --from=deps /app/package.json /app/package.json
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/admin/package.json /app/apps/admin/package.json
COPY --from=deps /app/apps/admin/public /app/apps/admin/public
COPY --from=deps /app/apps/admin/next.config.ts /app/apps/admin/next.config.ts
COPY --from=deps /app/apps/admin/tsconfig.json /app/apps/admin/tsconfig.json
COPY --from=build /app/apps/admin/.next /app/apps/admin/.next
COPY --from=deps /app/packages /app/packages
WORKDIR /app/apps/admin
EXPOSE 3003
CMD ["pnpm", "start"]