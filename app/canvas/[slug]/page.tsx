import type { Metadata } from "next";
import NavbarWrapper from "@/components/NavbarWrapper";
import PaintingGallery from "@/components/PaintingGallery";
import { fetchPaintingsServer } from "@/lib/api";
import { fetchFacetNames, slugifyFacet } from "@/lib/facets";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const { canvases } = await fetchFacetNames();
  return canvases.map((name) => ({ slug: slugifyFacet(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { canvases } = await fetchFacetNames();
  const name = canvases.find((c) => slugifyFacet(c) === slug) || slug;
  return {
    title: `${name} paintings | PaintX`,
    description: `Browse paintings on ${name} canvas on PaintX art gallery.`,
    alternates: { canonical: `https://www.paintx.art/canvas/${slug}` },
  };
}

export default async function CanvasPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const { canvases } = await fetchFacetNames();
  const canvasName = canvases.find((c) => slugifyFacet(c) === slug) || slug.replace(/-/g, " ");

  const query = `"${canvasName}"`;
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
