# Oracle VPS Deploy Commands

These commands implement the deployment flow described in [oracle-vps-deployment-runbook.md](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/docs/oracle-vps-deployment-runbook.md:1).

For repeatable VM operations, use [scripts/deploy-backend-docker.sh](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/scripts/deploy-backend-docker.sh:1).

Assumptions:

- the repo is checked out on the Oracle VM
- the active branch is `migration/express-prisma-neon`
- backend env vars are stored in a host file such as `/opt/job-application-tracker/backend.env`
- the backend container is published only on `127.0.0.1:4000`
- the Docker env file follows [apps/backend/.env.docker.example](/Users/reynaldocarmenatearias/Documents/ReactProjects/job-application-tracker/apps/backend/.env.docker.example:1)
- Docker env-file values are unquoted; quotes are passed through as part of the value
- root `.env` and `.env.production` files are not used for the backend container

## Prisma Migration

Run this from the repo checkout before replacing the running container:

```bash
pnpm --filter backend exec prisma migrate deploy
```

## Build

```bash
docker build -f apps/backend/Dockerfile -t job-application-tracker-backend:latest .
```

Script equivalent:

```bash
scripts/deploy-backend-docker.sh build
```

## First Run

```bash
docker run -d \
  --name job-application-tracker-backend \
  --restart unless-stopped \
  --env-file /opt/job-application-tracker/backend.env \
  -p 127.0.0.1:4000:4000 \
  job-application-tracker-backend:latest
```

Script equivalent:

```bash
ENV_FILE=/opt/job-application-tracker/backend.env scripts/deploy-backend-docker.sh run
```

Do not include frontend `VITE_*` variables in the backend container env file.

## Replace

```bash
docker stop job-application-tracker-backend
docker rm job-application-tracker-backend
docker run -d \
  --name job-application-tracker-backend \
  --restart unless-stopped \
  --env-file /opt/job-application-tracker/backend.env \
  -p 127.0.0.1:4000:4000 \
  job-application-tracker-backend:latest
```

Script equivalent:

```bash
ENV_FILE=/opt/job-application-tracker/backend.env scripts/deploy-backend-docker.sh replace
```

## Logs

```bash
docker logs -f job-application-tracker-backend
```

Script equivalent:

```bash
scripts/deploy-backend-docker.sh logs
```

## Rollback

```bash
docker stop job-application-tracker-backend
docker rm job-application-tracker-backend
docker run -d \
  --name job-application-tracker-backend \
  --restart unless-stopped \
  --env-file /opt/job-application-tracker/backend.env \
  -p 127.0.0.1:4000:4000 \
  job-application-tracker-backend:<previous-tag>
```

Script equivalent:

```bash
ENV_FILE=/opt/job-application-tracker/backend.env scripts/deploy-backend-docker.sh rollback <previous-tag>
```
