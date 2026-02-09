# GitHub Copilot Instructions

## Project Overview

This is a full-stack monorepo application built with modern TypeScript technologies, featuring:

- **Architecture**: Monorepo with Turborepo
- **Backend**: Fastify + tRPC
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Type Safety**: End-to-end type safety with tRPC

## Project Structure

### Workspace Organization

```
/apps/api/          - Backend API (Fastify + tRPC)
/apps/web/          - Frontend (Next.js)
/packages/database/ - Database schemas (Drizzle ORM)
/packages/shared/   - Shared types and schemas (Zod)
```

### Key Files and Their Purposes

**Backend (apps/api/)**
- `src/server.ts` - Main Fastify server entry point
- `src/router/index.ts` - Root tRPC router
- `src/router/todo.ts` - Todo router with CRUD operations
- `src/context.ts` - tRPC context with session handling
- `src/trpc.ts` - tRPC initialization with auth middleware
- `src/lib/auth.ts` - Better Auth configuration

**Frontend (apps/web/)**
- `src/app/page.tsx` - Main page component
- `src/app/layout.tsx` - Root layout with providers
- `src/components/todo-list.tsx` - Todo list component
- `src/components/auth-form.tsx` - Authentication form
- `src/lib/trpc.ts` - tRPC client configuration
- `src/lib/auth-client.ts` - Better Auth client

**Database (packages/database/)**
- `src/schema/auth.ts` - Authentication tables (user, session, account, verification)
- `src/schema/todo.ts` - Todo table
- `src/index.ts` - Database connection and exports
- `drizzle.config.ts` - Drizzle configuration

**Shared (packages/shared/)**
- `src/schemas.ts` - Zod validation schemas
- `src/types.ts` - TypeScript type definitions
- `src/index.ts` - Package exports

## Technology Stack

### Backend Stack
- **Fastify 5**: Web framework (uses ESM)
- **tRPC 11**: Type-safe API layer
- **Better Auth 1.3**: Authentication library
- **Drizzle ORM 0.41**: Database ORM
- **Zod 3**: Schema validation
- **PostgreSQL**: Database

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TailwindCSS 3**: Styling
- **tRPC React Query**: Data fetching
- **Better Auth React**: Auth client

### Monorepo Tools
- **Turborepo 2.8**: Build orchestration
- **pnpm 9**: Package manager
- **TypeScript 5.7**: Type system

## Code Patterns and Best Practices

### Import Conventions

All shared packages use ESM with `.js` extensions:
```typescript
// In packages/database/ and packages/shared/
import { something } from "./module.js"  // Always use .js extension
```

### Type Safety Pattern

1. Define Zod schemas in `packages/shared/src/schemas.ts`
2. Infer types from schemas in `packages/shared/src/types.ts`
3. Use schemas in tRPC router input validation
4. Frontend automatically gets full type inference

Example:
```typescript
// 1. Define schema (packages/shared/src/schemas.ts)
export const createTodoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

// 2. Infer type (packages/shared/src/types.ts)
export type CreateTodo = z.infer<typeof createTodoSchema>;

// 3. Use in tRPC router (apps/api/src/router/todo.ts)
create: protectedProcedure
  .input(createTodoSchema)
  .mutation(async ({ ctx, input }) => { ... })

// 4. Frontend usage (apps/web/)
const createTodo = trpc.todo.create.useMutation();
// Input is fully typed automatically!
```

### Authentication Pattern

**Protected Routes:**
```typescript
// Use protectedProcedure for routes requiring auth
export const todoRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // ctx.userId is guaranteed to exist
    // ctx.session contains user info
  })
});
```

**Public Routes:**
```typescript
// Use publicProcedure for open endpoints
health: publicProcedure.query(() => {
  return { status: "ok" };
})
```

### Database Patterns

**Schema Definition:**
```typescript
// Always define schemas in packages/database/src/schema/
export const myTable = pgTable("my_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
```

**Query Pattern:**
```typescript
// Import from @repo/database
import { db, myTable } from "@repo/database";
import { eq } from "drizzle-orm";

// Use Drizzle query builder
const items = await db.select().from(myTable).where(eq(myTable.userId, ctx.userId));
```

## Development Workflow

### Adding a New Feature

1. **Define Types** (if needed)
   - Add Zod schema to `packages/shared/src/schemas.ts`
   - Add TypeScript types to `packages/shared/src/types.ts`

2. **Database Changes** (if needed)
   - Add table schema to `packages/database/src/schema/`
   - Run `pnpm db:generate` to create migration
   - Run `pnpm db:push` to apply to database

3. **Backend Implementation**
   - Create new router file in `apps/api/src/router/`
   - Export from `apps/api/src/router/index.ts`
   - Use `protectedProcedure` or `publicProcedure`

4. **Build Shared Packages**
   - Run `pnpm --filter @repo/shared build`
   - Run `pnpm --filter @repo/database build`

5. **Frontend Implementation**
   - Use tRPC hooks: `trpc.yourRouter.yourProcedure.useQuery()` or `.useMutation()`
   - Types are automatically inferred

### Build Order

Turborepo automatically handles build dependencies:
1. `@repo/shared` (no dependencies)
2. `@repo/database` (no dependencies)
3. `apps/api` (depends on database and shared)
4. `apps/web` (depends on shared)

### Environment Variables

**Required for Development:**
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: 32+ character secret (same in frontend and backend)
- `BETTER_AUTH_URL`: Backend URL (default: http://localhost:3001)
- `FRONTEND_URL`: Frontend URL (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL`: Backend URL for frontend (default: http://localhost:3001)

## Common Tasks

### Adding a New tRPC Router

```typescript
// 1. Create apps/api/src/router/myRouter.ts
import { router, protectedProcedure } from "../trpc";

export const myRouter = router({
  myProcedure: protectedProcedure.query(async ({ ctx }) => {
    // Implementation
  }),
});

// 2. Add to apps/api/src/router/index.ts
import { myRouter } from "./myRouter";

export const appRouter = router({
  // ... existing routes
  my: myRouter,
});

// 3. Use in frontend
const { data } = trpc.my.myProcedure.useQuery();
```

### Adding a Database Table

```typescript
// 1. Create schema in packages/database/src/schema/myTable.ts
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const myTable = pgTable("my_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// 2. Export from packages/database/src/schema/index.ts
export * from "./myTable.js";

// 3. Generate and apply migration
// pnpm db:generate
// pnpm db:push

// 4. Rebuild database package
// pnpm --filter @repo/database build
```

### Running Specific Commands

```bash
# Run dev for specific app
pnpm --filter api dev
pnpm --filter web dev

# Build specific package
pnpm --filter @repo/shared build

# Type check everything
pnpm type-check

# Database commands
pnpm db:generate  # Generate migrations
pnpm db:push      # Apply to database
pnpm db:studio    # Open Drizzle Studio
```

## Error Handling

### Common Errors and Solutions

**"Module not found @repo/database"**
- Solution: Build the package with `pnpm --filter @repo/database build`

**"Export 'db' not found"**
- Solution: Ensure packages are built and use ESM imports with `.js` extensions

**CORS errors**
- Solution: Check `FRONTEND_URL` in backend .env matches frontend URL

**Database connection errors**
- Solution: Verify `DATABASE_URL` is correct and PostgreSQL is running

## Security Considerations

1. **Never commit .env files** - Use .env.example as templates
2. **BETTER_AUTH_SECRET must be random** - Generate with crypto.randomBytes
3. **Use HTTPS in production** - Update URLs to https://
4. **Validate all inputs** - Use Zod schemas for validation
5. **Use protectedProcedure** - For routes requiring authentication

## Testing Considerations

When writing tests:
- Mock tRPC context for unit tests
- Use test database for integration tests
- Mock Better Auth session for auth tests
- Test type safety with TypeScript

## Deployment

- **Frontend and backend can be deployed separately**
- **Both need access to the same database**
- **Use same BETTER_AUTH_SECRET in both deployments**
- **Run migrations before starting services**
- **See DEPLOYMENT.md for platform-specific guides**

## Key Dependencies Versions

- Node.js: >=20.0.0
- pnpm: >=9.0.0
- PostgreSQL: Any recent version
- All TypeScript packages are ESM modules

## Assistance Guidelines

When helping with this project:
1. Always consider the monorepo structure
2. Use correct import paths with workspace protocol
3. Remember ESM requires `.js` extensions in shared packages
4. Build shared packages before using them
5. Follow the established patterns for types, auth, and database access
6. Suggest tRPC patterns for API communication
7. Use Zod for runtime validation
8. Consider type safety and end-to-end type inference
