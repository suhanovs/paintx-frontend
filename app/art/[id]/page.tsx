import type { Metadata } from "next";
import {
  fetchPaintingDetailServer,
  midUrl,
  fullUrl,
  formatPrice,
} from "@/lib/api";
import PaintingScroller from "@/components/PaintingScroller";
import DetailImage from "@/components/DetailImage";
import Link from "next/link";
import type { PaintingDetail } from "@/types";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const p: PaintingDetail = await fetchPaintingDetailServer(id);
    const mid = midUrl(p.image_mid_res_filename);
    return {
      title: `${p.title || p.title_ru || "Painting"} — PaintX`,
      description: p.description || p.description_ru || "",
      openGraph: {
        title: p.title || p.title_ru || "Painting",
        description: p.description || "",
        images: mid ? [{ url: mid }] : [],
      },
    };
  } catch {
    return { title: "Painting — PaintX" };
  }
}

const UNKNOWN = ["Unknown", "Неизвестно", "Unknown style", "Неизвестный стиль", ""];

export default async function PaintingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let p: PaintingDetail;
  try {
    p = await fetchPaintingDetailServer(id);
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back nav */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back to gallery
        </Link>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-10 max-w-7xl mx-auto">
        {/* Left: Image + related scrollers */}
        <div className="lg:w-3/5">
          <DetailImage mid={mid} full={full} alt={title} />
          <PaintingScroller title="More by this artist" paintingId={id} relatedType="artist" />
          <PaintingScroller title="Similar style"       paintingId={id} relatedType="style"  />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-5 lg:w-2/5">
          <h1 className="text-3xl font-bold">
            {title}
            {p.year && p.year > 0 ? `, ${p.year}` : ""}
          </h1>

          {/* Price */}
          <div className="text-xl font-semibold text-gray-200">{price}</div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {p.availability && (
              <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">
                {p.availability}
              </span>
            )}
            {p.style_name && !UNKNOWN.includes(p.style_name) && (
              <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">
                {p.style_name}
              </span>
            )}
            {p.medium_name && !UNKNOWN.includes(p.medium_name) && (
              <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">
                {p.medium_name}
              </span>
            )}
            {p.canvas_name && !UNKNOWN.includes(p.canvas_name) && (
              <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm">
                {p.canvas_name}
              </span>
            )}
            {p.canvas_width && p.canvas_height && (
              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                {p.canvas_width} × {p.canvas_height} cm
              </span>
            )}
            {p.framed && (
              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                Framed
              </span>
            )}
          </div>

          {/* Description */}
          {p.description && (
            <p className="text-sm text-gray-300 leading-relaxed">{p.description}</p>
          )}

          {/* Color swatches */}
          {p.colors && p.colors.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {p.colors.map((c, i) => (
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
          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.tags
                .filter((t) => !UNKNOWN.includes(t))
                .map((t, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs">
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
