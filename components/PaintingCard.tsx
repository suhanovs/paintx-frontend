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
          className="relative flex flex-col gap-3 p-4 bg-gray-900/20 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-900/40"
          style={{ borderRadius: "10px" }}
        >
          {/* Price badge */}
          {painting.export_price && painting.export_price > 0 && (
            <div className="absolute left-7 top-7 z-20 bg-gray-900/60 backdrop-blur-sm px-2 py-1 rounded-md">
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
            className="absolute right-7 top-7 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-gray-900/50 backdrop-blur-sm transition-colors hover:bg-gray-900/80"
          >
            <Icon
              icon="solar:heart-bold"
              width={16}
              className={isLiked ? "text-red-400" : "text-gray-300"}
            />
          </button>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mid}
            alt={painting.title || painting.title_ru || "Painting"}
            className="w-full aspect-square object-cover rounded-lg cursor-pointer select-none"
            onClick={() => {
              // Desktop: open lightbox; mobile: tap goes to Details link
              if (window.innerWidth > 640) setIsModalOpen(true);
            }}
            onDoubleClick={() => setIsLiked((v) => !v)}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            loading="lazy"
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          />

          {/* Info */}
          <div className="flex flex-col gap-2 px-1" style={{ userSelect: "none" }}>
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm font-medium text-gray-200 leading-snug">
                {painting.title || painting.title_ru}
              </h3>
              {painting.artist_name && (
                <p className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
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
                <span className="px-2.5 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">
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
