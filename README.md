# nest-starter

Opinionated NestJS service template: pino, typed config, health checks, Docker, ready-to-go Jest setup. Use it as a GitHub template — clone, rename, keep going.

## Stack

- Node.js 24 LTS
- NestJS 11 (Express)
- nestjs-pino + pino-http (structured JSON logs + `x-request-id`)
- @nestjs/config + class-validator (typed `.env` validation)
- @nestjs/terminus (`/health`, `/ready`)
- Jest (unit + e2e), ESLint 8, Prettier
- Multi-stage Dockerfile + dev/prod docker-compose files

## Quick start

```bash
nvm use            # picks up .nvmrc → Node 24
cp .env.example .env
npm install
npm run dev
```

Once running:

```bash
curl http://localhost:3000/health   # → {"status":"ok",...}
curl http://localhost:3000/ready
```

## Scripts

### Local

| Script | What it does |
|---|---|
| `npm run dev` | nest watch-mode, hot-reload |
| `npm run debug` | same + `--inspect` |
| `npm run prod` | run the built `dist/main` |
| `npm run start` | nest start (no watch) |
| `npm run build` | TS → `dist/` |
| `npm run lint` | ESLint + autofix |
| `npm run format` | Prettier over `src/` and `test/` |
| `npm test` | unit tests (`*.spec.ts` under `src/`) |
| `npm run test:watch` | unit tests in watch mode |
| `npm run test:cov` | coverage |
| `npm run test:e2e` | e2e tests from `test/` |
| `npm run test:debug` | e2e with `--inspect-brk` |

### Docker

| Script | What it does |
|---|---|
| `npm run docker:run:dev` | start dev compose in background (build + up -d) |
| `npm run docker:logs:dev` | follow dev compose logs |
| `npm run docker:down:dev` | stop dev compose |
| `npm run docker:run` | start prod compose in background |
| `npm run docker:logs` | follow prod compose logs |
| `npm run docker:down` | stop prod compose |
| `npm run docker:build` | build prod image `nest-starter:latest` without compose |

## Layout

```
src/
  config/
    env.schema.ts            # EnvVars class + validateEnv (class-validator)
    config.module.ts         # @Global ConfigModule
    app-config.service.ts    # typed access to env
  logger/
    logger.module.ts         # nestjs-pino + x-request-id + redact
  health/
    health.controller.ts     # GET /health, /ready
    health.module.ts
  app.module.ts
  main.ts                    # bootstrap: pino logger, ValidationPipe, shutdown hooks
test/
  app.e2e-spec.ts            # smoke for /health, /ready, request-id
```

## Add an environment variable

1. Add the field to the `EnvVars` class in [src/config/env.schema.ts](src/config/env.schema.ts) with `class-validator` decorators.
2. Add a getter in [src/config/app-config.service.ts](src/config/app-config.service.ts).
3. Put the value into `.env.example` and `.env`.

If the value is invalid or missing without a default, the app fails fast on startup.

## Docker

Two compose files and two Dockerfiles (same pattern as `backend`):

| File | When to use |
|---|---|
| [Dockerfile](Dockerfile) | prod multi-stage (builder + runner on `node:24-slim`, TZ, `npm prune --omit=dev`, `USER node`) |
| [Dockerfile.dev](Dockerfile.dev) | dev image with `npm ci` only; command is set in compose |
| [docker-compose.dev.yml](docker-compose.dev.yml) | local hot-reload (mount the project + named volume for `node_modules`) |
| [docker-compose.prod.yml](docker-compose.prod.yml) | prod deployment (`restart: always`, `env_file: .env`) |

Before running anything:

```bash
cp .env.example .env
```

### Dev (hot-reload)

```bash
npm run docker:run:dev
# or: docker compose -f docker-compose.dev.yml up --build
# logs go through pino-pretty, /health on http://localhost:3000/health
```

### Prod

```bash
npm run docker:run
# or, without compose:
npm run docker:build
docker run --rm -p 3000:3000 --env-file .env nest-starter:latest
```

The prod image hardcodes `NODE_ENV=production`, pino emits JSON, container runs as the `node` user.

## Using as a template

On GitHub click **Use this template** → it creates a fresh repo. Then locally:

```bash
git clone <new-repo>
cd <new-repo>
# update name in package.json, README title, .env.example
npm install
```

## What's intentionally missing

- No database (Prisma/TypeORM) — add per service.
- No Kafka/queues — for event-driven services use a separate template.
- No auth (JWT/passport) — only needed for public APIs.
- No Swagger — add as a single module when you need it.

The template is intentionally thin: fewer defaults mean less to strip out in each new service.
