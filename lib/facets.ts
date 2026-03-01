const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

export function slugifyFacet(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

export async function fetchFacetNames() {
  const styles = new Set<string>();
  const artists = new Set<string>();
  const mediums = new Set<string>();
  const canvases = new Set<string>();

  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(`${INTERNAL_API_URL}/api/paintings?limit=${limit}&page=${page}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;

    const data = await res.json();
    const items = (data.items ?? []) as {
      style_name?: string | null;
      artist_name?: string | null;
      medium_name?: string | null;
      canvas_name?: string | null;
    }[];
    for (const item of items) {
      if (item.style_name && item.style_name.trim()) styles.add(item.style_name.trim());
      if (item.artist_name && item.artist_name.trim()) artists.add(item.artist_name.trim());
      if (item.medium_name && item.medium_name.trim()) mediums.add(item.medium_name.trim());
      if (item.canvas_name && item.canvas_name.trim()) canvases.add(item.canvas_name.trim());
    }

    if (page >= (data.pages ?? 1)) break;
    page++;
  }

  return {
    styles: Array.from(styles).sort((a, b) => a.localeCompare(b)),
    artists: Array.from(artists).sort((a, b) => a.localeCompare(b)),
    mediums: Array.from(mediums).sort((a, b) => a.localeCompare(b)),
    canvases: Array.from(canvases).sort((a, b) => a.localeCompare(b)),
  };
}
