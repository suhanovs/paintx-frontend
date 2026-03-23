export const IMAGE_BASE_URL = "https://images.paintx.art";

function normalizeImageKey(value: string | null | undefined): string {
  const raw = String(value || "").trim();
  if (!raw) return "";

  // If backend already sent an absolute URL, use it directly.
  if (/^https?:\/\//i.test(raw)) return raw;

  let key = raw.replace(/^\/+/, "");
  key = key.replace(/^(thumb|mid|img|hd)\//i, "");
  return key;
}

function buildTierUrl(tier: "thumb" | "mid" | "img" | "hd", filename: string | null | undefined): string {
  const normalized = normalizeImageKey(filename);
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${IMAGE_BASE_URL}/${tier}/${normalized}`;
}

export function thumbUrl(filename: string | null | undefined): string {
  return buildTierUrl("thumb", filename);
}

export function midUrl(filename: string | null | undefined): string {
  return buildTierUrl("mid", filename);
}

export function fullUrl(filename: string | null | undefined): string {
  return buildTierUrl("img", filename);
}

export function formatPrice(
  price: number | null | undefined,
  currency = "USD",
  showCode = false,
): string {
  if (!price || price <= 0) return "Price on request";
  const code = (currency || "USD").toUpperCase();
  const cur = code === "RUR" ? "RUB" : code;
  const locale = cur === "RUB" ? "ru-RU" : "en-US";
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return showCode ? `${formatted} ${code}` : formatted;
  } catch {
    return showCode ? `${price} ${code}` : `${price}`;
  }
}

export const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function fetchPaintingsServer(
  page: number,
  search?: string,
  limit = 30,
  status: "available" | "sold" | "all" | "liked" = "available",
  sort: "newest" | "oldest" | "price_desc" | "price_asc" | "year_asc" | "year_desc" | "listing_oldest" = "newest",
  minPrice?: number,
  strategy?: "top_sellers_available" | "author_top_25" | "author_bottom_25",
  acceptLanguage?: "en" | "ru",
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), status, sort });
  if (search) params.set("search", search);
  if (typeof minPrice === "number" && Number.isFinite(minPrice)) params.set("min_price", String(Math.max(0, Math.floor(minPrice))));
  if (strategy) params.set("strategy", strategy);
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings?${params}`, {
    next: { revalidate: 60 },
    headers: acceptLanguage ? { "Accept-Language": acceptLanguage } : undefined,
  });
  if (!res.ok) throw new Error("Failed to fetch paintings");
  return res.json();
}

export async function fetchPaintingDetailServer(id: string) {
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch painting detail");
  return res.json();
}

export async function fetchPaintingBySlugServer(slug: string) {
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch painting by slug");
  return res.json();
}
