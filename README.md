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
- Protected dashboard and application routes
- Private per-user application records
- Create, read, update, and delete applications
- Search, filtering, and sorting
- Dashboard metrics and lightweight charts
- Responsive desktop and mobile layouts
- Light and dark mode
- Skeleton loading states

## Supabase Setup

This app expects a Supabase project with email/password auth enabled and the private `applications` schema from `supabase/migrations`.

1. Create a Supabase project.

2. In Supabase, enable email/password authentication:

   Authentication -> Providers -> Email

3. Apply the database migration:

   - Open the SQL file in `supabase/migrations`.
   - Copy the contents of `20260419000000_create_private_applications_schema.sql`.
   - Run it in the Supabase SQL Editor.

The migration creates the `applications` table, enables Row Level Security, and adds policies so authenticated users can only access their own application records.

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

Update `.env` with your Supabase project URL and anon key, then apply the migration in the Supabase SQL Editor.

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
