import { httpBatchLink, type TRPCClient } from "@trpc/client";
import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../api/src/types";

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export const trpcClient: TRPCClient<AppRouter> = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      headers() {
        return {
          "content-type": "application/json",
        };
      },
    }),
  ],
});
