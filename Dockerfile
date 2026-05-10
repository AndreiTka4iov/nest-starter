ARG NODE_VERSION=24-slim

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

ENV TZ=Europe/Moscow

RUN apt-get update \
  && apt-get install -y --no-install-recommends tzdata procps openssl ca-certificates \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
  && echo $TZ > /etc/timezone \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev


FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Europe/Moscow

RUN apt-get update \
  && apt-get install -y --no-install-recommends tzdata openssl ca-certificates \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
  && echo $TZ > /etc/timezone \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
