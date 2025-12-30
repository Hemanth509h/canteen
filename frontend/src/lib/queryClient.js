// Use absolute URL for Vercel backend as specified by user
export const API_URL = "https://canteen-bt65.vercel.app/api";

export async function apiRequest(method, url, data) {
  // Normalize the URL: remove any leading slash from the input url
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  
  // If the cleanUrl already starts with 'api/', don't double it
  const finalPath = cleanUrl.startsWith("api/") 
    ? cleanUrl.slice(4) 
    : cleanUrl;
    
  const fullUrl = `${API_URL}/${finalPath}`;
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
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    
    // If the cleanPath already starts with 'api/', don't double it
    const finalPath = cleanPath.startsWith("api/")
      ? cleanPath.slice(4)
      : cleanPath;

    const fullUrl = `${API_URL}/${finalPath}`;
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
