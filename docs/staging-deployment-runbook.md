# Staging Deployment Runbook

Use this runbook to deploy the migrated stack from `migration/express-prisma-neon` into a staging environment before any production cutover.

## Target topology

- Frontend: Vercel project rooted at `apps/frontend`
- Backend: Render web service from this monorepo using `render.yaml`
- Database: Neon Postgres
- Mail: Gmail SMTP

For staging:

- Set the Vercel frontend URL as `FRONTEND_URL`
- Set the Render backend URL as `BACKEND_URL`
- Set `VITE_API_BASE_URL` to `${BACKEND_URL}/api`
- Leave `COOKIE_DOMAIN` unset unless you have a real shared parent-domain requirement

## Deployment order

1. Provision the Neon staging database and copy its connection string.
2. Set backend environment variables in Render.
3. Run Prisma production migrations manually:

```bash
pnpm --filter backend exec prisma migrate deploy
```

4. Deploy the Render backend.
5. Set `VITE_API_BASE_URL` in Vercel to the deployed backend API URL.
6. Deploy the Vercel frontend.
7. Run the full staging verification checklist in [migration-verification-checklist.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/migration-verification-checklist.md:1).

## Environment variables

### Vercel frontend

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

### Render backend

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=https://your-vercel-project.vercel.app
BACKEND_URL=https://your-render-service.onrender.com
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=Job Application Tracker <your-email@gmail.com>
FRONTEND_RESET_PASSWORD_URL=https://your-vercel-project.vercel.app/reset-password
FRONTEND_VERIFY_EMAIL_URL=https://your-vercel-project.vercel.app/verify-email
COOKIE_DOMAIN=
```

## Runtime expectations

- Render health checks use `GET /health`
- `/health` only confirms the app process is running; it is not a database readiness check
- Production refresh cookies must be `HttpOnly`, `Secure`, and `SameSite=None`
- Session restore must work through `POST /api/auth/refresh` after a full browser reload
- Verification and reset emails must link to the deployed frontend pages, not localhost

## Release blockers

Do not continue from staging to production until all of the following are true:

- `pnpm lint` passes
- `pnpm build` passes
- `pnpm test` passes in an environment that permits backend `supertest` socket binding
- Signup, verification, login, logout, refresh, protected routes, CRUD, demo flows, and password reset all pass in staging
- No deployed runtime path depends on Supabase
