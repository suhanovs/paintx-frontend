import type { MetadataRoute } from "next";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "http://localhost:8000";

const SITE_URL = "https://www.paintx.art";

export const revalidate = 3600;

async function fetchAllSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `${INTERNAL_API_URL}/api/paintings?limit=${limit}&page=${page}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) break;

    const data = await res.json();
    const items = (data.items ?? []) as { slug?: string }[];
    for (const item of items) {
      if (item.slug) slugs.push(item.slug);
    }

    if (page >= (data.pages ?? 1)) break;
    page++;
  }

  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Dynamic painting pages
  let paintingRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await fetchAllSlugs();
    paintingRoutes = slugs.map((slug) => ({
      url: `${SITE_URL}/art/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Degrade gracefully
  }

  return [...staticRoutes, ...paintingRoutes];
}
