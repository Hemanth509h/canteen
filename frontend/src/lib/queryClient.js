// Use relative paths for API calls when hosted on the same domain
export const API_URL = "/api";

export async function apiRequest(method, url, data) {
  // Normalize the URL: ensure it starts with a slash but not double /api
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = cleanUrl.startsWith("/api") ? cleanUrl : `/api${cleanUrl}`;
  
  console.log(`[API] Requesting: ${fullUrl}`);

  const res = await fetch(fullUrl, {
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
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;

    console.log(`[QUERY] Fetching: ${fullUrl}`);
      
    const res = await fetch(fullUrl, {
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
