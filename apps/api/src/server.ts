import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import { auth } from "./lib/auth";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

async function main() {
  const server = Fastify({
    maxParamLength: 5000,
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Register CORS
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Register tRPC
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path?: string; error: any }) {
        console.error(`[tRPC Error] Path: '${path}'`, error);
      },
    },
  });

  // Better Auth routes
  server.all("/api/auth/*", async (request, reply) => {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      // Process authentication request
      const response = await auth.handler(req);

      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      server.log.error({ error }, "Authentication Error");
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  });

  // Health check route
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Start server
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`[Server] Ready at http://${HOST}:${PORT}`);
    console.log(`[tRPC] Endpoint: http://${HOST}:${PORT}/trpc`);
    console.log(`[Auth] Endpoint: http://${HOST}:${PORT}/api/auth`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
