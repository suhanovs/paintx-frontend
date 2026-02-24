"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { PaintingListItem } from "@/types";
import { midUrl, fullUrl, formatPrice } from "@/lib/api";
import PaintingModal from "./PaintingModal";

interface PaintingCardProps {
  painting: PaintingListItem;
}

const UNKNOWN = ["Unknown style", "Неизвестный стиль", "Unknown", "Неизвестно", ""];

const PaintingCard = React.forwardRef<HTMLDivElement, PaintingCardProps>(
  ({ painting }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const mid  = midUrl(painting.image_mid_res_filename);
    const full = fullUrl(painting.image_mid_res_filename);

    return (
      <>
        <div
          ref={ref}
          className="relative flex flex-col gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
        >
          {/* Price badge */}
          {painting.export_price && painting.export_price > 0 && (
            <div className="absolute left-6 top-6 z-20 bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded-md">
              <span className="text-white text-xs font-medium">
                {formatPrice(painting.export_price, "USD")}
              </span>
            </div>
          )}

          {/* Heart / Like button */}
          <button
            aria-label={isLiked ? "Unlike" : "Like"}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked((v) => !v);
            }}
            className="absolute right-6 top-6 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <Icon
              icon="solar:heart-bold"
              width={18}
              className={isLiked ? "text-red-500" : "text-white/60"}
            />
          </button>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mid}
            alt={painting.title || painting.title_ru || "Painting"}
            className="w-full aspect-square object-cover rounded-lg cursor-pointer select-none"
            onClick={() => {
              // Desktop: open lightbox. Mobile: navigate to detail page (via Details link below).
              if (window.innerWidth > 640) setIsModalOpen(true);
            }}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            loading="lazy"
          />

          {/* Info */}
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-100 leading-snug">
                {painting.title || painting.title_ru}
              </h3>
              {painting.artist_name && (
                <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {painting.artist_name}
                </p>
              )}
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5">
              {painting.style_name && !UNKNOWN.includes(painting.style_name) && (
                <span className="px-2.5 py-0.5 bg-gray-800 text-white rounded-full text-xs">
                  {painting.style_name}
                </span>
              )}
              {painting.canvas_width && painting.canvas_height && (
                <span className="px-2.5 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs">
                  {painting.canvas_width}×{painting.canvas_height} cm
                </span>
              )}
            </div>

            {/* Details link */}
            <div className="mt-1">
              <Link
                href={`/art/${painting.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Details
                <Icon icon="mdi:eye-outline" width={16} />
              </Link>
            </div>
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
