# Oracle VPS Deployment Runbook

Use this runbook as the source of truth for the backend deployment topology and release procedure for the migrated stack on `migration/express-prisma-neon`.

## Summary

The active deployment architecture is:

```txt
Vercel frontend -> Nginx on Oracle VM -> Dockerized Express API -> Prisma -> Neon Postgres
```

The backend public origin is:

```txt
https://api.reyslash.com
```

This deployment plan does not change API routes, Prisma schema, or auth behavior. It changes only where and how the backend is hosted.

## Topology

- Frontend: Vercel project rooted at `apps/frontend`
- Backend runtime: Docker container built from this repo
- Reverse proxy: Nginx installed on the Oracle VM host
- TLS: Certbot with Let's Encrypt on the Oracle VM host
- Database: Neon Postgres
- Auth: Firebase Authentication on the frontend plus Firebase Admin on the backend

Traffic flow:

1. Browser requests hit `https://api.reyslash.com`
2. Host Nginx terminates TLS
3. Nginx proxies `/api`, `/health`, and `/ready` to the backend container on a local port
4. The backend container serves the compiled Express API
5. Prisma connects to Neon with `DATABASE_URL`

## Host Responsibilities

The Oracle VPS is responsible for:

- running Docker
- running host-installed Nginx
- managing Let's Encrypt certificates through Certbot
- exposing ports `22`, `80`, and `443`
- keeping the backend container port private to the host

Recommended host layout:

- Oracle Cloud VPS with Ubuntu 24.04 or 22.04
- DNS `A` record for `api.reyslash.com` pointed at the VM public IP
- Oracle network security rules and host firewall permitting `22`, `80`, and `443`
- backend container bound only to localhost, for example `127.0.0.1:4000:4000`

## Docker Contract

The backend Docker image should be built from the repo checkout on the Oracle VM.

Build-time behavior:

- install dependencies during Docker build
- generate Prisma client during Docker build
- build TypeScript during Docker build

Runtime behavior:

- container startup runs only the compiled API server
- Prisma migrations do not run during container startup

Required deployment assets for the next implementation step:

- `apps/backend/Dockerfile`
- `.dockerignore` if needed at the repo root or backend level
- Nginx config example for `api.reyslash.com`
- deployment command set for build, run, replace, logs, and rollback

Those assets should implement this runbook directly and should not introduce application behavior changes.

## Prisma Migrations

Prisma production migrations remain a manual one-off deploy step.

Current deployment rule:

- run migrations from the repo checkout on the Oracle VM before replacing the running API container

Migration command:

```bash
pnpm --filter backend exec prisma migrate deploy
```

Do not move this command into container startup for the current deployment design.

## Environment Contract

### Vercel frontend

```env
VITE_API_BASE_URL=https://api.reyslash.com/api
VITE_APP_BASE_URL=https://your-vercel-project.vercel.app
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

### Backend container

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=https://your-vercel-project.vercel.app
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
COOKIE_DOMAIN=
```

Environment defaults and assumptions:

- `FRONTEND_URL` should be the deployed Vercel frontend origin
- `VITE_API_BASE_URL` should be `https://api.reyslash.com/api`
- leave `COOKIE_DOMAIN` unset unless frontend and backend later share a parent domain
- production backend startup must still satisfy the existing env checks in the app

## Release Procedure

Deployment source:

- branch: `migration/express-prisma-neon`
- build location: repo checkout on the Oracle VM

Release order:

1. Update the VM repo checkout to the desired commit on `migration/express-prisma-neon`
2. Verify backend environment variables for the container runtime
3. Run Prisma production migrations from the VM repo checkout
4. Build the backend Docker image
5. Replace the running backend container with the new image
6. Verify `https://api.reyslash.com/health`
7. Verify `https://api.reyslash.com/ready`
8. Redeploy or confirm the Vercel frontend with `VITE_API_BASE_URL=https://api.reyslash.com/api`
9. Run the full deployed verification checklist

## Deployment Commands

These commands are the target command set for the next implementation step.

### Build

```bash
docker build -f apps/backend/Dockerfile -t job-application-tracker-backend:latest .
```

### Run

```bash
docker run -d \
  --name job-application-tracker-backend \
  --restart unless-stopped \
  --env-file /path/to/backend.env \
  -p 127.0.0.1:4000:4000 \
  job-application-tracker-backend:latest
```

### Replace

```bash
docker stop job-application-tracker-backend
docker rm job-application-tracker-backend
docker run -d \
  --name job-application-tracker-backend \
  --restart unless-stopped \
  --env-file /path/to/backend.env \
  -p 127.0.0.1:4000:4000 \
  job-application-tracker-backend:latest
```

### Logs

```bash
docker logs -f job-application-tracker-backend
```

### Rollback

```bash
docker stop job-application-tracker-backend
docker rm job-application-tracker-backend
docker run -d \
  --name job-application-tracker-backend \
  --restart unless-stopped \
  --env-file /path/to/backend.env \
  -p 127.0.0.1:4000:4000 \
  job-application-tracker-backend:<previous-tag>
```

## Nginx and TLS Expectations

The host Nginx config should:

- serve `api.reyslash.com`
- terminate TLS
- proxy `/api`, `/health`, and `/ready` to `http://127.0.0.1:4000`
- preserve headers required for Express to understand the original request context

Certbot should:

- issue the initial Let's Encrypt certificate for `api.reyslash.com`
- keep renewal configured on the host

The Nginx config example itself should be added as part of the next implementation step.

## Acceptance Criteria

This deployment shape is complete only when all of the following are true:

- the backend image builds successfully on the VM
- container startup runs only the compiled API server
- migrations are run manually before container replacement
- Nginx proxies `/api`, `/health`, and `/ready` correctly
- Certbot provides a valid certificate for `api.reyslash.com`
- the Vercel frontend can talk to the Oracle-hosted backend without CORS or cookie regressions
- signup, login, logout, reload restore, protected routes, CRUD, demo flows, and Firebase email flows all pass against the deployed stack
