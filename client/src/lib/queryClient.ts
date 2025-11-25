import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseURL = window.location.hostname === 'localhost' && window.location.port === ''
    ? 'https://habit-flow-07dl.onrender.com' // Production Mobile App (Render)
    : '';

  // Note: For local emulator testing, use 'http://10.0.2.2:5000' instead.
  // Ideally, use an environment variable or build flag to switch.

  console.log("API Request URL:", `${baseURL}${url}`);

  const res = await fetch(`${baseURL}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const baseURL = window.location.hostname === 'localhost' && window.location.port === ''
        ? 'https://habit-flow-07dl.onrender.com' // Production Mobile App (Render)
        : '';

      const res = await fetch(`${baseURL}${queryKey.join("/")}`, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
