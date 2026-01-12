// Use a relative path for the API URL in development
export const API_URL = "/api";

export async function apiRequest(method, url, data) {
  // Normalize the URL: remove any leading slash and any leading 'api/'
  let cleanPath = url.startsWith("/") ? url.slice(1) : url;
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }

  const finalUrl = `/${API_URL}/${cleanPath}`.replace(/\/+/g, '/');
  console.log(`[API] Requesting: ${finalUrl}`);

  const res = await fetch(finalUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorData.error || res.statusText || `${res.status}`);
  }
  return res;
}

export const getQueryFn =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/");
    let cleanPath = path.startsWith("/") ? path.slice(1) : path;
    if (cleanPath.startsWith("api/")) {
      cleanPath = cleanPath.slice(4);
    }

    const finalUrl = `/${API_URL}/${cleanPath}`.replace(/\/+/g, '/');
    console.log(`[QUERY] Fetching: ${finalUrl}`);

    const res = await fetch(finalUrl);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorData.error || res.statusText || `${res.status}`);
    }
    
    const text = await res.text();
    try {
      const result = JSON.parse(text);
      return result.success ? result.data : result;
    } catch (e) {
      console.error("Malformed JSON response:", text);
      throw new Error("Invalid server response (malformed JSON)");
    }
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
