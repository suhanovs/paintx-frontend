export const IMAGE_BASE_URL = "https://images.paintx.art";

export function thumbUrl(filename: string | null | undefined): string {
  if (!filename) return "";
  return `${IMAGE_BASE_URL}/thumb/${filename}`;
}

export function midUrl(filename: string | null | undefined): string {
  if (!filename) return "";
  return `${IMAGE_BASE_URL}/mid/${filename}`;
}

export function fullUrl(filename: string | null | undefined): string {
  if (!filename) return "";
  return `${IMAGE_BASE_URL}/img/${filename}`;
}

export function formatPrice(
  price: number | null | undefined,
  currency = "USD",
  showCode = false,
): string {
  if (!price || price <= 0) return "Price on request";
  const code = (currency || "USD").toUpperCase();
  const cur = code === "RUR" ? "RUB" : code;
  try {
    const formatted = new Intl.NumberFormat("en-US", {
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
  sort: "newest" | "oldest" = "newest",
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), status, sort });
  if (search) params.set("search", search);
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings?${params}`, {
    next: { revalidate: 60 },
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
