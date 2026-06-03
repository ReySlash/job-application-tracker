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
- frontend auth is wired to the backend auth API
- frontend applications CRUD is wired to the backend applications API
- frontend and backend automated test suites are in place

The migration is not complete yet. Current behavior:

- signup creates an unverified user and sends a verification email through the Express backend
- verified users can log in, log out, refresh, and access `/api/auth/me` through the Express backend
- demo login works through `POST /api/auth/demo-login`
- frontend auth state restores through `/api/auth/refresh` and stores the access token in memory
- frontend application list/create/update/delete now use the protected backend API
- demo reset works through `POST /api/applications/demo-reset`
- expired demo users are cleaned up hourly while the backend process is running
- backend CORS is enabled for credentialed frontend requests using `FRONTEND_URL`
- forgot-password always returns a generic success message and can deliver reset emails through Gmail SMTP
- reset-password validates the token, updates the password, marks outstanding reset tokens used, and revokes active refresh tokens
- email verification blocks non-demo login and refresh until the verification link is redeemed
- Supabase is no longer required by the active frontend/backend auth flow
- deployment verification and the AGENTS merge checklist are still pending manual signoff

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
- Supabase client integration for the current stable version

### Backend Migration Target

- Express
- TypeScript
- Prisma
- Neon Postgres
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

Current required variables:

```env
DATABASE_URL=your-neon-connection-string
JWT_SECRET=replace-this-with-a-real-secret
FRONTEND_URL=http://localhost:5173
```

Optional auth tuning variables:

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

## Prisma Commands

Run Prisma commands through the backend workspace package:

```bash
pnpm --filter backend exec prisma validate
pnpm --filter backend exec prisma db pull --print
pnpm --filter backend exec prisma migrate status
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate
```

## Backend Environment

Copy `apps/backend/.env.example` into `apps/backend/.env` and set the Gmail SMTP values used for password reset and verification delivery.

- `FRONTEND_URL` may be a single origin or a comma-separated list of allowed frontend origins
- `GMAIL_USER` should be the Gmail account used to authenticate with `smtp.gmail.com`
- `GMAIL_APP_PASSWORD` should be a Google app password, not your normal Gmail password
- `EMAIL_FROM` is optional and defaults to `GMAIL_USER` when omitted
- `FRONTEND_RESET_PASSWORD_URL` should point at the frontend reset page that receives the `token` query parameter
- `FRONTEND_VERIFY_EMAIL_URL` is the frontend page that receives verification results after the backend redeems the email token
- `BACKEND_URL` is the public backend base URL used inside verification emails
- `COOKIE_DOMAIN` is optional and can be used in production if your frontend and backend must share a parent cookie domain

In production, the backend fails fast if `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, `GMAIL_USER`, or `GMAIL_APP_PASSWORD` is missing.

## Deployment Targets

The migration target is:

- frontend deployed from `apps/frontend` to Vercel
- backend deployed from the monorepo to Render using [render.yaml](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/render.yaml:1)

Files added for deployment wiring:

- [apps/frontend/vercel.json](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/apps/frontend/vercel.json:1) adds SPA rewrites for the Vercel frontend
- [render.yaml](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/render.yaml:1) defines the backend service blueprint and production env keys

The old GitHub Pages deployment workflow has been removed from this branch because GitHub Pages is not the deployment target for the migrated stack.

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
```

## Notes

- The old Supabase migrations still exist in the repository for historical reference.
- The current production deployment should not be switched to the new backend until the migration is complete and manually verified.
- For the implementation roadmap, use [backend-migration-plan.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/backend-migration-plan.md).
- The current login flow uses `JWT_SECRET` from the backend environment and falls back to a development-only default if it is missing. Do not rely on that fallback outside local development.
- In production, refresh cookies are configured as `SameSite=None` and `Secure=true` for cross-origin frontend/backend deployments.
- In non-production, password reset and signup verification fall back to logging their action URLs to the backend process when Gmail delivery is not configured.

## Author

Built by ReySlash.
