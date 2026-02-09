import { router, publicProcedure } from "../trpc";
import { todoRouter } from "./todo";

export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),

  // Nested routers
  todo: todoRouter,
});

export type AppRouter = typeof appRouter;
