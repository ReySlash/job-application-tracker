# Job Application Tracker

Job Application Tracker is being migrated from a frontend-direct Supabase app to a monorepo full-stack architecture:

```txt
React frontend -> Express API -> Prisma -> Neon Postgres
```

The stable deployed app still lives on the Supabase-based implementation, while the active migration work happens on `migration/express-prisma-neon`.

## Current Status

- `apps/frontend` contains the existing React application
- `apps/backend` contains the new Express/Prisma backend scaffold
- Prisma and the backend runtime are configured to use `apps/backend/.env`
- Prisma migration history is checked into the backend workspace
- backend auth routes currently implemented:
  - `POST /api/auth/signup`
  - `GET /api/auth/verify-email`
  - `POST /api/auth/login`
  - `POST /api/auth/demo-login`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/logout`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
- backend applications CRUD is protected by bearer-token auth and scoped to the authenticated user
- backend demo reset is implemented at `POST /api/applications/demo-reset`
- frontend auth is wired to Firebase Authentication for real users
- frontend applications CRUD is wired to the backend applications API
- frontend and backend automated test suites are in place

The migration is not complete yet. Current behavior:

- signup creates a Firebase-authenticated user and sends a Firebase-managed verification email
- verified users sign in through Firebase and call the Express API with Firebase ID tokens
- demo login works through `POST /api/auth/demo-login`
- frontend auth state restores through Firebase client persistence for real users and `/api/auth/refresh` for demo users
- frontend application list/create/update/delete now use the protected backend API
- demo reset works through `POST /api/applications/demo-reset`
- expired demo users are cleaned up hourly while the backend process is running
- backend CORS is enabled for credentialed frontend requests using `FRONTEND_URL`
- forgot-password and email verification are handled by Firebase-managed email actions
- backend middleware verifies Firebase ID tokens and upserts Prisma users by `firebaseUid`
- Supabase is no longer required by the active frontend/backend auth flow
- deployment verification and the AGENTS merge checklist are complete pending branch merge into `main`

Use [backend-migration-plan.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/backend-migration-plan.md) as the target architecture, not as a claim that all milestones listed there are already complete.

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

### Backend Migration Target

- Express
- TypeScript
- Prisma
- Neon Postgres
- Firebase Admin SDK
- Zod
- bcrypt
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

Core backend variables:

```env
DATABASE_URL=your-neon-connection-string
JWT_SECRET=replace-this-with-a-real-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

These are the production-required backend variables. Local development typically uses the localhost URL defaults shown above.

Optional backend auth tuning variables:

```env
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=7
PASSWORD_RESET_TOKEN_TTL_MINUTES=60
VERIFY_EMAIL_TOKEN_TTL_MINUTES=1440
FRONTEND_RESET_PASSWORD_URL=http://localhost:5173/reset-password
FRONTEND_VERIFY_EMAIL_URL=http://localhost:5173/verify-email
BACKEND_URL=http://localhost:4000
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=Job Application Tracker <your-email@gmail.com>
PASSWORD_RESET_EMAIL_SUBJECT=Reset your Job Application Tracker password
VERIFY_EMAIL_SUBJECT=Verify your Job Application Tracker email
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

The backend test suite uses `Vitest` plus `Supertest` and mocks Prisma and email delivery instead of connecting to Neon or Gmail.
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
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `EMAIL_FROM` are temporary legacy settings kept only while the old backend-owned auth routes still exist
- `FRONTEND_RESET_PASSWORD_URL` should point at the frontend reset page that receives the Firebase `oobCode` query parameter for the real-user flow
- `FRONTEND_VERIFY_EMAIL_URL` is the frontend page that receives verification results if the legacy backend flow is still used
- `BACKEND_URL` is still used by legacy backend-owned email flows and deployed-link generation
- `COOKIE_DOMAIN` is optional and can be used in production if your frontend and backend must share a parent cookie domain

In production, the backend fails fast if `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, or `FIREBASE_PRIVATE_KEY` is missing.

## Deployment Targets

The migration target is:

- frontend deployed from `apps/frontend` to Vercel
- backend deployed from the monorepo to Render using [render.yaml](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/render.yaml:1)

Files added for deployment wiring:

- [apps/frontend/vercel.json](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/apps/frontend/vercel.json:1) adds SPA rewrites for the Vercel frontend
- [render.yaml](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/render.yaml:1) defines the backend service blueprint and production env keys

The old GitHub Pages deployment workflow has been removed from this branch because GitHub Pages is not the deployment target for the migrated stack.

## Staging Deployment Flow

Use [docs/staging-deployment-runbook.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/staging-deployment-runbook.md:1) as the source of truth for the first staged deployment.

Required deployment order:

1. Provision Neon staging database
2. Apply Prisma migrations manually with `pnpm --filter backend exec prisma migrate deploy`
3. Deploy the Render backend
4. Deploy the Vercel frontend with `VITE_API_BASE_URL` pointed at the deployed backend API and `VITE_APP_BASE_URL` pointed at the deployed frontend origin
5. Run the full staging verification checklist

Provider-specific environment contract:

- Vercel frontend:
  - `VITE_API_BASE_URL`
  - `VITE_APP_BASE_URL`
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- Render backend:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `BACKEND_URL`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - `FRONTEND_RESET_PASSWORD_URL`
  - `FRONTEND_VERIFY_EMAIL_URL`
  - optional `COOKIE_DOMAIN`
  - legacy-only if you still exercise backend-owned email routes: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM`

Staging URL topology:

- `FRONTEND_URL` should be the Vercel frontend origin
- `BACKEND_URL` should be the Render backend origin
- `FRONTEND_RESET_PASSWORD_URL` and `FRONTEND_VERIFY_EMAIL_URL` should point to the deployed frontend pages
- Leave `COOKIE_DOMAIN` unset unless you intentionally deploy both apps under a shared parent domain
- Add the deployed frontend origin to Firebase Authentication authorized domains before verifying signup/reset flows

Operational expectations:

- `render.yaml` intentionally builds and starts the backend only; it does not run Prisma migrations automatically for the first deploy
- Render health checks should use `GET /ready`
- `GET /health` remains a process health endpoint, not a database readiness endpoint
- Cross-origin demo auth in production depends on `HttpOnly`, `Secure`, `SameSite=None` cookies and a working `POST /api/auth/refresh` flow after a browser reload
- No staged runtime path should depend on Supabase

## Migration Verification

Use [docs/migration-verification-checklist.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/migration-verification-checklist.md:1) to record the final AGENTS merge checks before merging this branch into `main`.

## Database State

The current Prisma schema includes these models:

- `User`
- `Application`
- `RefreshToken`
- `PasswordResetToken`
- `EmailVerificationToken`
- `ApplicationStatus`

Migrations currently live at:

```txt
apps/backend/prisma/migrations/20260528120000_init/migration.sql
apps/backend/prisma/migrations/20260607000100_add_firebase_uid_to_user/migration.sql
```

## Notes

- The current production deployment should not be switched to the new backend until the migration is complete and manually verified.
- For the implementation roadmap, use [backend-migration-plan.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/backend-migration-plan.md).
- The backend still uses `JWT_SECRET` for demo-session tokens and falls back to a development-only default if it is missing. Do not rely on that fallback outside local development.
- In production, refresh cookies are configured as `SameSite=None` and `Secure=true` for cross-origin frontend/backend deployments.

## Author

Built by ReySlash.
