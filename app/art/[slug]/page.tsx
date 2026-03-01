import type { Metadata } from "next";
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
import ArtistPriceRange from "@/components/ArtistPriceRange";
import ArtworkRating from "@/components/ArtworkRating";
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
    const title = p.title || p.title_ru || "Painting";
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
const DETAIL_PILL_CLASS = "px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium whitespace-nowrap";

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
  const price = formatPrice(p.export_price, "USD");
  const title = p.title || p.title_ru || "Untitled";
  const artistName = p.artist_name_en || p.artist_name;
  const artistBio  = p.artist_about_en || p.artist_about;
  // Keep UUID for related endpoints
  const paintingId = String(p.id);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Floating back button */}
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 pt-20 pb-3 w-full">
        {/* Left: Image + related scrollers */}
        <div className="lg:w-[65%] pl-[10px] pr-0">
          <DetailImage mid={mid} full={full} alt={title} />
          <PaintingScroller title="More by this artist" paintingId={paintingId} relatedType="artist" />
          <PaintingScroller title="Similar style"       paintingId={paintingId} relatedType="style"  />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-4 lg:w-[35%] pl-[10px] pr-[34px]">
          <h1 className="text-3xl font-bold">
            {title}
            {p.year && p.year > 0 ? `, ${p.year}` : ""}
          </h1>

          {/* Price */}
          <div className="text-xl font-semibold text-gray-200">{price}</div>

          {/* Status + condition + one-line range */}
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            {p.availability && (
              <span className={DETAIL_PILL_CLASS}>{p.availability}</span>
            )}
            {p.condition && !UNKNOWN.includes(p.condition) && (
              <span className={DETAIL_PILL_CLASS}>{p.condition}</span>
            )}
            <div className="flex-1 min-w-[180px] lg:min-w-[220px]">
              <ArtistPriceRange
                min={p.artist_min_price ?? 0}
                max={p.artist_max_price ?? 0}
                current={p.export_price ?? 0}
                count={p.artist_works_count ?? 0}
                currency="USD"
              />
            </div>
          </div>

          {/* Description */}
          {p.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{p.description}</p>
          )}

          {/* Evaluation */}
          {p.notes_ru && <ArtworkRating notesRu={p.notes_ru} />}

          {/* Attribute chips */}
          <div className="flex flex-wrap gap-2">
            {p.style_name && !UNKNOWN.includes(p.style_name) && (
              <span className={DETAIL_PILL_CLASS}>{p.style_name}</span>
            )}
            {p.medium_name && !UNKNOWN.includes(p.medium_name) && (
              <span className={DETAIL_PILL_CLASS}>{p.medium_name}</span>
            )}
            {p.canvas_name && !UNKNOWN.includes(p.canvas_name) && (
              <span className={DETAIL_PILL_CLASS}>{p.canvas_name}</span>
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

          {/* Artist */}
          {artistName && (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-base font-semibold text-white mb-2">{artistName}</p>
              {artistBio && (
                <p
                  className="text-sm text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: artistBio }}
                />
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={`https://t.me/+79119690469?text=${encodeURIComponent(`Hello! I'm interested in the painting "${title}". Can you tell me more?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
            >
              Inquire via Telegram
            </a>
            <a
              href={`https://wa.me/79119690469?text=${encodeURIComponent(`Hello! I'm interested in the painting "${title}". Can you tell me more?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
