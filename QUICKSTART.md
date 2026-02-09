# Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

## Setup Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env

# 3. Generate a secret key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy the output and use it as BETTER_AUTH_SECRET in both .env files

# 4. Update DATABASE_URL in all .env files
# Default: postgresql://myuser:mypassword@localhost:5432/mydb

# 5. Start PostgreSQL (using Docker)
docker-compose up -d postgres

# 6. Setup database schema
cd packages/database
pnpm db:push
cd ../..

# 7. Build shared packages
pnpm --filter @repo/shared build
pnpm --filter @repo/database build

# 8. Start development servers
pnpm dev
```

## Access Your App

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- tRPC Endpoint: http://localhost:3001/trpc
- Auth Endpoint: http://localhost:3001/api/auth

## Try It Out

1. Open http://localhost:3000 in your browser
2. Click "Don't have an account? Sign Up"
3. Create an account with email and password
4. Start creating todos!

## Key Features

- Full-stack type safety with tRPC
- Authentication with Better Auth
- PostgreSQL with Drizzle ORM
- Monorepo with Turborepo
- Separate deployments for frontend/backend
- Built-in todo example with CRUD operations
- TailwindCSS styling
- Production-ready with Docker & Heroku support

## Next Steps

- Read the [full README](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Common Issues

**Database connection failed?**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env files
- Verify database exists

**Build errors?**
```bash
pnpm clean
pnpm install
pnpm build
```

**Type errors?**
```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/database build
```
