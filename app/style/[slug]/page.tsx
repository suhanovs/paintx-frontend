import type { Metadata } from "next";
import NavbarWrapper from "@/components/NavbarWrapper";
import PaintingGallery from "@/components/PaintingGallery";
import { fetchPaintingsServer } from "@/lib/api";
import { fetchFacetNames, slugifyFacet } from "@/lib/facets";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { styles } = await fetchFacetNames();
  return styles.map((name) => ({ slug: slugifyFacet(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { styles } = await fetchFacetNames();
  const name = styles.find((s) => slugifyFacet(s) === slug) || slug;
  return {
    title: `${name} paintings | PaintX`,
    description: `Browse ${name} paintings on PaintX art gallery.`,
    alternates: { canonical: `https://www.paintx.art/style/${slug}` },
  };
}

export default async function StylePage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const { styles } = await fetchFacetNames();
  const styleName = styles.find((s) => slugifyFacet(s) === slug);
  if (!styleName) {
    return (
      <>
        <NavbarWrapper />
        <main className="min-h-screen flex items-center justify-center text-gray-300">Style not found.</main>
      </>
    );
  }

  const query = `"${styleName}"`;
  const data = await fetchPaintingsServer(page, query, 30, "available", "newest");

  const listItems = (data.items || []).slice(0, 20).map((item: { title?: string; title_ru?: string; slug?: string }, idx: number) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.title || item.title_ru || "Painting",
    url: item.slug ? `https://www.paintx.art/art/${item.slug}` : undefined,
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${styleName} paintings`,
    url: `https://www.paintx.art/style/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: listItems,
    },
  };

  return (
    <>
      <NavbarWrapper initialState={{ query, status: "available", sort: "newest" }} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
