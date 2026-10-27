const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return "";

  const value = imageUrl.trim();
  if (!value) return "";

  // Older product records may contain localhost URLs from local development.
  // In production, route those images through the deployed API instead.
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\//i.test(value)) {
    try {
      const parsed = new URL(value);
      return `${API_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return value;
    }
  }

  // Support stored relative upload paths as well as absolute URLs.
  if (value.startsWith("/uploads/")) {
    return `${API_URL}${value}`;
  }

  return value;
}
