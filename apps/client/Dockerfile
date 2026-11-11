FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9.0.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @shopflow/kafka... build

FROM deps AS build
ARG NEXT_PUBLIC_PRODUCT_SERVICE_URL
ARG NEXT_PUBLIC_ORDER_SERVICE_URL
ARG NEXT_PUBLIC_AUTH_SERVICE_URL
ARG NEXT_PUBLIC_PAYMENT_SERVICE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
ENV NEXT_PUBLIC_PRODUCT_SERVICE_URL=$NEXT_PUBLIC_PRODUCT_SERVICE_URL
ENV NEXT_PUBLIC_ORDER_SERVICE_URL=$NEXT_PUBLIC_ORDER_SERVICE_URL
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL
ENV NEXT_PUBLIC_PAYMENT_SERVICE_URL=$NEXT_PUBLIC_PAYMENT_SERVICE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
RUN pnpm --filter client build

FROM base AS runner
COPY --from=deps /app/package.json /app/package.json
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/client/package.json /app/apps/client/package.json
COPY --from=deps /app/apps/client/public /app/apps/client/public
COPY --from=deps /app/apps/client/next.config.ts /app/apps/client/next.config.ts
COPY --from=deps /app/apps/client/tsconfig.json /app/apps/client/tsconfig.json
COPY --from=build /app/apps/client/.next /app/apps/client/.next
COPY --from=deps /app/packages /app/packages
WORKDIR /app/apps/client
EXPOSE 3002
CMD ["pnpm", "start"]