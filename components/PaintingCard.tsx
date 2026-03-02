"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import type { PaintingListItem } from "@/types";
import { midUrl, fullUrl, formatPrice } from "@/lib/api";
import { slugifyFacet } from "@/lib/facets";
import PaintingModal from "./PaintingModal";

interface PaintingCardProps {
  painting: PaintingListItem;
  initiallyLiked?: boolean;
}

const UNKNOWN = ["Unknown style", "Неизвестный стиль", "Unknown", "Неизвестно", ""];

const PaintingCard = React.forwardRef<HTMLDivElement, PaintingCardProps>(
  ({ painting, initiallyLiked = false }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(initiallyLiked);
    const [likesCount, setLikesCount] = useState<number>(painting.likes_count ?? 0);
    const router = useRouter();
    const mobileTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (initiallyLiked) setIsLiked(true);
    }, [initiallyLiked]);

    const getVisitorCookie = () => {
      const match = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("paintx_vid="));
      return match ? decodeURIComponent(match.substring("paintx_vid=".length)) : "";
    };

    const mid  = midUrl(painting.image_mid_res_filename);
    const full = fullUrl(painting.image_mid_res_filename);
    const isMobile = useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(max-width: 639px)").matches;
    }, []);
    // Prefer slug for SEO-friendly URLs; fall back to UUID for unpublished/edge cases
    const href = `/art/${painting.slug || painting.id}`;

    useEffect(() => {
      return () => {
        if (mobileTapTimeout.current) clearTimeout(mobileTapTimeout.current);
      };
    }, []);

    return (
      <>
        <div
          ref={ref}
          className="relative flex flex-col gap-3 p-1 sm:p-4 rounded-md transition-all ease-in-out sm:bg-gray-900/20"
          style={{ borderRadius: "10px", transition: "all 0.3s ease" }}
        >
          {/* Price badge — left-7 top-7 matches .ru */}
          {painting.price && painting.price > 0 && (
            <div className="absolute left-7 top-7 z-20 inline-flex h-7 items-center rounded-md bg-gray-800/60 px-2">
              <span className="text-xs font-medium leading-none text-white">
                {formatPrice(painting.price, painting.currency || "USD")}
              </span>
            </div>
          )}

          {/* Like button — right-7 top-7 matches .ru */}
          <button
            aria-label={isLiked ? "Liked" : "Like"}
            onClick={async (e) => {
              e.stopPropagation();
              if (isLiked) return;
              try {
                const res = await fetch(`/api/paintings/${painting.id}/like`, {
                  method: "POST",
                  headers: { "x-visitor-cookie": getVisitorCookie() },
                });
                if (!res.ok) return;
                const data = await res.json();
                setIsLiked(Boolean(data?.liked) || isLiked);
                if (typeof data?.likes_count === "number") setLikesCount(data.likes_count);
              } catch {
                // no-op
              }
            }}
            className="absolute right-7 top-7 z-20 flex items-center justify-center min-w-7 h-7 px-1 rounded-full bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-colors gap-1"
          >
            <Icon
              icon="solar:heart-bold"
              width={16}
              className={isLiked ? "text-red-400" : "text-gray-300"}
            />
            {likesCount > 0 && <span className="text-[10px] text-gray-200">{likesCount}</span>}
          </button>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mid}
            alt={painting.title || painting.title_ru || "Painting"}
            className="w-full h-full object-cover aspect-square rounded-md sm:rounded-lg cursor-pointer select-none"
            onClick={() => {
              if (isMobile) return;
              setIsModalOpen(true);
            }}
            onTouchEnd={() => {
              if (!isMobile) return;
              if (mobileTapTimeout.current) {
                clearTimeout(mobileTapTimeout.current);
                mobileTapTimeout.current = null;
                if (isLiked) return;
                void fetch(`/api/paintings/${painting.id}/like`, {
                  method: "POST",
                  headers: { "x-visitor-cookie": getVisitorCookie() },
                })
                  .then((res) => (res.ok ? res.json() : null))
                  .then((data) => {
                    if (data?.liked) setIsLiked(true);
                    if (typeof data?.likes_count === "number") setLikesCount(data.likes_count);
                  })
                  .catch(() => undefined);
                return;
              }

              mobileTapTimeout.current = setTimeout(() => {
                mobileTapTimeout.current = null;
                sessionStorage.setItem("galleryScrollPos", window.scrollY.toString());
                void fetch(`/api/paintings/${painting.id}/details-click`, {
                  method: "POST",
                  keepalive: true,
                  headers: { "x-visitor-cookie": getVisitorCookie() },
                }).catch(() => undefined);
                router.push(href);
              }, 260);
            }}
            onDoubleClick={() => {
              if (!isMobile) setIsLiked((v) => !v);
            }}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            loading="lazy"
          />

          {/* Info */}
          <div className="flex flex-col gap-2 px-1">
            {/* Title + artist */}
            <div className="flex items-start justify-between gap-1">
              {isMobile ? (
                <Link
                  href={href}
                  onClick={() => {
                    sessionStorage.setItem("galleryScrollPos", window.scrollY.toString());
                    void fetch(`/api/paintings/${painting.id}/details-click`, {
                      method: "POST",
                      keepalive: true,
                      headers: { "x-visitor-cookie": getVisitorCookie() },
                    }).catch(() => undefined);
                  }}
                  className="text-sm font-medium text-gray-300 leading-snug"
                >
                  {painting.title || painting.title_ru}
                </Link>
              ) : (
                <h3 className="text-sm font-medium text-gray-300 leading-snug">
                  {painting.title || painting.title_ru}
                </h3>
              )}
              {painting.artist_name && (
                isMobile ? (
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{painting.artist_name}</span>
                ) : (
                  <Link
                    href={`/artist/${slugifyFacet(painting.artist_name)}`}
                    className="inline-flex items-center rounded-full px-3 py-1 border border-gray-600 bg-gray-700/40 text-gray-300 text-xs font-medium transition-colors hover:bg-gray-700/60 hover:text-gray-200 whitespace-nowrap flex-shrink-0"
                    aria-label={`Filter by artist ${painting.artist_name}`}
                  >
                    {painting.artist_name}
                  </Link>
                )
              )}
            </div>

            {/* Chips */}
            <div className="flex items-start flex-wrap gap-2 mt-1">
              {painting.style_name && !UNKNOWN.includes(painting.style_name) && (
                <Link
                  href={`/style/${slugifyFacet(painting.style_name)}`}
                  className="hidden sm:inline-flex items-center rounded-full px-3 py-1 border border-gray-600 bg-gray-700/40 text-gray-300 text-xs font-medium transition-colors hover:bg-gray-700/60 hover:text-gray-200"
                  aria-label={`Filter by style ${painting.style_name}`}
                >
                  {painting.style_name}
                </Link>
              )}
              {painting.canvas_width && painting.canvas_height && (
                <span className="hidden sm:inline-flex items-center rounded-full px-3 py-1 border border-gray-600 bg-gray-700/40 text-gray-300 text-xs font-medium">
                  {painting.canvas_width}×{painting.canvas_height} cm
                </span>
              )}
            </div>

            {/* Description */}
            {painting.description && (
              <Link
                href={href}
                onClick={() => {
                  sessionStorage.setItem("galleryScrollPos", window.scrollY.toString());
                  void fetch(`/api/paintings/${painting.id}/details-click`, {
                    method: "POST",
                    keepalive: true,
                    headers: { "x-visitor-cookie": getVisitorCookie() },
                  }).catch(() => undefined);
                }}
                className="text-sm text-gray-500 leading-snug line-clamp-2 mt-1 block"
              >
                {painting.description}
              </Link>
            )}

            {!isMobile && (
              <div className="mt-2">
                <Link
                  href={href}
                  onClick={() => {
                    sessionStorage.setItem("galleryScrollPos", window.scrollY.toString());
                    void fetch(`/api/paintings/${painting.id}/details-click`, {
                      method: "POST",
                      keepalive: true,
                      headers: { "x-visitor-cookie": getVisitorCookie() },
                    }).catch(() => undefined);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors border border-gray-600 bg-gray-700/40 text-gray-300 text-sm hover:bg-gray-700/60"
                >
                  Details
                  <Icon icon="mdi:eye-outline" width={16} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <PaintingModal
            src={full}
            alt={painting.title || painting.title_ru || "Painting"}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </>
    );
  }
);

PaintingCard.displayName = "PaintingCard";

export default PaintingCard;
