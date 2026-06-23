import defaultBranding from "@/lib/branding.json";
import defaultMenuItems from "@/lib/menu.json";

export const defaultSiteContent = {
  branding: {
    ...defaultBranding,
    reviews: Array.isArray(defaultBranding.reviews) ? defaultBranding.reviews : [],
  },
  menuItems: defaultMenuItems,
};

export function useSiteContent() {
  return defaultSiteContent;
}
