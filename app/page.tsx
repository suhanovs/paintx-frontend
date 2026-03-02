import type { Metadata } from "next";
import { fetchPaintingsServer } from "@/lib/api";
import PaintingGallery from "@/components/PaintingGallery";
import NavbarWrapper from "@/components/NavbarWrapper";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const searchRaw = Array.isArray(sp.search) ? sp.search[0] : sp.search;
  const statusRaw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;

  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const hasSearch = Boolean((searchRaw ?? "").trim());
  const hasFilter = hasSearch || statusRaw === "sold" || statusRaw === "all" || statusRaw === "liked" || sortRaw === "oldest";
  const hasParams = hasFilter || page > 1;

  return {
    title: "Buy Original Paintings — Contemporary & Classical Art | PaintX Art Gallery",
    description:
      "Discover unique original paintings for your home. Works by established and emerging artists. Fall in love and buy fine art online at PaintX.",
    alternates: {
      canonical: "https://www.paintx.art",
    },
    robots: hasParams
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    openGraph: {
      url: "https://www.paintx.art",
    },
  };
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const searchRaw = Array.isArray(sp.search) ? sp.search[0] : sp.search;
  const statusRaw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;

  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const search = (searchRaw ?? "").trim();
  const status = (statusRaw === "sold" || statusRaw === "all" || statusRaw === "liked" ? statusRaw : "available") as
    | "available"
    | "sold"
    | "all"
    | "liked";
  const sort = (sortRaw === "oldest" ? "oldest" : "newest") as "newest" | "oldest";

  const data = await fetchPaintingsServer(page, search || undefined, 30, status, sort);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.paintx.art/#organization",
        name: "PaintX Art Gallery",
        url: "https://www.paintx.art",
        logo: "https://www.paintx.art/logo.jpg",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.paintx.art/#website",
        url: "https://www.paintx.art",
        name: "PaintX Art Gallery",
        publisher: { "@id": "https://www.paintx.art/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.paintx.art/?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <NavbarWrapper />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <PaintingGallery
          initialPaintings={data.items}
          initialPage={page}
          totalPages={data.pages}
          initialSearchState={{ query: search, status, sort }}
        />
      </main>
    </>
  );
}
