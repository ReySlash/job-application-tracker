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

The backend application logic is not complete yet. The current backend work is foundational setup for the migration plan in [backend-migration-plan.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/backend-migration-plan.md).

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

Current required variable:

```env
DATABASE_URL=your-neon-connection-string
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

## Author

Built by ReySlash.
