import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const API_URL = window.location.hostname === 'localhost' || window.location.hostname.includes('replit')
  ? 'https://canteen-bt65.vercel.app'
  : ''; // Relative for same-domain prod deployment

export async function apiRequest(method, url, data) {
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = `${API_URL}${normalizedUrl}`;
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Accept": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    const normalizedPath = path.startsWith("/api") ? path : path.startsWith("/") ? path : `/api/${path}`;
    const fullUrl = `${API_URL}${normalizedPath}`;
    const res = await fetch(fullUrl, {
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
