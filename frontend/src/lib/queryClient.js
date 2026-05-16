const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const API_URL = API_ORIGIN
  ? `${API_ORIGIN.replace(/\/api$/, "")}/api`
  : "/api";

export function apiUrl(url) {
  let cleanPath = url.startsWith("/") ? url.slice(1) : url;
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }

  return API_URL.startsWith("http")
    ? `${API_URL}/${cleanPath}`.replace(/([^:])\/+/g, "$1/")
    : `${API_URL}/${cleanPath}`.replace(/\/+/g, "/");
}

export async function apiRequest(method, url, data) {
  const res = await fetch(apiUrl(url), {
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
      const res = await fetch(apiUrl(path));

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
        // Ensure we return the data property if it exists (wrapped by express handler)
        return result.success && result.data !== undefined ? result.data : result;
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
