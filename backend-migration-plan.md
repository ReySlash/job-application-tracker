# Migration Plan: Supabase -> Express API + Prisma + Neon Postgres

## Progress Notes

Current backend state on `migration/express-prisma-neon`:

- `POST /api/auth/signup` returns `user + accessToken`, stores a hashed refresh token, and sets the raw refresh token in an `httpOnly` cookie
- `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, and `GET /api/auth/me` are implemented
- auth middleware is implemented and the applications router is protected by bearer access tokens
- application CRUD is server-side scoped to the authenticated user
- frontend auth is cut over to the backend auth API
- frontend application CRUD is cut over to the backend applications API
- the remaining direct Supabase dependencies are password reset, demo login, and demo reset

These notes are a checkpoint only. The milestone sections below still describe the intended end state, and some items listed there are not complete yet.

## Goal

Migrate the project from a frontend-direct Supabase app to a conventional fullstack architecture:

Current architecture:

    React frontend
      -> Supabase client
      -> Supabase Auth + Supabase Database

Target architecture:

    React frontend
      -> Express API
      -> Prisma
      -> Neon Postgres

The frontend should no longer talk to Supabase directly. It should only communicate with the custom Express API.

The migration should preserve the current product behavior while replacing the backend/auth/data layer.

---

## Core Principles

Follow these rules throughout the migration:

- Do not redesign the UI during this migration.
- Do not add new product features during the migration.
- Keep existing frontend routes and screens as much as possible.
- Replace Supabase auth and data access with backend API calls.
- The backend must derive `userId` from auth middleware, never from the frontend.
- The frontend must never send `userId` when creating/updating applications.
- All application queries must be scoped server-side to the authenticated user.
- Demo mode must be implemented explicitly in the backend.
- Do not build everything at once. Complete and verify one milestone before moving to the next.
- Defer password reset, email verification, scheduled jobs, shared packages, and advanced token rotation until the core migration works.

The first success condition is:

    A user can sign up, log in, stay logged in after refresh, create applications,
    edit applications, delete applications, use demo login, and use demo reset
    without Supabase.

---

# Milestone 1 - Monorepo Setup

Restructure the project into a monorepo:

    job-applications-tracker/
      apps/
        frontend/
        backend/
      package.json
      README.md

Do not create `packages/shared` yet.

Reason:

Shared packages may be useful later, but they add build and TypeScript configuration complexity. For this migration, keep the structure simple.

Root package scripts should allow running both apps together:

    {
      "scripts": {
        "dev": "concurrently \"npm run dev -w apps/backend\" \"npm run dev -w apps/frontend\"",
        "dev:frontend": "npm run dev -w apps/frontend",
        "dev:backend": "npm run dev -w apps/backend"
      }
    }

---

# Milestone 2 - Backend Foundation

Create a new backend app in:

    apps/backend

Use this stack:

    Express
    TypeScript
    Prisma
    Neon Postgres
    Zod
    bcrypt
    jsonwebtoken
    cookie-parser
    cors
    dotenv

Backend structure:

    apps/backend/src/
      app.ts
      server.ts

      config/
        env.ts

      middleware/
        authMiddleware.ts
        errorMiddleware.ts

      modules/
        auth/
          auth.routes.ts
          auth.controller.ts
          auth.service.ts
          auth.schemas.ts

        applications/
          applications.routes.ts
          applications.controller.ts
          applications.service.ts
          applications.schemas.ts

        demo/
          demo.service.ts

      lib/
        prisma.ts
        tokens.ts
        cookies.ts
        errors.ts

Responsibilities:

    routes      = URL mapping
    controller  = request/response handling
    service     = business logic
    schema      = request validation
    middleware  = shared request behavior
    lib         = reusable infrastructure utilities

Add the following backend foundation:

- Express app setup
- health endpoint: `GET /health`
- centralized environment variable loading
- Prisma client setup
- CORS setup with credentials enabled
- cookie parser
- JSON body parser
- centralized error middleware
- basic typed custom error helper

---

# Milestone 3 - Prisma + Neon Database Schema

Use Prisma as the source of truth for the new database schema.

Create these initial models:

    model User {
      id              String        @id @default(uuid())
      email           String        @unique
      passwordHash    String?
      isDemo          Boolean       @default(false)
      isEmailVerified Boolean       @default(false)
      createdAt       DateTime      @default(now())
      updatedAt       DateTime      @updatedAt

      applications    Application[]
      refreshTokens   RefreshToken[]
    }

    model Application {
      id        String            @id @default(uuid())
      company   String
      role      String
      status    ApplicationStatus
      appliedAt DateTime?
      location  String?
      jobUrl    String?
      notes     String?

      userId    String
      user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)

      createdAt DateTime          @default(now())
      updatedAt DateTime          @updatedAt

      @@index([userId])
    }

    model RefreshToken {
      id        String    @id @default(uuid())
      tokenHash String
      userId    String
      user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

      expiresAt DateTime
      revokedAt DateTime?
      createdAt DateTime  @default(now())

      @@index([userId])
      @@index([tokenHash])
    }

    enum ApplicationStatus {
      SAVED
      APPLIED
      INTERVIEWING
      OFFER
      REJECTED
    }

Schema rules:

- `email` should be required and unique.
- Demo users should use fake unique emails like `demo-<uuid>@demo.local`.
- `passwordHash` can be nullable because demo users may not need passwords.
- `Application.status` must use an enum, not arbitrary strings.
- `Application.userId` must cascade delete when the user is deleted.
- Store only hashed refresh tokens in the database.
- Never store raw refresh tokens.

Do not create password reset or email verification token tables yet. Add those later after the core migration works.

---

# Milestone 4 - Auth API

Implement these auth routes first:

    POST /auth/signup
    POST /auth/login
    POST /auth/logout
    POST /auth/refresh
    GET  /auth/me
    POST /auth/demo-login

Do not implement password reset yet.

## Auth Model

Use this model:

    Access token:
    - short-lived
    - returned in JSON
    - stored in frontend memory only

    Refresh token:
    - longer-lived
    - stored in an httpOnly cookie
    - never readable by frontend JavaScript
    - hashed before storing in the database

Recommended expiry:

    Access token: 15 minutes
    Refresh token: 7 days

## Signup Behavior

    1. Validate email/password with Zod.
    2. Check whether email already exists.
    3. Hash password with bcrypt.
    4. Create user.
    5. Generate access token.
    6. Generate refresh token.
    7. Hash refresh token.
    8. Store hashed refresh token in database.
    9. Set raw refresh token in httpOnly cookie.
    10. Return user DTO + access token.

## Login Behavior

    1. Validate email/password with Zod.
    2. Find user by email.
    3. Reject if user does not exist.
    4. Reject if user has no passwordHash.
    5. Compare password with bcrypt.
    6. Generate access token.
    7. Generate refresh token.
    8. Hash refresh token.
    9. Store hashed refresh token in database.
    10. Set raw refresh token in httpOnly cookie.
    11. Return user DTO + access token.

## Refresh Behavior

    1. Read refresh token from cookie.
    2. Reject if missing.
    3. Hash token.
    4. Find valid, unrevoked refresh token in database.
    5. Check expiry.
    6. Find associated user.
    7. Return new access token + user DTO.

For v1, refresh token rotation is optional. Prefer simple and correct over complex and fragile.

## Logout Behavior

    1. Read refresh token from cookie.
    2. If present, hash token.
    3. Revoke matching refresh token in database if found.
    4. Clear refresh cookie.
    5. Return success.

Logout should succeed even if the cookie is missing.

## Me Behavior

    1. Require valid access token.
    2. Use auth middleware to identify current user.
    3. Return current user DTO.

Recommended user DTO:

    {
      id: string;
      email: string;
      isDemo: boolean;
      isEmailVerified: boolean;
    }

Do not return `passwordHash`.

---

# Milestone 5 - Token, Cookie, and CORS Setup

Create utility files for token and cookie behavior:

    src/lib/tokens.ts
    src/lib/cookies.ts

Cookie config should differ by environment.

Local development cookie config:

    {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }

Production cookie config:

    {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    }

Frontend requests that rely on cookies must use:

    credentials: "include"

Backend CORS must allow credentials:

    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    })

Do not use this with cookies:

    cors({
      origin: "*",
      credentials: true
    })

That is wrong for credentialed requests.

Required backend environment variables:

    DATABASE_URL=
    JWT_ACCESS_SECRET=
    JWT_REFRESH_SECRET=
    FRONTEND_URL=
    NODE_ENV=
    COOKIE_SECURE=
    COOKIE_SAME_SITE=

Development defaults:

    FRONTEND_URL=http://localhost:5173
    NODE_ENV=development
    COOKIE_SECURE=false
    COOKIE_SAME_SITE=lax

Production defaults:

    NODE_ENV=production
    COOKIE_SECURE=true
    COOKIE_SAME_SITE=none

---

# Milestone 6 - Auth Middleware

Create `authMiddleware.ts`.

The middleware should:

    1. Read the Authorization header.
    2. Expect Bearer token format.
    3. Verify the access token.
    4. Attach the authenticated user info to the request.
    5. Reject missing, invalid, or expired tokens.

Expected header:

    Authorization: Bearer <accessToken>

The middleware should make `req.user.id` available to protected routes.

Important:

The backend must use `req.user.id` as the source of truth for ownership.

Never trust a `userId` from the frontend.

---

# Milestone 7 - Protected Applications API

Implement these routes:

    GET    /applications
    POST   /applications
    GET    /applications/:id
    PATCH  /applications/:id
    DELETE /applications/:id
    POST   /applications/demo-reset

All application routes require auth.

Application DTO:

    {
      id: string;
      company: string;
      role: string;
      status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
      appliedAt: string | null;
      location: string | null;
      jobUrl: string | null;
      notes: string | null;
      createdAt: string;
      updatedAt: string;
    }

## Create Application

Frontend sends only business fields:

    {
      company,
      role,
      status,
      appliedAt,
      location,
      jobUrl,
      notes
    }

Backend creates with ownership from auth middleware:

    await prisma.application.create({
      data: {
        ...validatedData,
        userId: req.user.id
      }
    })

## List Applications

Always scope by authenticated user:

    await prisma.application.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

## Get One Application

Do not fetch by `id` alone.

Correct behavior:

    Find application where:
    - id = route param
    - userId = req.user.id

If not found, return 404.

## Update Application

Do not update by `id` alone.

Correct behavior:

    Update only if:
    - id = route param
    - userId = req.user.id

If the application does not belong to the current user, return 404.

## Delete Application

Do not delete by `id` alone.

Correct behavior:

    Delete only if:
    - id = route param
    - userId = req.user.id

If the application does not belong to the current user, return 404.

Use Zod validation for create and update payloads.

Do not allow arbitrary status strings.

---

# Milestone 8 - Demo Mode

Demo mode stays in v1 because it is important for the portfolio experience.

Implement:

    POST /auth/demo-login
    POST /applications/demo-reset

Demo users are real users with:

    isDemo = true

## Demo Login Behavior

    1. Opportunistically delete demo users older than 24 hours.
    2. Create a new demo user.
    3. Use fake unique email: demo-<uuid>@demo.local.
    4. Set isDemo = true.
    5. Seed canonical demo applications.
    6. Generate access token.
    7. Generate refresh token.
    8. Store hashed refresh token.
    9. Set refresh token cookie.
    10. Return user DTO + access token.

Do not add a production cron job yet.

Use opportunistic cleanup during demo login:

    When someone starts a demo session,
    delete old demo users first.

This is simpler than scheduled cleanup and good enough for v1.

## Demo Reset Behavior

Rules:

    - Only users with isDemo = true can call this route.
    - Real users must be rejected.
    - Delete only the current demo user's applications.
    - Reseed canonical demo applications.
    - Return the fresh applications list.

Do not allow demo reset to affect other users.

---

# Milestone 9 - Frontend API Migration

The frontend migration should happen mostly in the API/auth layer, not across every component.

Remove:

    @supabase/supabase-js
    src/lib/supabase.ts
    Supabase Session/User assumptions
    Supabase password recovery hash handling

Add or rewrite:

    src/lib/http.ts
    src/api/auth.ts
    src/api/applications.ts
    src/context/AuthContext.tsx

Frontend environment variable:

    VITE_API_BASE_URL=http://localhost:4000

Basic HTTP helper:

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    export async function apiFetch<T>(
      path: string,
      options: RequestInit = {}
    ): Promise<T> {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      return res.json();
    }

Later improve error parsing. First make the migration work.

---

# Milestone 10 - Frontend Auth State

Use this frontend auth shape:

    type AuthUser = {
      id: string;
      email: string;
      isDemo: boolean;
      isEmailVerified: boolean;
    };

    type AuthState = {
      user: AuthUser | null;
      accessToken: string | null;
      isLoading: boolean;
    };

## App Boot Behavior

On app boot:

    1. Call POST /auth/refresh.
    2. If success, store access token + user.
    3. If failure, treat user as unauthenticated.
    4. Finish loading state.

Do not call Supabase.

## Login Behavior

After login:

    1. Call POST /auth/login.
    2. Receive user DTO + access token.
    3. Store access token in memory.
    4. Store user in auth context.
    5. Redirect to dashboard.

## Signup Behavior

After signup:

    1. Call POST /auth/signup.
    2. Receive user DTO + access token.
    3. Store access token in memory.
    4. Store user in auth context.
    5. Redirect to dashboard.

## Demo Login Behavior

After demo login:

    1. Call POST /auth/demo-login.
    2. Receive demo user DTO + access token.
    3. Store access token in memory.
    4. Store user in auth context.
    5. Redirect to dashboard.

## Logout Behavior

On logout:

    1. Call POST /auth/logout.
    2. Clear auth context.
    3. Clear access token from memory.
    4. Redirect to login or home page.

## Authenticated API Requests

Authenticated requests should include:

    Authorization: Bearer <accessToken>

Requests that rely on refresh cookies should include:

    credentials: "include"

Do not store access tokens in localStorage for this version.

Do not store refresh tokens in localStorage ever.

---

# Milestone 11 - Frontend Applications Migration

Replace Supabase application calls with HTTP calls to the Express API.

Application API file should use routes:

    GET    /applications
    POST   /applications
    GET    /applications/:id
    PATCH  /applications/:id
    DELETE /applications/:id
    POST   /applications/demo-reset

When creating an application, frontend should send:

    {
      company,
      role,
      status,
      appliedAt,
      location,
      jobUrl,
      notes
    }

The frontend must not send:

    userId

React Query can stay as the server-state layer.

Keep existing UI components as much as possible.

Only change the data source.

---

# Milestone 12 - Deployment

Move the frontend off GitHub Pages.

Use these deployment defaults:

    Frontend: Vercel
    Backend: Render
    Database: Neon

Do not optimize the architecture around GitHub Pages.

## Frontend Production Env

    VITE_API_BASE_URL=https://your-api.onrender.com

## Backend Production Env

    DATABASE_URL=
    JWT_ACCESS_SECRET=
    JWT_REFRESH_SECRET=
    FRONTEND_URL=https://your-frontend.vercel.app
    NODE_ENV=production
    COOKIE_SECURE=true
    COOKIE_SAME_SITE=none

CORS in production must use the real frontend origin:

    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    })

Cookie behavior in production:

    httpOnly: true
    secure: true
    sameSite: "none"

Cookie behavior in local development:

    httpOnly: true
    secure: false
    sameSite: "lax"

---

# Milestone 13 - Minimum Testing

Do not start with a huge test suite.

Start with high-value backend tests.

## Minimum Auth Tests

    - signup creates user
    - signup rejects duplicate email
    - login works with correct password
    - login rejects bad password
    - refresh works with valid cookie
    - logout revokes refresh token
    - /auth/me rejects unauthenticated user
    - /auth/me returns current user when authenticated

## Minimum Application Tests

    - unauthenticated user cannot access applications
    - authenticated user can create application
    - user only sees their own applications
    - user cannot get another user's application
    - user cannot update another user's application
    - user cannot delete another user's application
    - invalid status is rejected
    - malformed payload is rejected

## Minimum Demo Tests

    - demo login creates demo user
    - demo login creates sample applications
    - demo reset only works for demo users
    - demo reset rejects real users
    - demo reset reseeds only the current demo user's applications

## Manual Verification Before Deployment

Manually verify:

    - signup
    - logout
    - login
    - refresh after page reload
    - create application
    - edit application
    - delete application
    - demo login
    - demo reset

---

# Later Work After Core Migration Works

Only after auth, CRUD, demo mode, frontend migration, and deployment work, add:

    - password reset email flow
    - email verification
    - refresh token rotation hardening
    - scheduled demo cleanup
    - packages/shared for shared types or schemas
    - broader frontend integration tests
    - stronger API error handling
    - improved README architecture documentation

## Later Password Reset Flow

Add these routes later:

    POST /auth/forgot-password
    POST /auth/reset-password

Add this model later:

    model PasswordResetToken {
      id        String    @id @default(uuid())
      tokenHash String
      userId    String
      user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

      expiresAt DateTime
      usedAt    DateTime?
      createdAt DateTime  @default(now())

      @@index([tokenHash])
      @@index([userId])
    }

Password reset rules:

    - forgot-password always returns generic success
    - if email exists, create reset token and send email
    - do not reveal whether the account exists
    - reset-password validates token
    - reset-password checks expiry
    - reset-password checks token has not been used
    - reset-password updates password
    - reset-password marks token as used
    - reset-password revokes existing refresh tokens

Use an email provider later, such as Resend.

Do not block the core migration on password reset.

---

# Final Implementation Order

Follow this order exactly:

    1. Move repo into monorepo structure.
    2. Scaffold Express backend.
    3. Add Prisma + Neon connection.
    4. Create User, Application, RefreshToken schema.
    5. Implement signup/login/logout/refresh/me.
    6. Implement auth middleware.
    7. Implement protected applications CRUD.
    8. Test backend manually with Postman, Insomnia, or Thunder Client.
    9. Replace frontend Supabase auth with API auth.
    10. Replace frontend Supabase application calls with HTTP API calls.
    11. Implement demo-login.
    12. Implement demo-reset.
    13. Deploy backend to Render.
    14. Deploy frontend to Vercel.
    15. Fix production CORS/cookie issues.
    16. Add password reset.
    17. Add tests, docs, and polish.

---

# Important Constraint

Do not implement everything at once.

Build one milestone, verify it, then continue.

The migration is successful when the app works end-to-end without Supabase:

    - user signup works
    - user login works
    - logout works
    - refresh after reload works
    - protected routes work
    - application CRUD works
    - users cannot access each other's applications
    - demo login works
    - demo reset works
    - frontend is deployed off GitHub Pages
    - backend is deployed
    - Neon database is connected

Everything else comes after that.
