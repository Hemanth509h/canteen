const REVIEW_CACHE_KEY = "customerSubmittedReviews";
export const REVIEW_CACHE_EVENT = "customer-review-cache-updated";

export function getCachedReviews() {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(REVIEW_CACHE_KEY);
    const reviews = value ? JSON.parse(value) : [];
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
}

export function cacheSubmittedReview(review) {
  if (typeof window === "undefined" || !review) return;

  const nextReview = {
    ...review,
    id: review.id || `local-review-${Date.now()}`,
    createdAt: review.createdAt || new Date().toISOString(),
  };
  const existing = getCachedReviews();
  const withoutDuplicate = existing.filter((item) => item.id !== nextReview.id);
  const reviews = [nextReview, ...withoutDuplicate].slice(0, 50);

  window.localStorage.setItem(REVIEW_CACHE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new CustomEvent(REVIEW_CACHE_EVENT, { detail: reviews }));
}
