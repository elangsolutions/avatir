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
ARG VITE_GRAPHQL_URL=http://localhost:3001/graphql
ENV VITE_GRAPHQL_URL=${VITE_GRAPHQL_URL}
RUN yarn workspace @avatir/frontend build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare yarn@1.22.22 --activate && yarn global add serve
COPY --from=build /app/apps/frontend/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]