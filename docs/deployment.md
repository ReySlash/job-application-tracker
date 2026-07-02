# Oracle VPS Deployment Manual

Use this manual for a first-time deployment of the backend to a fresh Oracle VPS. This is the from-scratch setup path for the current production backend at `https://job-tracker-api.reyslash.com`.

## Target topology

```txt
Vercel frontend -> Nginx on Oracle VM -> Dockerized Express API -> Prisma -> Neon Postgres
```

## Prerequisites

- Oracle VPS with Ubuntu 24.04 or 22.04
- DNS control for `job-tracker-api.reyslash.com`
- Neon production database connection string
- Firebase Admin service-account credentials
- Access to the repo branch `migration/express-prisma-neon`

## Host setup

1. Update system packages.
2. Install Docker.
3. Install Nginx.
4. Install Certbot and the Nginx plugin.
5. Allow `22`, `80`, and `443` through Oracle networking and the VM firewall.
6. Point the DNS `A` record for `job-tracker-api.reyslash.com` at the VM public IP.

## Repo and environment setup

1. Clone the repo to the Oracle VM.
2. Check out `migration/express-prisma-neon`.
3. Create the backend runtime env file, for example `/opt/job-application-tracker/backend.env`.
4. Use `apps/backend/.env.docker.example` as the template.

Backend env requirements:

- Docker env-file values must be unquoted.
- Do not include frontend `VITE_*` variables.
- `FIREBASE_PRIVATE_KEY` must stay on one line with escaped `\n`.
- `FRONTEND_URL` should be the deployed Vercel frontend origin.
- `VITE_API_BASE_URL` on Vercel should be `https://job-tracker-api.reyslash.com/api`.

## Backend deployment

1. Run Prisma migrations from the repo checkout:

```bash
pnpm --filter backend exec prisma migrate deploy
```

2. Build the backend Docker image:

```bash
scripts/deploy-backend-docker.sh build
```

3. Start the backend container:

```bash
ENV_FILE=/opt/job-application-tracker/backend.env scripts/deploy-backend-docker.sh run
```

4. Verify the container logs:

```bash
scripts/deploy-backend-docker.sh logs
```

## Nginx and TLS

1. Use [ops/nginx/job-tracker-api.reyslash.com.conf.example](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/ops/nginx/job-tracker-api.reyslash.com.conf.example:1) as the Nginx site template.
2. Proxy `/api`, `/health`, and `/ready` to `127.0.0.1:4000`.
3. Issue the initial TLS certificate for `job-tracker-api.reyslash.com` with Certbot.
4. Verify renewal is configured.

## Frontend configuration

Configure the Vercel frontend with:

```env
VITE_API_BASE_URL=https://job-tracker-api.reyslash.com/api
VITE_APP_BASE_URL=https://your-vercel-project.vercel.app
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Ensure the deployed frontend origin is included in Firebase Authentication authorized domains.

## Verification

After the first deploy, verify:

- `https://job-tracker-api.reyslash.com/health`
- `https://job-tracker-api.reyslash.com/ready`
- Nginx proxying works for `/api`, `/health`, and `/ready`
- signup, login, logout, reload restore, protected routes, CRUD, demo flows, and Firebase email flows work

For the current deployed-state checklist, use [migration-verification-checklist.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/migration-verification-checklist.md:1).
