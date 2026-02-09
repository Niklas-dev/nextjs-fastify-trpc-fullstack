# Full-Stack Monorepo: Next.js + Fastify + tRPC + Better Auth

A production-ready full-stack monorepo with end-to-end type safety, featuring Next.js, Fastify, tRPC, Better Auth, and Drizzle ORM with PostgreSQL.

## Architecture

### Monorepo Structure

```
nextjs-fastify-trpc-fullstack/
├── apps/
│   ├── api/              # Fastify backend with tRPC
│   └── web/              # Next.js frontend
├── packages/
│   ├── database/         # Drizzle ORM schemas & migrations
│   └── shared/           # Shared types & Zod schemas
```

### Package Dependencies

- `apps/api` depends on `@repo/database` and `@repo/shared`
- `apps/web` depends on `@repo/shared`
- `packages/database` is standalone with DB schema definitions
- `packages/shared` is standalone with type definitions

## Technology Stack

### Backend (apps/api)

- **Fastify 5**: Fast and low overhead web framework
- **tRPC 11**: End-to-end typesafe APIs
- **Better Auth 1.3**: Modern authentication library
- **Drizzle ORM 0.41**: TypeScript ORM for PostgreSQL
- **PostgreSQL**: Relational database

### Frontend (apps/web)

- **Next.js 15**: React framework with App Router
- **TailwindCSS 3**: Utility-first CSS framework
- **tRPC React Query**: Type-safe data fetching
- **Better Auth React**: Authentication client

### Shared Packages

- **@repo/database**: Database schemas and connection
- **@repo/shared**: Shared TypeScript types and Zod schemas

### Monorepo Tools

- **Turborepo 2.8**: High-performance build system
- **pnpm 9**: Fast, disk space efficient package manager
- **TypeScript 5.7**: Type safety across all packages

## Prerequisites

- Node.js 20 or higher
- pnpm 9 or higher
- PostgreSQL database (local or remote)
- Docker (optional, for local PostgreSQL)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Create `.env` files for each package:

#### Backend (apps/api/.env)

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (apps/web/.env)

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
```

#### Database (packages/database/.env)

```bash
cp packages/database/.env.example packages/database/.env
```

Required variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

### 3. Generate Secret Key

Generate a secure secret key for Better Auth:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Use the same secret in both `apps/api/.env` and `apps/web/.env`.

### 4. Start Database

#### Option A: Using Docker

```bash
docker-compose up -d postgres
```

#### Option B: Use Existing PostgreSQL

Ensure your PostgreSQL instance is running and update the `DATABASE_URL` in all `.env` files.

### 5. Setup Database Schema

```bash
# Generate migration files
pnpm db:generate

# Push schema to database
cd packages/database
pnpm db:push

# (Optional) Open Drizzle Studio to view your database
pnpm db:studio
```

### 6. Build Shared Packages

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/database build
```

### 7. Start Development Servers

```bash
pnpm dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend Web: http://localhost:3000
- tRPC endpoint: http://localhost:3001/trpc
- Auth endpoint: http://localhost:3001/api/auth

## Available Scripts

### Root Level

```bash
pnpm build          # Build all apps and packages
pnpm dev            # Start all apps in development mode
pnpm lint           # Lint all apps
pnpm type-check     # Type check all apps
pnpm clean          # Clean all build outputs and node_modules
pnpm format         # Format code with Prettier
```

### Database Commands

```bash
pnpm db:generate    # Generate Drizzle migrations
pnpm db:migrate     # Apply migrations to database
pnpm db:studio      # Open Drizzle Studio
```

### Individual Package Commands

```bash
# Build specific package
pnpm --filter @repo/shared build
pnpm --filter @repo/database build
pnpm --filter api build
pnpm --filter web build

# Run specific app in dev mode
pnpm --filter api dev
pnpm --filter web dev
```

## Project Structure

### Backend (apps/api)

```
apps/api/
├── src/
│   ├── router/          # tRPC routers
│   │   ├── index.ts    # Root router
│   │   └── todo.ts     # Todo router
│   ├── lib/
│   │   └── auth.ts     # Better Auth config
│   ├── context.ts      # tRPC context
│   ├── trpc.ts         # tRPC setup
│   ├── types.ts        # Type exports
│   └── server.ts       # Fastify server
├── .env.example
├── package.json
├── tsconfig.json
├── Dockerfile
└── Procfile
```

### Frontend (apps/web)

```
apps/web/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/      # React components
│   │   ├── providers.tsx
│   │   ├── auth-form.tsx
│   │   └── todo-list.tsx
│   └── lib/             # Client libraries
│       ├── trpc.ts
│       └── auth-client.ts
├── .env.example
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── Dockerfile
└── Procfile
```

### Database Package (packages/database)

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── auth.ts     # Auth tables
│   │   ├── todo.ts     # Todo table
│   │   └── index.ts
│   └── index.ts        # DB connection
├── drizzle.config.ts
├── .env.example
└── package.json
```

### Shared Package (packages/shared)

```
packages/shared/
├── src/
│   ├── schemas.ts      # Zod schemas
│   ├── types.ts        # TypeScript types
│   └── index.ts
└── package.json
```

## Database Schema

### Core Tables

- **user**: User accounts with email and profile information
- **session**: User sessions for authentication
- **account**: OAuth accounts and password storage
- **verification**: Email verification tokens
- **todo**: Example todo items with user relationship

### Schema Management

All database schemas are defined in `packages/database/src/schema/` using Drizzle ORM.

To modify the schema:

1. Edit schema files in `packages/database/src/schema/`
2. Run `pnpm db:generate` to create migration files
3. Run `pnpm db:push` to apply changes to the database

## Authentication

This project uses Better Auth with email/password authentication:

- **Sign Up**: Users create accounts with email, password, and name
- **Sign In**: Email/password authentication
- **Session Management**: Secure session handling with HTTP-only cookies
- **Protected Routes**: tRPC procedures protected by authentication middleware

### Adding Social Authentication

To add social providers (GitHub, Google, etc.), update `apps/api/src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

## Deployment

This monorepo is designed for separate deployments of frontend and backend.

### Heroku Deployment

#### Backend (API)

1. Create Heroku app:
```bash
heroku create my-app-api
```

2. Add PostgreSQL:
```bash
heroku addons:create heroku-postgresql:mini
```

3. Set environment variables:
```bash
heroku config:set BETTER_AUTH_SECRET="your-secret-key"
heroku config:set BETTER_AUTH_URL="https://my-app-api.herokuapp.com"
heroku config:set FRONTEND_URL="https://my-app-web.herokuapp.com"
heroku config:set NODE_ENV="production"
```

4. Deploy:
```bash
git push heroku main
```

5. Run migrations:
```bash
heroku run pnpm --filter=@repo/database db:migrate
```

#### Frontend (Web)

1. Create Heroku app:
```bash
heroku create my-app-web
```

2. Set environment variables:
```bash
heroku config:set NEXT_PUBLIC_API_URL="https://my-app-api.herokuapp.com"
heroku config:set BETTER_AUTH_URL="https://my-app-api.herokuapp.com"
heroku config:set BETTER_AUTH_SECRET="your-secret-key"
```

3. Deploy:
```bash
git push heroku main
```

### Dokku Deployment

#### Backend

```bash
# On your Dokku server
dokku apps:create api
dokku postgres:create api-db
dokku postgres:link api-db api

# Set environment variables
dokku config:set api BETTER_AUTH_SECRET="your-secret-key"
dokku config:set api BETTER_AUTH_URL="https://api.yourdomain.com"
dokku config:set api FRONTEND_URL="https://web.yourdomain.com"

# Deploy
git remote add dokku-api dokku@yourserver:api
git push dokku-api main

# Run migrations
dokku run api pnpm --filter=@repo/database db:migrate
```

#### Frontend

```bash
# On your Dokku server
dokku apps:create web

# Set environment variables
dokku config:set web NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
dokku config:set web BETTER_AUTH_URL="https://api.yourdomain.com"
dokku config:set web BETTER_AUTH_SECRET="your-secret-key"

# Deploy
git remote add dokku-web dokku@yourserver:web
git push dokku-web main
```

### Docker Deployment

Build for production:

```bash
# Build backend
docker build -f apps/api/Dockerfile -t my-app-api .

# Build frontend
docker build -f apps/web/Dockerfile -t my-app-web .
```

## 🏗️ Project Structure

```
├── apps/
│   ├── api/                      # Fastify Backend
│   │   ├── src/
│   │   │   ├── router/          # tRPC routers
│   │   │   │   ├── index.ts    # Root router
│   │   │   │   └── todo.ts     # Todo router
│   │   │   ├── lib/
│   │   │   │   └── auth.ts     # Better Auth config
│   │   │   ├── context.ts      # tRPC context
│   │   │   ├── trpc.ts         # tRPC setup
│   │   │   └── server.ts       # Fastify server
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Procfile
│   │
│   └── web/                      # Next.js Frontend
│       ├── src/
│       │   ├── app/             # App router
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── globals.css
│       │   ├── components/      # React components
│       │   │   ├── providers.tsx
│       │   │   ├── auth-form.tsx
│       │   │   └── todo-list.tsx
│       │   └── lib/             # Client libraries
│       │       ├── trpc.ts
│       │       └── auth-client.ts
│       ├── .env.example
│       ├── package.json
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── Procfile
│
├── packages/
│   ├── database/                # Drizzle ORM
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── auth.ts     # Auth tables
│   │   │   │   ├── todo.ts     # Todo table
│   │   │   │   └── index.ts
│   │   │   └── index.ts        # DB connection
│   │   ├── drizzle.config.ts
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── shared/                  # Shared code
│       ├── src/
│       │   ├── schemas.ts      # Zod schemas
│       │   ├── types.ts        # TypeScript types
│       │   └── index.ts
│       └── package.json
│
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json                  # Turborepo config
├── tsconfig.base.json          # Base TypeScript config
└── README.md
```

## 🔒 Authentication

This project uses Better Auth with email/password authentication:

- **Sign Up**: Users can create accounts with email/password
- **Sign In**: Email/password authentication
- **Session Management**: Secure session handling with cookies
- **Protected Routes**: tRPC procedures protected by authentication

### Adding Social Auth

To add social providers (GitHub, Google, etc.), update `apps/api/src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

## 🗄️ Database

### Schema Management

The database schema is managed with Drizzle ORM in `packages/database/src/schema/`.

**Core tables:**
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification
- `todo` - Example todo items

### Migrations

```bash
# Generate migrations after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# View database with Drizzle Studio
pnpm db:studio
```

## 🔧 Adding New Features

### Adding a New tRPC Router

1. Create router file in `apps/api/src/router/yourRouter.ts`
2. Export from `apps/api/src/router/index.ts`
3. Use in frontend with `trpc.yourRouter.procedure.useQuery()`

### Adding New Shared Types

1. Add schemas to `packages/shared/src/schemas.ts`
2. Add types to `packages/shared/src/types.ts`
3. Run `pnpm build` to compile
4. Import in any app: `import { YourType } from "@repo/shared"`

### Adding Database Tables

1. Add schema to `packages/database/src/schema/`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply
4. Use in code: `import { yourTable } from "@repo/database"`

## Troubleshooting

### Build Issues

If you encounter build errors:

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Type Errors

If you see import type errors:

```bash
# Rebuild shared packages
cd packages/shared && pnpm build
cd packages/database && pnpm build
```

### Database Connection

If database connection fails:

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in all `.env` files
3. Ensure database exists: `createdb mydb`
4. Run migrations: `pnpm db:migrate`

### CORS Issues

If you encounter CORS errors:

1. Verify `FRONTEND_URL` in `apps/api/.env`
2. Check `NEXT_PUBLIC_API_URL` in `apps/web/.env`
3. Ensure Better Auth `trustedOrigins` includes your frontend URL

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT

## Resources

- [tRPC Documentation](https://trpc.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://fastify.dev)
- [Better Auth Documentation](https://better-auth.com)
- [ Drizzle ORM Documentation](https://orm.drizzle.team)
- [Turborepo Documentation](https://turbo.build/repo)
