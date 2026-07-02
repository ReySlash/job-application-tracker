# Job Application Tracker

Job Application Tracker now runs as a monorepo full-stack application:

```txt
React frontend -> Express API -> Prisma -> Neon Postgres
```

The Supabase to Express/Prisma/Neon migration is complete on `migration/express-prisma-neon`, and this branch contains the verified post-migration application.

## Current Status

- `apps/frontend` contains the React client application
- `apps/backend` contains the Express/Prisma backend
- Prisma and the backend runtime are configured to use `apps/backend/.env`
- Prisma migration history is checked into the backend workspace
- backend auth routes are implemented:
  - `POST /api/auth/demo-login`
  - `POST /api/auth/logout`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
- backend applications CRUD is protected by bearer-token auth and scoped to the authenticated user
- backend demo reset is implemented at `POST /api/applications/demo-reset`
- frontend auth is wired to Firebase Authentication for real users
- frontend applications CRUD is wired to the backend applications API
- frontend and backend automated test suites are in place
- signup creates a Firebase-authenticated user and sends a Firebase-managed verification email
- verified users sign in through Firebase and call the Express API with Firebase ID tokens
- demo login works through `POST /api/auth/demo-login`
- frontend auth state restores through Firebase client persistence for real users and `/api/auth/refresh` for demo users
- frontend application list/create/update/delete now use the protected backend API
- demo reset works through `POST /api/applications/demo-reset`
- expired demo users are cleaned up hourly while the backend process is running
- backend CORS is enabled for credentialed frontend requests using `FRONTEND_URL`
- forgot-password, password reset, and email verification are handled by Firebase-managed email actions
- backend middleware verifies Firebase ID tokens and upserts Prisma users by `firebaseUid`
- Supabase is no longer required by the active frontend/backend auth flow
- deployment verification is complete and the branch is ready for final review and merge into `main`

Use [backend-migration-plan.md](job-application-tracker/backend-migration-plan.md) as a historical implementation roadmap.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- React Hook Form
- Zod

### Backend

- Express
- TypeScript
- Prisma
- Neon Postgres
- Firebase Admin SDK
- Zod
- jsonwebtoken
- cookie-parser
- cors
- dotenv

## Workspace Structure

```txt
job-application-tracker/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   ├── src/
│   │   └── test/
│   └── frontend/
│       ├── public/
│       └── src/
├── README.md
├── backend-migration-plan.md
├── AGENTS.md
├── package.json
└── pnpm-workspace.yaml
```

## Environment Variables

`apps/backend/.env` is the source of truth for Prisma and backend runtime configuration.

Supported env-file layout in this repo:

- `apps/backend/.env`: local backend development
- `apps/backend/.env.example`: backend local template
- `apps/backend/.env.docker.example`: backend Docker `--env-file` template
- `apps/frontend/.env`: local frontend development
- `apps/frontend/.env.example`: frontend local template

Unsupported for the active workflow:

- root-level `.env` and `.env.*` files are not part of the supported frontend/backend runtime contract for this monorepo
- if you have older root env files locally, treat them as leftovers and do not use them for backend Docker runs

Core backend variables:

```env
DATABASE_URL=your-neon-connection-string
JWT_SECRET=replace-this-with-a-real-secret
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

These are the production-required backend variables. Local development typically uses the localhost URL defaults shown above.

Optional backend auth tuning variables:

```env
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_DOMAIN=
```

Frontend environment:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_BASE_URL=http://localhost:5173
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Prisma is configured in `apps/backend/prisma.config.ts` to load `apps/backend/.env`, and the backend runtime loads the same file before Prisma initializes.

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the workspace apps:

```bash
pnpm dev
```

3. Run the frontend only:

```bash
pnpm dev:frontend
```

4. Run the backend only:

```bash
pnpm dev:backend
```

## Testing

Frontend:

```bash
pnpm --filter frontend test
```

Backend:

```bash
pnpm --filter backend test
pnpm --filter backend test:coverage
```

Whole workspace:

```bash
pnpm test
pnpm test:coverage
```

The backend test suite uses `Vitest` plus `Supertest` and mocks Prisma and Firebase verification boundaries instead of connecting to Neon or Firebase Auth.
If backend route tests fail in a restricted environment with `listen EPERM`, re-run `pnpm test` in an environment that permits socket binding before treating it as an application regression.

## Prisma Commands

Run Prisma commands through the backend workspace package:

```bash
pnpm --filter backend exec prisma validate
pnpm --filter backend exec prisma db pull --print
pnpm --filter backend exec prisma migrate status
pnpm --filter backend exec prisma migrate deploy
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate
```

## Backend Environment

Copy `apps/backend/.env.example` into `apps/backend/.env` and set the Firebase Admin credentials used by the Express API.

- `FRONTEND_URL` may be a single origin or a comma-separated list of allowed frontend origins
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` should come from a Firebase service account with Auth access
- `COOKIE_DOMAIN` is optional and can be used in production if your frontend and backend must share a parent cookie domain

In production, the backend fails fast if `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, or `FIREBASE_PRIVATE_KEY` is missing.

For Docker deployments, use [apps/backend/.env.docker.example](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/apps/backend/.env.docker.example:1) as the backend container template.

- Docker `--env-file` values must be unquoted
- Do not include frontend `VITE_*` variables in the backend container env file
- Keep `FIREBASE_PRIVATE_KEY` as a single line with escaped `\n` characters
- Do not use root `.env` or `.env.production` files for the backend container

## Deployment Targets

The active deployment architecture is:

- frontend deployed from `apps/frontend` to Vercel
- backend deployed to an Oracle Cloud VPS as a Dockerized Express API behind host-installed Nginx and Certbot
- backend public origin exposed at `https://job-tracker-api.reyslash.com`

Deployment wiring already present in the repo:

- [apps/frontend/vercel.json](job-application-tracker/apps/frontend/vercel.json:1) adds SPA rewrites for the Vercel frontend

Deployment documentation:

- [docs/oracle-vps-deployment-runbook.md](job-application-tracker/docs/oracle-vps-deployment-runbook.md:1) is the infrastructure source of truth for the Oracle VPS backend topology, Docker contract, Nginx/Certbot setup, and deployment procedure
- [docs/deployment.md](job-application-tracker/docs/deployment.md:1) is the from-scratch Oracle VPS deployment manual
- [docs/production-operations-runbook.md](job-application-tracker/docs/production-operations-runbook.md:1) is the current Oracle production operations runbook for Vercel + Oracle VPS + Neon

The old GitHub Pages deployment workflow has been removed from this branch because GitHub Pages is not the deployment target for the current stack.

## Current Deployment Flow

Use [docs/oracle-vps-deployment-runbook.md](job-application-tracker/docs/oracle-vps-deployment-runbook.md:1) as the infrastructure source of truth, [docs/deployment.md](job-application-tracker/docs/deployment.md:1) for first-time VPS setup, and [docs/production-operations-runbook.md](job-application-tracker/docs/production-operations-runbook.md:1) for current Oracle deploy and redeploy operations.

Current deployment workflow:

1. Update the Oracle VPS repo checkout to the desired commit on `migration/express-prisma-neon`
2. Verify the backend container env file on the Oracle VPS
3. Apply Prisma migrations manually from the repo checkout on the VM with `pnpm --filter backend exec prisma migrate deploy`
4. Build and replace the Dockerized backend on the Oracle VPS
5. Confirm the Vercel frontend is using `VITE_API_BASE_URL=https://job-tracker-api.reyslash.com/api`
6. Run the current Oracle deployment verification checklist

Provider-specific environment contract:

- Vercel frontend:
  - `VITE_API_BASE_URL`
  - `VITE_APP_BASE_URL`
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- Oracle VPS backend container:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - optional `COOKIE_DOMAIN`

Current URL topology:

- `FRONTEND_URL` should be the Vercel frontend origin
- `VITE_API_BASE_URL` should be `https://job-tracker-api.reyslash.com/api`
- Leave `COOKIE_DOMAIN` unset unless you intentionally move frontend and backend under the same parent domain
- Ensure the deployed frontend origin remains present in Firebase Authentication authorized domains

Operational expectations:

- The backend Docker image installs dependencies, generates the Prisma client, and builds TypeScript during `docker build`
- Container startup runs only the compiled API server
- Prisma production migrations are a manual one-off deploy step run from the VM repo checkout before replacing the running API container
- Oracle VPS health checks should use `GET /ready`
- `GET /health` remains a process health endpoint, not a database readiness endpoint
- Cross-origin demo auth in production depends on `HttpOnly`, `Secure`, `SameSite=None` cookies and a working `POST /api/auth/refresh` flow after a browser reload
- No deployed runtime path should depend on Supabase

## Migration Verification

The completed verification record lives in [docs/migration-verification-checklist.md](job-application-tracker/docs/migration-verification-checklist.md:1).

## Database State

The current Prisma schema includes these models:

- `User`
- `Application`
- `RefreshToken`
- `ApplicationStatus`

Migrations currently live at:

```txt
apps/backend/prisma/migrations/20260528120000_init/migration.sql
apps/backend/prisma/migrations/20260607000100_add_firebase_uid_to_user/migration.sql
apps/backend/prisma/migrations/20260607000200_remove_legacy_auth_artifacts/migration.sql
```

## Notes

- The migration work on `migration/express-prisma-neon` is complete and verified; the remaining repository step is merging this branch into `main`.
- For the implementation roadmap and historical scope, use [backend-migration-plan.md](job-application-tracker/backend-migration-plan.md).
- The backend still uses `JWT_SECRET` for demo-session tokens and falls back to a development-only default if it is missing. Do not rely on that fallback outside local development.
- In production, refresh cookies are configured as `SameSite=None` and `Secure=true` for cross-origin frontend/backend deployments.

## Author

Built by ReySlash.
