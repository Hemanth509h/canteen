export const API_URL = "/api";

export function apiUrl(url) {
  let cleanPath = url.startsWith("/") ? url.slice(1) : url;
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.slice(4);
  }

  return API_URL.startsWith("http")
    ? `${API_URL}/${cleanPath}`.replace(/([^:])\/+/g, "$1/")
    : `${API_URL}/${cleanPath}`.replace(/\/+/g, "/");
}

function getAdminToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminToken") || localStorage.getItem("adminToken");
}

export async function apiRequest(method, url, data) {
  const adminToken = getAdminToken();
  const res = await fetch(apiUrl(url), {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
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
      const adminToken = getAdminToken();
      const res = await fetch(apiUrl(path), { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} });

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
      staleTime: 5000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
