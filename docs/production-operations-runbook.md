# Oracle Production Operations Runbook

Use this runbook for current deploy and redeploy operations on the Oracle-hosted backend in `migration/express-prisma-neon`.

## Target topology

- Frontend: Vercel project rooted at `apps/frontend`
- Backend: Dockerized Express API on an Oracle Cloud VPS
- Reverse proxy and TLS: host-installed Nginx plus Certbot/Let's Encrypt
- Database: Neon Postgres
- Auth email delivery: Firebase Authentication managed email actions

Current production assumptions:

- `FRONTEND_URL` is the deployed Vercel frontend origin
- `VITE_API_BASE_URL` is `https://job-tracker-api.reyslash.com/api`
- `COOKIE_DOMAIN` remains unset unless frontend and backend move under the same parent domain

## Deploy / Redeploy Order

1. Update the repo checkout on the Oracle VM to the desired commit on `migration/express-prisma-neon`.
2. Verify the backend container env file on the Oracle VM.
3. Run Prisma production migrations manually from the repo checkout on the VM:

```bash
pnpm --filter backend exec prisma migrate deploy
```

4. Build and run or replace the backend Docker container on the Oracle VPS.
5. Confirm host Nginx is still reverse-proxying `/api`, `/health`, and `/ready` to the container's local port.
6. Confirm the `job-tracker-api.reyslash.com` TLS certificate remains valid through Certbot.
7. Confirm the Vercel frontend env vars still point to the deployed Oracle backend:
   - `VITE_API_BASE_URL`
   - `VITE_APP_BASE_URL`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
8. Redeploy the Vercel frontend only if frontend environment or frontend code changed.
9. Run the current Oracle deployment verification checklist in [migration-verification-checklist.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/migration-verification-checklist.md:1).

## Environment variables

### Vercel frontend

```env
VITE_API_BASE_URL=https://job-tracker-api.reyslash.com/api
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
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
COOKIE_DOMAIN=
```

## Runtime expectations

- The backend Docker image installs dependencies, generates Prisma client code, and builds TypeScript during `docker build`
- Container startup runs only the compiled API server
- Prisma migrations are a manual one-off deploy step and should run from the repo checkout on the VM before replacing the running API container
- Host Nginx terminates TLS and reverse-proxies to the backend container
- Certbot manages the `job-tracker-api.reyslash.com` Let's Encrypt certificate on the host
- Oracle VPS health checks should use `GET /ready`
- `GET /health` is liveness-only
- `GET /ready` must confirm both the app process and Neon connectivity
- Firebase email verification and password-reset actions must use a deployed frontend `VITE_APP_BASE_URL`, not localhost or the backend origin
- Non-demo protected API requests must send a valid Firebase ID token in `Authorization: Bearer ...`
- Demo session restore must still work through `POST /api/auth/refresh` after a full browser reload

## Deployment Validation

Treat the deployment as healthy only when all of the following are true:

- `pnpm lint` passes
- `pnpm build` passes
- `pnpm test` passes in an environment that permits backend `supertest` socket binding
- `https://job-tracker-api.reyslash.com/health` and `https://job-tracker-api.reyslash.com/ready` both behave as expected through Nginx
- Nginx is proxying `/api`, `/health`, and `/ready` correctly to the backend container
- Certbot has issued a valid certificate for `job-tracker-api.reyslash.com`
- Signup, verification, login, logout, Firebase session restore, protected routes, CRUD, demo flows, and password reset all pass against the deployed stack
- No deployed runtime path depends on Supabase
