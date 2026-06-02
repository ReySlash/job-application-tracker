# Migration Verification Checklist

Use this checklist before merging `migration/express-prisma-neon` into `main`.

## Automated Checks

- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test`
- [x] `pnpm test:coverage`

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

- [ ] Frontend deploy works on Vercel
- [ ] Backend deploy works on Render
- [ ] `VITE_API_BASE_URL` points to the deployed backend API
- [ ] Cross-origin refresh cookie works in the browser
- [ ] Email verification works against deployed frontend/backend URLs
- [ ] Password reset works against deployed frontend/backend URLs
- [ ] No deployed runtime path depends on Supabase

## Signoff

- Date:
- Verified by:
- Notes: Automated checks verified locally on the migration branch. Local and deployed manual checks remain pending.
