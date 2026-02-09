# Deployment Guide

This guide covers deploying your monorepo to various platforms.

## Table of Contents

1. [Heroku](#heroku)
2. [Dokku](#dokku)
3. [Docker](#docker)
4. [Vercel + Railway](#vercel--railway)

---

## Heroku

### Prerequisites

- Heroku CLI installed
- Git repository initialized

### Backend Deployment

```bash
# Login to Heroku
heroku login

# Create app for backend
heroku create your-app-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini -a your-app-api

# Set buildpacks
heroku buildpacks:set heroku/nodejs -a your-app-api

# Configure environment variables
heroku config:set -a your-app-api \
  NODE_ENV=production \
  BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  BETTER_AUTH_URL="https://your-app-api.herokuapp.com" \
  FRONTEND_URL="https://your-app-web.herokuapp.com"

# Add package.json scripts for Heroku
# In root package.json, add:
# "heroku-postbuild": "pnpm --filter @repo/shared build && pnpm --filter @repo/database build && pnpm --filter api build"

# Deploy
git push heroku main

# Run migrations
heroku run -a your-app-api -- pnpm --filter @repo/database db:migrate
```

### Frontend Deployment

```bash
# Create app for frontend
heroku create your-app-web

# Set buildpacks
heroku buildpacks:set heroku/nodejs -a your-app-web

# Configure environment variables
heroku config:set -a your-app-web \
  NEXT_PUBLIC_API_URL="https://your-app-api.herokuapp.com" \
  BETTER_AUTH_URL="https://your-app-api.herokuapp.com" \
  BETTER_AUTH_SECRET="<same-secret-as-backend>"

# Deploy
git push heroku main
```

---

## Dokku

### Prerequisites

- Dokku server set up
- SSH access to server

### Backend Deployment

```bash
# On your Dokku server
dokku apps:create api

# Create and link PostgreSQL
dokku postgres:create api-db
dokku postgres:link api-db api

# Set environment variables
dokku config:set api \
  NODE_ENV=production \
  BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  BETTER_AUTH_URL="https://api.yourdomain.com" \
  FRONTEND_URL="https://web.yourdomain.com"

# On your local machine
git remote add dokku dokku@yourserver.com:api
git push dokku main

# Run migrations (on server)
dokku run api pnpm --filter @repo/database db:migrate
```

### Frontend Deployment

```bash
# On your Dokku server
dokku apps:create web

# Set environment variables
dokku config:set web \
  NEXT_PUBLIC_API_URL="https://api.yourdomain.com" \
  BETTER_AUTH_URL="https://api.yourdomain.com" \
  BETTER_AUTH_SECRET="<same-as-backend>"

# On your local machine
git remote add dokku-web dokku@yourserver.com:web
git push dokku-web main
```

---

## Docker

### Local Docker Deployment

```bash
# Generate secret
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" > .env

# Build and run with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec api pnpm --filter @repo/database db:migrate

# View logs
docker-compose logs -f
```

### Production Docker

```bash
# Build images
docker build -f apps/api/Dockerfile -t registry.example.com/api:latest .
docker build -f apps/web/Dockerfile -t registry.example.com/web:latest .

# Push to registry
docker push registry.example.com/api:latest
docker push registry.example.com/web:latest

# Deploy to your container orchestration platform
```

---

## Vercel + Railway

### Backend on Railway

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub repo
3. Add PostgreSQL database
4. Configure environment variables:
   ```
   NODE_ENV=production
   BETTER_AUTH_SECRET=<generate-secret>
   BETTER_AUTH_URL=https://<your-railway-domain>
   FRONTEND_URL=https://<your-vercel-domain>
   DATABASE_URL=<auto-populated-by-railway>
   ```
5. Set build command: `pnpm --filter @repo/shared build && pnpm --filter @repo/database build && pnpm --filter api build`
6. Set start command: `node apps/api/dist/server.js`
7. Deploy

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your repository
3. Set framework preset to: Next.js
4. Set root directory: `apps/web`
5. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://<your-railway-domain>
   BETTER_AUTH_URL=https://<your-railway-domain>
   BETTER_AUTH_SECRET=<same-as-backend>
   ```
6. Add build settings:
   - Build command: `cd ../.. && pnpm install && pnpm --filter @repo/shared build && cd apps/web && pnpm build`
   - Output directory: `.next`
7. Deploy

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` - Random 32+ character string
- [ ] `BETTER_AUTH_URL` - Backend URL
- [ ] `FRONTEND_URL` - Frontend URL for CORS
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Port to run on (optional, default 3001)

### Frontend (.env)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `BETTER_AUTH_URL` - Backend URL (same as backend's BETTER_AUTH_URL)
- [ ] `BETTER_AUTH_SECRET` - Same secret as backend

---

## Post-Deployment

### Run Database Migrations

After first deployment, run migrations:

```bash
# Heroku
heroku run -a your-app-api -- pnpm --filter @repo/database db:migrate

# Dokku
dokku run api pnpm --filter @repo/database db:migrate

# Docker
docker-compose exec api pnpm --filter @repo/database db:migrate

# Railway (use Railway CLI)
railway run pnpm --filter @repo/database db:migrate
```

### Health Checks

Verify deployments:

```bash
# Backend health
curl https://your-backend-url/health

# Frontend
curl https://your-frontend-url
```

### Common Issues

**CORS Errors**
- Verify `FRONTEND_URL` in backend matches actual frontend URL
- Check `BETTER_AUTH_URL` in both apps

**Database Connection**
- Ensure `DATABASE_URL` is correct
- Check database is accessible from your deployment
- Verify SSL settings if required

**Build Failures**
- Ensure all shared packages are built before apps
- Check Node.js version (requires 20+)
- Verify pnpm version (requires 9+)

**Authentication Issues**
- Ensure `BETTER_AUTH_SECRET` is the same in both apps
- Check that URLs are correct (https in production)
- Verify cookies are allowed (secure: true in production)

---

## Scaling

### Horizontal Scaling

Both apps are stateless and can be horizontally scaled:

```bash
# Heroku
heroku ps:scale web=3 -a your-app-api

# Docker
docker-compose up -d --scale api=3 --scale web=3
```

### Database Scaling

Consider:
- Connection pooling (already configured in Drizzle)
- Read replicas for heavy read workloads
- Database query optimization

---

## Monitoring

### Recommended Tools

- **APM**: New Relic, DataDog, or Sentry
- **Logging**: LogDNA, Papertrail, or built-in platform logs
- **Uptime**: UptimeRobot, Pingdom

### Health Endpoints

- Backend: `GET /health`
- Database: Check via Drizzle Studio or direct connection

---

## Backup

### Database Backups

```bash
# Heroku
heroku pg:backups:capture -a your-app-api
heroku pg:backups:download -a your-app-api

# Manual backup
pg_dump $DATABASE_URL > backup.sql
```

---

For more help, see the main [README.md](./README.md) or open an issue.
