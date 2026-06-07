# Migration Verification Checklist

Use this checklist before merging `migration/express-prisma-neon` into `main`.

## Automated Checks

- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test`
- [x] `pnpm test:coverage`
- [x] Re-run `pnpm test` outside the sandbox if backend `supertest` fails with `listen EPERM`
- [x] Re-run `pnpm test:coverage` outside the sandbox if backend `supertest` fails with `listen EPERM`

## Local Manual Checks

- [x] Signup creates an unverified account
- [x] Verification email arrives and the link completes successfully
- [x] Verified user login works
- [x] Logout works
- [x] Refresh after page reload works
- [x] Protected routes reject unauthenticated access
- [x] Application create/list/get/update/delete works
- [x] User A cannot access user B application IDs
- [x] Demo login works
- [x] Demo reset works
- [x] Forgot-password and reset-password work end to end
- [x] Neon database connection works from the running backend

## Deployment Checks

- [x] Neon staging database is provisioned
- [x] Prisma production migrations were applied manually with `pnpm --filter backend exec prisma migrate deploy`
- [x] Frontend deploy works on Vercel
- [x] Backend deploy works on Render
- [x] `VITE_API_BASE_URL` points to the deployed backend API
- [x] Firebase frontend env vars are configured on Vercel
- [x] Firebase Admin env vars are configured on Render
- [x] Firebase authorized domains include the deployed frontend origin
- [x] Firebase email verification works against deployed frontend/backend URLs
- [x] Firebase password reset works against deployed frontend/backend URLs
- [x] Firebase ID token auth works against deployed backend routes
- [x] Demo refresh cookie works in the browser
- [x] Demo refresh cookie is `HttpOnly`, `Secure`, and `SameSite=None`
- [x] `GET /ready` passes on Render
- [x] Neon database connectivity is confirmed from the deployed backend during manual verification
- [x] No deployed runtime path depends on Supabase

## Signoff

- Date: 2026-06-07
- Verified by: ReySlash
- Notes: Use [staging-deployment-runbook.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/staging-deployment-runbook.md:1) for deploy order, env setup, and manual migration instructions.
