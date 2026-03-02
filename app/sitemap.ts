import type { MetadataRoute } from "next";
import { fetchFacetNames, slugifyFacet } from "@/lib/facets";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "http://localhost:8000";

const SITE_URL = "https://www.paintx.art";

export const revalidate = 3600;

type PaintingSitemapItem = {
  slug: string;
  image?: string;
};

async function fetchAllPaintingItems(): Promise<PaintingSitemapItem[]> {
  const rows: PaintingSitemapItem[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `${INTERNAL_API_URL}/api/paintings?limit=${limit}&page=${page}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) break;

    const data = await res.json();
    const items = (data.items ?? []) as {
      slug?: string;
      image_mid_res_filename?: string;
    }[];
    for (const item of items) {
      if (!item.slug) continue;
      rows.push({
        slug: item.slug,
        image: item.image_mid_res_filename
          ? `https://images.paintx.art/mid/${item.image_mid_res_filename}`
          : undefined,
      });
    }

    if (page >= (data.pages ?? 1)) break;
    page++;
  }

  return rows;
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
  let styleRoutes: MetadataRoute.Sitemap = [];
  let artistRoutes: MetadataRoute.Sitemap = [];
  let mediumRoutes: MetadataRoute.Sitemap = [];
  let canvasRoutes: MetadataRoute.Sitemap = [];
  try {
    const paintingItems = await fetchAllPaintingItems();
    paintingRoutes = paintingItems.map((item) => ({
      url: `${SITE_URL}/art/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: item.image ? [item.image] : undefined,
    }));

    const { styles, artists, mediums, canvases } = await fetchFacetNames();
    styleRoutes = styles.map((name) => ({
      url: `${SITE_URL}/style/${slugifyFacet(name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    artistRoutes = artists.map((name) => ({
      url: `${SITE_URL}/artist/${slugifyFacet(name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    mediumRoutes = mediums.map((name) => ({
      url: `${SITE_URL}/medium/${slugifyFacet(name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));
    canvasRoutes = canvases.map((name) => ({
      url: `${SITE_URL}/canvas/${slugifyFacet(name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));
  } catch {
    // Degrade gracefully
  }

  return [...staticRoutes, ...paintingRoutes, ...styleRoutes, ...artistRoutes, ...mediumRoutes, ...canvasRoutes];
}
