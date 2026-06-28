# Staging Deployment Runbook

Use this runbook to deploy the migrated stack from `migration/express-prisma-neon` into a staging environment before any production cutover.

## Target topology

- Frontend: Vercel project rooted at `apps/frontend`
- Backend: Dockerized Express API on an Oracle Cloud VPS
- Reverse proxy and TLS: host-installed Nginx plus Certbot/Let's Encrypt
- Database: Neon Postgres
- Auth email delivery: Firebase Authentication managed email actions

For staging:

- Set the Vercel frontend URL as `FRONTEND_URL`
- Set `VITE_API_BASE_URL` to `https://api.reyslash.com/api`
- Leave `COOKIE_DOMAIN` unset unless you have a real shared parent-domain requirement

## Deployment order

1. Provision the Neon staging database and copy its connection string.
2. Prepare the Oracle VPS:
   - install Docker
   - install Nginx
   - install Certbot
   - point `api.reyslash.com` DNS at the VM public IP
   - allow `22`, `80`, and `443` through Oracle networking and the VM firewall
3. Clone the repo on the VM, check out `migration/express-prisma-neon`, and set backend environment variables for the container runtime.
4. Run Prisma production migrations manually from the repo checkout on the VM:

```bash
pnpm --filter backend exec prisma migrate deploy
```

5. Build and run or replace the backend Docker container on the Oracle VPS.
6. Configure host Nginx to reverse-proxy `/api`, `/health`, and `/ready` to the container's local port.
7. Issue and install the TLS certificate for `api.reyslash.com` with Certbot.
8. Set the Vercel frontend env vars:
   - `VITE_API_BASE_URL`
   - `VITE_APP_BASE_URL`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
9. Deploy the Vercel frontend.
10. Run the full staging verification checklist in [migration-verification-checklist.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/migration-verification-checklist.md:1).

## Environment variables

### Vercel frontend

```env
VITE_API_BASE_URL=https://api.reyslash.com/api
VITE_APP_BASE_URL=https://your-vercel-project.vercel.app
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

### Oracle backend container

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=https://your-vercel-project.vercel.app
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
COOKIE_DOMAIN=
```

## Runtime expectations

- The backend Docker image installs dependencies, generates Prisma client code, and builds TypeScript during `docker build`
- Container startup runs only the compiled API server
- Prisma migrations are a manual one-off deploy step and should run from the repo checkout on the VM before replacing the running API container
- Host Nginx terminates TLS and reverse-proxies to the backend container
- Certbot manages the `api.reyslash.com` Let's Encrypt certificate on the host
- Oracle VPS health checks should use `GET /ready`
- `GET /health` is liveness-only
- `GET /ready` must confirm both the app process and Neon connectivity
- Firebase email verification and password-reset actions must use a deployed frontend `VITE_APP_BASE_URL`, not localhost or the backend origin
- Non-demo protected API requests must send a valid Firebase ID token in `Authorization: Bearer ...`
- Demo session restore must still work through `POST /api/auth/refresh` after a full browser reload

## Release blockers

Do not continue from staging to production until all of the following are true:

- `pnpm lint` passes
- `pnpm build` passes
- `pnpm test` passes in an environment that permits backend `supertest` socket binding
- `https://api.reyslash.com/health` and `https://api.reyslash.com/ready` both behave as expected through Nginx
- Nginx is proxying `/api`, `/health`, and `/ready` correctly to the backend container
- Certbot has issued a valid certificate for `api.reyslash.com`
- Signup, verification, login, logout, Firebase session restore, protected routes, CRUD, demo flows, and password reset all pass in staging
- No deployed runtime path depends on Supabase
