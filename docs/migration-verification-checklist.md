# Oracle Deployment Verification Checklist

Use this checklist as the deployed-state verification record for the Oracle-hosted backend on `migration/express-prisma-neon`.

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

- [x] Neon production database is provisioned
- [x] Prisma production migrations were applied manually with `pnpm --filter backend exec prisma migrate deploy`
- [x] Frontend deploy works on Vercel
- [x] Backend deploy works on the Oracle Cloud VPS
- [x] `VITE_API_BASE_URL` points to `https://job-tracker-api.reyslash.com/api`
- [x] Firebase frontend env vars are configured on Vercel
- [x] Firebase Admin env vars are configured for the backend container on the Oracle VM
- [x] Firebase authorized domains include the deployed frontend origin
- [x] Firebase email verification works against deployed frontend/backend URLs
- [x] Firebase password reset works against deployed frontend/backend URLs
- [x] Firebase ID token auth works against deployed backend routes
- [x] Demo refresh cookie works in the browser
- [x] Demo refresh cookie is `HttpOnly`, `Secure`, and `SameSite=None`
- [x] Host Nginx proxies `/api`, `/health`, and `/ready` to the Dockerized backend
- [x] Certbot issues a valid certificate for `job-tracker-api.reyslash.com`
- [x] `GET /ready` passes on `https://job-tracker-api.reyslash.com/ready`
- [x] Neon database connectivity is confirmed from the Oracle-hosted backend during manual verification
- [x] No deployed runtime path depends on Supabase

## Signoff

- Date: 2026-07-02
- Verified by: ReySlash
- Notes: Oracle is the current backend deployment state. Use [deployment.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/deployment.md:1) for first-time VPS setup, [production-operations-runbook.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/production-operations-runbook.md:1) for current Oracle deploy/redeploy operations, and [oracle-vps-deployment-runbook.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/oracle-vps-deployment-runbook.md:1) for the infrastructure and backend deployment contract.
