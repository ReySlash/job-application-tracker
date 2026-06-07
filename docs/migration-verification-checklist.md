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

- [ ] Signup creates an unverified account
- [ ] Verification email arrives and the link completes successfully
- [ ] Verified user login works
- [ ] Logout works
- [ ] Refresh after page reload works
- [ ] Protected routes reject unauthenticated access
- [ ] Application create/list/get/update/delete works
- [ ] User A cannot access user B application IDs
- [ ] Demo login works
- [ ] Demo reset works
- [ ] Forgot-password and reset-password work end to end
- [ ] Neon database connection works from the running backend

## Deployment Checks

- [ ] Neon staging database is provisioned
- [ ] Prisma production migrations were applied manually with `pnpm --filter backend exec prisma migrate deploy`
- [ ] Frontend deploy works on Vercel
- [ ] Backend deploy works on Render
- [ ] `VITE_API_BASE_URL` points to the deployed backend API
- [ ] Firebase frontend env vars are configured on Vercel
- [ ] Firebase Admin env vars are configured on Render
- [ ] Firebase authorized domains include the deployed frontend origin
- [ ] Firebase email verification works against deployed frontend/backend URLs
- [ ] Firebase password reset works against deployed frontend/backend URLs
- [ ] Firebase ID token auth works against deployed backend routes
- [ ] Demo refresh cookie works in the browser
- [ ] Demo refresh cookie is `HttpOnly`, `Secure`, and `SameSite=None`
- [ ] `GET /ready` passes on Render
- [ ] Neon database connectivity is confirmed from the deployed backend during manual verification
- [ ] No deployed runtime path depends on Supabase

## Signoff

- Date:
- Verified by:
- Notes: Use [staging-deployment-runbook.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/staging-deployment-runbook.md:1) for deploy order, env setup, and manual migration instructions.
