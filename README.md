# Job Application Tracker

Job Application Tracker is being migrated from a frontend-direct Supabase app to a monorepo full-stack architecture:

```txt
React frontend -> Express API -> Prisma -> Neon Postgres
```

The stable deployed app still lives on the Supabase-based implementation, while the active migration work happens on `migration/express-prisma-neon`.

## Current Status

- `apps/frontend` contains the existing React application
- `apps/backend` contains the new Express/Prisma backend scaffold
- Prisma is configured to use the repo-root `.env`
- Neon connectivity has been verified
- the Neon schema has been reset to the planned baseline models
- Prisma migration history has been initialized with a baseline migration
- backend auth routes currently implemented:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
- backend applications CRUD is protected by bearer-token auth and scoped to the authenticated user
- frontend auth is wired to the backend auth API
- frontend applications CRUD is wired to the backend applications API

The migration is not complete yet. Current behavior:

- signup, login, logout, refresh, and `/api/auth/me` work through the Express backend
- frontend auth state restores through `/api/auth/refresh` and stores the access token in memory
- frontend application list/create/update/delete now use the protected backend API
- backend CORS is enabled for credentialed frontend requests using `FRONTEND_URL`
- password reset is still using Supabase
- demo login and demo reset are still using Supabase-backed temporary flows
- Supabase is still present in the frontend only for those remaining non-migrated paths

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
│   │   └── src/
│   └── frontend/
│       ├── public/
│       └── src/
├── README.md
├── backend-migration-plan.md
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
└── .env
```

## Environment Variables

The repo-root `.env` is currently the source of truth for Prisma and backend database access.

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
```

Frontend environment:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Prisma is configured in `apps/backend/prisma.config.ts` to load the root `.env` explicitly.

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

## Prisma Commands

Run Prisma commands through the backend workspace package:

```bash
pnpm --filter backend exec prisma validate
pnpm --filter backend exec prisma db pull --print
pnpm --filter backend exec prisma migrate status
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate
```

## Database State

The Neon database has been aligned to the current planned Prisma schema with these models:

- `User`
- `Application`
- `RefreshToken`
- `ApplicationStatus`

A baseline migration exists at:

```txt
apps/backend/prisma/migrations/20260528120000_init/migration.sql
```

## Notes

- The old Supabase migrations still exist in the repository for historical reference.
- The current production deployment should not be switched to the new backend until the migration is complete and manually verified.
- For the implementation roadmap, use [backend-migration-plan.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/backend-migration-plan.md).
- The current login flow uses `JWT_SECRET` from the backend environment and falls back to a development-only default if it is missing. Do not rely on that fallback outside local development.
- The current frontend still depends on Supabase for password reset and demo mode until those backend endpoints are implemented.

## Author

Built by ReySlash.
