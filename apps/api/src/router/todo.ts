import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db, todo, eq, and, desc } from "@repo/database";
import { createTodoSchema, updateTodoSchema } from "@repo/shared";
import { z } from "zod";

export const todoRouter = router({
  // Get all todos for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const todos = await db
      .select()
      .from(todo)
      .where(eq(todo.userId, ctx.userId))
      .orderBy(desc(todo.createdAt));

    return todos;
  }),

  // Get a single todo by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [foundTodo] = await db
        .select()
        .from(todo)
        .where(and(eq(todo.id, input.id), eq(todo.userId, ctx.userId)));

      if (!foundTodo) {
        throw new Error("Todo not found");
      }

      return foundTodo;
    }),

  // Create a new todo
  create: protectedProcedure
    .input(createTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const [newTodo] = await db
        .insert(todo)
        .values({
          title: input.title,
          description: input.description || null,
          userId: ctx.userId,
        })
        .returning();

      return newTodo;
    }),

  // Update a todo
  update: protectedProcedure
    .input(updateTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [updatedTodo] = await db
        .update(todo)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(todo.id, id), eq(todo.userId, ctx.userId)))
        .returning();

      if (!updatedTodo) {
        throw new Error("Todo not found or you don't have permission to update it");
      }

      return updatedTodo;
    }),

  // Delete a todo
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedTodo] = await db
        .delete(todo)
        .where(and(eq(todo.id, input.id), eq(todo.userId, ctx.userId)))
        .returning();

      if (!deletedTodo) {
        throw new Error("Todo not found or you don't have permission to delete it");
      }

      return { success: true };
    }),

  // Toggle todo completion status
  toggle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [currentTodo] = await db
        .select()
        .from(todo)
        .where(and(eq(todo.id, input.id), eq(todo.userId, ctx.userId)));

      if (!currentTodo) {
        throw new Error("Todo not found");
      }

      const [updatedTodo] = await db
        .update(todo)
        .set({
          completed: !currentTodo.completed,
          updatedAt: new Date(),
        })
        .where(eq(todo.id, input.id))
        .returning();

      return updatedTodo;
    }),
});
