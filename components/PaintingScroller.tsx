"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { RelatedPainting } from "@/types";
import { thumbUrl } from "@/lib/api";

interface PaintingScrollerProps {
  title: string;
  paintingId: string;   // UUID — used for the API call
  relatedType: "artist" | "style";
}

export default function PaintingScroller({
  title,
  paintingId,
  relatedType,
}: PaintingScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paintings, setPaintings] = useState<RelatedPainting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/paintings/${paintingId}/related/${relatedType}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPaintings(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paintingId, relatedType]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
    };
    el.addEventListener("scroll", update);
    update();
    return () => el.removeEventListener("scroll", update);
  }, [paintings]);

  const showEmpty = !isLoading && paintings.length === 0;

  return (
    <div className="relative w-full mt-8 min-h-[188px]">
      <h2 className="text-sm font-medium text-gray-400 mb-4">{title}</h2>
      <div className="relative h-36 rounded-lg bg-gray-900/20">
        {isLoading ? (
          <div className="h-36 flex items-center justify-center bg-gray-900/40 rounded-lg">
            <div className="w-7 h-7 border-4 border-t-transparent border-white rounded-full animate-spin" />
          </div>
        ) : showEmpty ? (
          <div className="h-36" aria-hidden="true" />
        ) : (
          <div
            ref={containerRef}
            className="flex h-36 overflow-x-auto gap-3 snap-x snap-mandatory scrollbar-hide"
          >
            {paintings.map((p) => (
              <Link
                key={p.id}
                href={`/art/${p.slug || p.id}`}
                className="snap-center flex-none w-36 h-36 overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl(p.image_thumbnail_filename)}
                  alt={p.title || ""}
                  className="object-cover w-full h-full"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </Link>
            ))}
          </div>
        )}

        {canLeft && (
          <button
            onClick={() =>
              containerRef.current?.scrollBy({ left: -200, behavior: "smooth" })
            }
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white z-10"
          >
            <Icon icon="mdi:chevron-left" width={24} height={24} />
          </button>
        )}
        {canRight && (
          <button
            onClick={() =>
              containerRef.current?.scrollBy({ left: 200, behavior: "smooth" })
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white z-10"
          >
            <Icon icon="mdi:chevron-right" width={24} height={24} />
          </button>
        )}
      </div>
    </div>
  );
}
