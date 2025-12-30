// Use empty string for API URL on Vercel as routes are already prefixed with /api
export const API_URL = "";

export async function apiRequest(method, url, data) {
  // Ensure the URL starts with /api
  const normalizedUrl = url.startsWith("/api") 
    ? (url.startsWith("/") ? url : `/${url}`)
    : (url.startsWith("/") ? `/api${url}` : `/api/${url}`);
    
  const res = await fetch(normalizedUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

export const getQueryFn =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    // Ensure the path starts with /api
    const normalizedPath = path.startsWith("api/") || path.startsWith("/api")
      ? (path.startsWith("/") ? path : `/${path}`)
      : (path.startsWith("/") ? `/api${path}` : `/api/${path}`);
      
    const res = await fetch(normalizedPath, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    return await res.json();
  };

import { QueryClient } from "@tanstack/react-query";
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
