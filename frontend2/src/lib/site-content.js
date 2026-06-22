import { useEffect, useState } from "react";

import defaultBranding from "@/lib/branding.json";
import defaultMenuItems from "@/lib/menu.json";

export const SITE_CONTENT_STORAGE_KEY = "sai-caterers-site-content";
export const SITE_CONTENT_UPDATED_EVENT = "site-content-updated";

export const defaultSiteContent = {
  branding: {
    ...defaultBranding,
    reviews: Array.isArray(defaultBranding.reviews) ? defaultBranding.reviews : [],
  },
  menuItems: defaultMenuItems,
};

function normalizeContent(content) {
  const reviews = Array.isArray(content?.branding?.reviews)
    ? content.branding.reviews
    : Array.isArray(content?.reviews)
      ? content.reviews
      : Array.isArray(defaultBranding.reviews)
        ? defaultBranding.reviews
        : [];

  return {
    branding: {
      ...defaultBranding,
      ...(content?.branding || {}),
      reviews,
      heroImages: Array.isArray(content?.branding?.heroImages)
        ? content.branding.heroImages.filter(Boolean)
        : defaultBranding.heroImages,
      workVideos: Array.isArray(content?.branding?.workVideos)
        ? content.branding.workVideos.filter(Boolean)
        : defaultBranding.workVideos,
    },
    menuItems: Array.isArray(content?.menuItems) ? content.menuItems : defaultMenuItems,
  };
}

export function getStoredSiteContent() {
  if (typeof window === "undefined") {
    return defaultSiteContent;
  }

  try {
    const stored = window.localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
    return stored ? normalizeContent(JSON.parse(stored)) : defaultSiteContent;
  } catch {
    return defaultSiteContent;
  }
}

export function saveSiteContent(content) {
  if (typeof window === "undefined") return;

  const normalized = normalizeContent(content);
  window.localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(SITE_CONTENT_UPDATED_EVENT, { detail: normalized }));
}

export function resetSiteContent() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SITE_CONTENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(SITE_CONTENT_UPDATED_EVENT, { detail: defaultSiteContent }));
}

export function useSiteContent() {
  const [content, setContent] = useState(() => getStoredSiteContent());

  useEffect(() => {
    const refresh = (event) => {
      setContent(event?.detail || getStoredSiteContent());
    };

    const refreshFromStorage = () => setContent(getStoredSiteContent());

    window.addEventListener(SITE_CONTENT_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refreshFromStorage);

    return () => {
      window.removeEventListener(SITE_CONTENT_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  return content;
}
