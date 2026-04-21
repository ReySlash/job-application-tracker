# Job Application Tracker

A React and Supabase app for managing private job applications, tracking progress, and reviewing job-search activity from a dashboard.

## Overview

Job Application Tracker helps users organize their job search in one place instead of relying on spreadsheets, notes, or scattered links.

Users can:

- create job applications
- review applications in a searchable, sortable list
- update existing records
- delete applications
- track dashboard metrics and status breakdowns
- keep their data private with Supabase Auth and Row Level Security

This project is part of my portfolio and learning journey as I build real-world CRUD-style applications with scalable frontend architecture.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Supabase Auth and Postgres
- Tailwind CSS
- React Hook Form
- Zod

## Features

- Email/password authentication
- Password reset by email
- One-click anonymous demo mode
- Protected dashboard and application routes
- Private per-user application records
- Create, read, update, and delete applications
- Search, filtering, and sorting
- Dashboard metrics and lightweight charts
- Responsive desktop and mobile layouts
- Light and dark mode
- Skeleton loading states

## Supabase Setup

This app expects a Supabase project with email/password auth, password recovery, anonymous sign-ins, Supabase Cron, and the private `applications` schema from `supabase/migrations`.

1. Create a Supabase project.

2. In Supabase, enable email/password authentication and password recovery:

   Authentication -> Providers -> Email

   Make sure password recovery is enabled for the Email provider.

3. Enable anonymous sign-ins for the portfolio demo:

   Authentication -> Providers -> Anonymous Sign-Ins

4. Enable Supabase Cron for automatic demo cleanup:

   Integrations -> Cron

5. Apply the database migrations in order:

   - Open each SQL file in `supabase/migrations`.
   - Run `20260419000000_create_private_applications_schema.sql` in the Supabase SQL Editor.
   - Run `20260420000000_schedule_anonymous_demo_cleanup.sql` in the Supabase SQL Editor.

The migration creates the `applications` table, enables Row Level Security, and adds policies so authenticated users, including anonymous demo users, can only access their own application records.

### Demo User Cleanup

Anonymous demo users are useful for recruiters because they can try the app without creating an account. The cleanup migration schedules a Supabase Cron job named `cleanup-anonymous-demo-users-hourly`, which runs every hour and deletes anonymous users older than 1 hour.

Application rows are removed automatically because `applications.user_id` references `auth.users(id)` with `on delete cascade`.

You can confirm the cron job exists with:

```sql
select jobid, jobname, schedule, command, active
from cron.job
where jobname = 'cleanup-anonymous-demo-users-hourly';
```

If you need to clean up manually, run:

```sql
delete from auth.users
where is_anonymous is true
  and created_at < now() - interval '1 hour';
```

## Environment Variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then fill in your Supabase values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in Supabase:

Project Settings -> API

## Auth Redirect URLs

For password reset to work in local development and on GitHub Pages, configure these Supabase Auth settings:

- Site URL

  - Local: `http://localhost:5173`
  - GitHub Pages: `https://reyslash.github.io/job-application-tracker/`

- Additional Redirect URLs

  - `http://localhost:5173/reset-password`
  - `https://reyslash.github.io/job-application-tracker/reset-password`

Supabase uses the reset URL to return the browser to the app with a recovery token, and the app finishes the password update on the `/reset-password` route.

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/ReySlash/job-application-tracker.git
cd job-application-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Configure Supabase:

```bash
cp .env.example .env
```

Update `.env` with your Supabase project URL and anon key, enable email/password auth, password recovery, anonymous sign-ins, and Supabase Cron, then apply the migrations in the Supabase SQL Editor.

## GitHub Pages Routing

The app now builds with a `/job-application-tracker/` base path and includes a `public/404.html` fallback so direct links like `/reset-password` or `/applications/123` can resolve correctly on GitHub Pages.

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that builds the app and deploys `dist/` to GitHub Pages on every push to `main`.

Before the first deploy:

1. In GitHub, open `Settings -> Pages`.
2. Set `Source` to `GitHub Actions`.
3. In `Settings -> Secrets and variables -> Actions`, add these repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. In Supabase Auth, keep these production URLs configured:
   - Site URL: `https://reyslash.github.io/job-application-tracker/`
   - Redirect URL: `https://reyslash.github.io/job-application-tracker/reset-password`

Without those GitHub secrets, the Pages build will fail because the Vite build injects the Supabase URL and anon key at build time.

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project Structure

```bash
job-application-tracker/
├── README.md
├── package.json
├── supabase/
│   └── migrations/
├── src/
│   ├── api/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── providers/
│   ├── types/
│   └── utils/
└── ...
```

## Why This Project Matters

This project is more than a simple CRUD exercise. It is meant to practice frontend work commonly needed in real applications:

- handling user input correctly
- validating forms
- managing page navigation
- working with server state
- protecting private user data
- structuring medium-sized React projects
- polishing UI behavior for a portfolio-ready experience

## Author

Built by ReySlash.
