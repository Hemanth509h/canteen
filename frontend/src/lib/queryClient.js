// Use relative path by default, but allow override
export const API_URL = "/api";

export async function apiRequest(method, url, data) {
  // Normalize the URL: remove any leading slash from the input url
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  
  // If the cleanUrl already starts with 'api/', don't double it
  const finalPath = cleanUrl.startsWith("api/") 
    ? `/${cleanUrl}` 
    : `/api/${cleanUrl}`;
    
  console.log(`[API] Requesting: ${finalPath}`);

  const res = await fetch(finalPath, {
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
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    
    // Ensure the path starts with /api
    const finalPath = cleanPath.startsWith("api/")
      ? `/${cleanPath}`
      : `/api/${cleanPath}`;

    console.log(`[QUERY] Fetching: ${finalPath}`);
      
    const res = await fetch(finalPath, {
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
