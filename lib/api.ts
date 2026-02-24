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
  currency = "USD"
): string {
  if (!price || price <= 0) return "Price on request";
  const cur = currency === "RUR" ? "RUB" : currency;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${cur}`;
  }
}

export const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function fetchPaintingsServer(page: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "12" });
  if (search) params.set("search", search);
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch paintings");
  return res.json();
}

export async function fetchPaintingDetailServer(id: string) {
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch painting detail");
  return res.json();
}

export async function fetchPaintingBySlugServer(slug: string) {
  const res = await fetch(`${INTERNAL_API_URL}/api/paintings/slug/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch painting by slug");
  return res.json();
}
