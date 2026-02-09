import { inferAsyncReturnType } from "@trpc/server";
import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "./lib/auth";

export async function createContext({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}) {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  return {
    req,
    res,
    session,
    userId: session?.user?.id,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
