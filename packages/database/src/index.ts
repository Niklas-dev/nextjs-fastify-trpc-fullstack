import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

// For migrations
export const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });

// For queries
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });

// Export schema and types
export * from "./schema/index.js";
export type DB = typeof db;

// Re-export drizzle-orm helpers to ensure they come from the same instance
export { eq, and, or, not, desc, asc, sql } from "drizzle-orm";
