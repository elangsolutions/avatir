FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

FROM base AS deps
COPY package.json yarn.lock ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN yarn install --frozen-lockfile

FROM deps AS build
COPY . .
RUN yarn workspace @avatir/backend prisma:generate
RUN yarn workspace @avatir/backend build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/generated ./apps/backend/generated
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
EXPOSE 3001
CMD ["node", "apps/backend/dist/main"]