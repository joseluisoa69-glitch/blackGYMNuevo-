import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import { type ReactNode, useEffect, useState } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        let token: string | null = null;
        try {
          const { getActiveToken } = await import("@/lib/firebase");
          token = await getActiveToken();
        } catch (error) {
          console.error("Error getting Firebase token for tRPC client:", error);
        }

        const headers = new Headers(init?.headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    import("@/lib/firebase")
      .then(({ auth }) => {
        unsubscribe = auth.onAuthStateChanged(async () => {
          // Whenever auth state changes, invalidate all queries to reload user context
          await queryClient.invalidateQueries();
          setInitializing(false);
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Firebase Auth listener:", err);
        setInitializing(false);
      });

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-2 border-[#FFD700] border-t-transparent rounded-full" />
          <p className="text-white/40 text-sm font-medium">Iniciando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
