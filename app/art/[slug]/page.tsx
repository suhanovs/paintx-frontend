import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchPaintingBySlugServer,
  midUrl,
  fullUrl,
  formatPrice,
  INTERNAL_API_URL,
} from "@/lib/api";
import PaintingScroller from "@/components/PaintingScroller";
import DetailImage from "@/components/DetailImage";
import BackButton from "@/components/BackButton";
import DetailInquiryCta from "@/components/DetailInquiryCta";
import { slugifyFacet } from "@/lib/facets";
import type { PaintingDetail } from "@/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs: string[] = [];
  try {
    let page = 1;
    const limit = 100;
    while (true) {
      const res = await fetch(`${INTERNAL_API_URL}/api/paintings?limit=${limit}&page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      for (const p of (data.items as { slug?: string }[])) {
        if (p.slug) slugs.push(p.slug);
      }
      if (page >= (data.pages ?? 1)) break;
      page++;
    }
  } catch {
    // return empty — pages will be server-rendered on demand
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p: PaintingDetail = await fetchPaintingBySlugServer(slug);
    const mid = midUrl(p.image_mid_res_filename);
    const canonicalUrl = `https://www.paintx.art/art/${slug}`;
    const title = p.title || "Painting";
    const artist = p.artist_name_en || p.artist_name;
    const pageTitle = artist ? `${title} by ${artist}` : title;
    const desc =
      p.description
        ? p.description.slice(0, 155)
        : `Original painting${artist ? ` by ${artist}` : ""}. Browse and purchase fine art at PaintX.`;

    return {
      title: pageTitle,
      description: desc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: "website",
        url: canonicalUrl,
        title: pageTitle,
        description: desc,
        images: mid ? [{ url: mid, alt: title }] : [],
        siteName: "PaintX Art Gallery",
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: desc,
        images: mid ? [mid] : [],
      },
    };
  } catch {
    return { title: "Painting" };
  }
}

const UNKNOWN = ["Unknown", "Неизвестно", "Unknown style", "Неизвестный стиль", ""];
const DETAIL_PILL_CLASS = "inline-flex items-center rounded-full px-3 py-1 border border-gray-600 bg-gray-700/40 text-gray-300 text-xs font-medium whitespace-nowrap";
const DETAIL_PILL_LINK_CLASS = `${DETAIL_PILL_CLASS} transition-colors hover:bg-gray-700/60 hover:text-gray-200`;

export default async function PaintingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let p: PaintingDetail;
  try {
    p = await fetchPaintingBySlugServer(slug);
  } catch {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Painting not found.</p>
      </div>
    );
  }

  const mid  = midUrl(p.image_mid_res_filename);
  const full = fullUrl(p.image_full_res_filename || p.image_mid_res_filename);
  const price = formatPrice(p.price, p.currency || "USD", true);
  const title = p.title || "Untitled";
  const artistName = p.artist_name_en || p.artist_name;
  // Keep UUID for related endpoints
  const paintingId = String(p.id);

  const detailUrl = `https://www.paintx.art/art/${slug}`;
  const availability = (p.availability || "available").toLowerCase().includes("sold")
    ? "https://schema.org/SoldOut"
    : "https://schema.org/InStock";
  const conditionText = (p.condition || "").toLowerCase();
  const itemCondition =
    conditionText.includes("excellent") || conditionText.includes("new")
      ? "https://schema.org/NewCondition"
      : undefined;
  const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const offer =
    p.price && p.price > 0
      ? {
          "@type": "Offer",
          price: p.price,
          priceCurrency: p.currency || "USD",
          availability,
          url: detailUrl,
          priceValidUntil,
          itemCondition,
          seller: {
            "@type": "Organization",
            name: "PaintX Art Gallery",
            url: "https://www.paintx.art",
          },
        }
      : undefined;

  const artworkStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VisualArtwork",
        name: title,
        url: detailUrl,
        image: mid || undefined,
        artform: p.style_name || undefined,
        artMedium: p.medium_name || undefined,
        width: p.canvas_width ? `${p.canvas_width} cm` : undefined,
        height: p.canvas_height ? `${p.canvas_height} cm` : undefined,
        artist: artistName ? { "@type": "Person", name: artistName } : undefined,
        description: p.description || undefined,
        offers: offer,
      },
      {
        "@type": "Product",
        name: title,
        url: detailUrl,
        image: mid || undefined,
        description: p.description || undefined,
        brand: {
          "@type": "Brand",
          name: "PaintX",
        },
        offers: offer,
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Floating back button */}
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      <div className="pt-20 pb-3 w-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkStructuredData) }}
        />
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Left: Main image only */}
          <div className="lg:w-[65%] px-[20px]">
            <DetailImage mid={mid} full={full} alt={title} />
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-4 lg:w-[35%] pl-[10px] pr-[34px]">
          <h1 className="text-3xl font-bold">
            {title}
            {p.year && p.year > 0 ? `, ${p.year}` : ""}
          </h1>

          {/* Price */}
          <div className="text-xl font-semibold text-gray-200">{price}</div>

          {/* Status + condition */}
          <div className="flex items-center gap-3 flex-wrap">
            {p.availability && (
              <span className={DETAIL_PILL_CLASS}>{p.availability}</span>
            )}
            {p.condition && !UNKNOWN.includes(p.condition) && (
              <span className={DETAIL_PILL_CLASS}>{p.condition}</span>
            )}
          </div>

          {/* Description */}
          {p.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{p.description}</p>
          )}

          {/* Attribute chips */}
          <div className="flex flex-wrap gap-2">
            {p.style_name && !UNKNOWN.includes(p.style_name) && (
              <Link href={`/style/${slugifyFacet(p.style_name)}`} className={DETAIL_PILL_LINK_CLASS}>
                {p.style_name}
              </Link>
            )}
            {p.medium_name && !UNKNOWN.includes(p.medium_name) && (
              <Link
                href={`/medium/${slugifyFacet(p.medium_name)}`}
                className={DETAIL_PILL_LINK_CLASS}
              >
                {p.medium_name}
              </Link>
            )}
            {p.canvas_name && !UNKNOWN.includes(p.canvas_name) && (
              <Link
                href={`/canvas/${slugifyFacet(p.canvas_name)}`}
                className={DETAIL_PILL_LINK_CLASS}
              >
                {p.canvas_name}
              </Link>
            )}
            {p.canvas_width && p.canvas_height && (
              <span className={DETAIL_PILL_CLASS}>
                {p.canvas_width} × {p.canvas_height} cm
              </span>
            )}
            {p.framed && (
              <span className={DETAIL_PILL_CLASS}>Framed</span>
            )}
          </div>

          {/* Color swatches */}
          {p.colors && (p.colors as { hex: string; name: string }[]).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {(p.colors as { hex: string; name: string }[]).map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-gray-700 cursor-default"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {p.tags && (p.tags as string[]).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(p.tags as string[])
                .filter((t) => !UNKNOWN.includes(t))
                .map((t, i) => (
                  <span key={i} className={DETAIL_PILL_CLASS}>
                    {t}
                  </span>
                ))}
            </div>
          )}

          {/* CTA */}
          <DetailInquiryCta title={title} slug={slug} />
          </div>
        </div>

        {/* Full-width scrollers row (independent from main image/details row) */}
        <div className="px-[20px] mt-8">
          <PaintingScroller title="More by this artist" paintingId={paintingId} relatedType="artist" />
          <PaintingScroller title="Similar style" paintingId={paintingId} relatedType="style" />
        </div>
      </div>
    </div>
  );
}
