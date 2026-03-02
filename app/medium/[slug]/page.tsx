import type { Metadata } from "next";
import NavbarWrapper from "@/components/NavbarWrapper";
import PaintingGallery from "@/components/PaintingGallery";
import { fetchPaintingsServer } from "@/lib/api";
import { fetchFacetNames, slugifyFacet } from "@/lib/facets";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const { mediums } = await fetchFacetNames();
  return mediums.map((name) => ({ slug: slugifyFacet(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { mediums } = await fetchFacetNames();
  const name = mediums.find((m) => slugifyFacet(m) === slug) || slug;
  const canonicalUrl = `https://www.paintx.art/medium/${slug}`;
  const title = `${name} paintings | PaintX`;
  const description = `Browse paintings with ${name} medium on PaintX art gallery.`;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "PaintX Art Gallery",
      images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: `${name} paintings` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.jpg"],
    },
  };
}

export default async function MediumPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const { mediums } = await fetchFacetNames();
  const mediumName = mediums.find((m) => slugifyFacet(m) === slug) || slug.replace(/-/g, " ");

  const query = `"${mediumName}"`;
  const data = await fetchPaintingsServer(page, query, 30, "available", "newest");

  return (
    <>
      <NavbarWrapper initialState={{ query, status: "available", sort: "newest" }} />
      <main>
        <PaintingGallery
          initialPaintings={data.items}
          initialPage={page}
          totalPages={data.pages}
          initialSearchState={{ query, status: "available", sort: "newest" }}
        />
      </main>
    </>
  );
}
