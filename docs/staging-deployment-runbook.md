# Staging Deployment Runbook

Use this runbook to deploy the migrated stack from `migration/express-prisma-neon` into a staging environment before any production cutover.

## Target topology

- Frontend: Vercel project rooted at `apps/frontend`
- Backend: Render web service from this monorepo using `render.yaml`
- Database: Neon Postgres
- Auth email delivery: Firebase Authentication managed email actions

For staging:

- Set the Vercel frontend URL as `FRONTEND_URL`
- Set `VITE_API_BASE_URL` to `https://<render-backend-origin>/api`
- Leave `COOKIE_DOMAIN` unset unless you have a real shared parent-domain requirement

## Deployment order

1. Provision the Neon staging database and copy its connection string.
2. Set backend environment variables in Render.
3. Run Prisma production migrations manually:

```bash
pnpm --filter backend exec prisma migrate deploy
```

4. Deploy the Render backend.
5. Set the Vercel frontend env vars:
   - `VITE_API_BASE_URL`
   - `VITE_APP_BASE_URL`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
6. Deploy the Vercel frontend.
7. Run the full staging verification checklist in [migration-verification-checklist.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/migration-verification-checklist.md:1).

## Environment variables

### Vercel frontend

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
VITE_APP_BASE_URL=https://your-vercel-project.vercel.app
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

### Render backend

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

- Render health checks use `GET /ready`
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
- Signup, verification, login, logout, Firebase session restore, protected routes, CRUD, demo flows, and password reset all pass in staging
- No deployed runtime path depends on Supabase
