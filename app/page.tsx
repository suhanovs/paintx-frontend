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
  const minPriceRaw = Array.isArray(sp.min_price) ? sp.min_price[0] : sp.min_price;
  const strategyRaw = Array.isArray(sp.strategy) ? sp.strategy[0] : sp.strategy;

  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const hasSearch = Boolean((searchRaw ?? "").trim());
  const hasFilter = hasSearch || statusRaw === "sold" || statusRaw === "all" || statusRaw === "liked" || sortRaw === "oldest" || sortRaw === "price_desc" || sortRaw === "price_asc" || sortRaw === "year_asc" || sortRaw === "year_desc" || sortRaw === "listing_oldest" || Boolean(minPriceRaw) || Boolean(strategyRaw);
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
  const minPriceRaw = Array.isArray(sp.min_price) ? sp.min_price[0] : sp.min_price;
  const strategyRaw = Array.isArray(sp.strategy) ? sp.strategy[0] : sp.strategy;

  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const search = (searchRaw ?? "").trim();
  const status = (statusRaw === "sold" || statusRaw === "all" || statusRaw === "liked" ? statusRaw : "available") as
    | "available"
    | "sold"
    | "all"
    | "liked";
  const allowedSorts = new Set(["newest", "oldest", "price_desc", "price_asc", "year_asc", "year_desc", "listing_oldest"]);
  const sort = (allowedSorts.has((sortRaw ?? "").toLowerCase()) ? (sortRaw as string).toLowerCase() : "newest") as
    | "newest"
    | "oldest"
    | "price_desc"
    | "price_asc"
    | "year_asc"
    | "year_desc"
    | "listing_oldest";
  const minPrice = minPriceRaw ? Math.max(0, Number.parseInt(minPriceRaw, 10) || 0) : undefined;
  const strategy = (strategyRaw === "top_sellers_available" || strategyRaw === "author_top_25" || strategyRaw === "author_bottom_25")
    ? strategyRaw
    : undefined;

  const data = await fetchPaintingsServer(page, search || undefined, 30, status, sort, minPrice, strategy);

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
          initialSearchState={{ query: search, status, sort, minPrice, strategy }}
        />
      </main>
    </>
  );
}
