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
    const [isLiked, setIsLiked]         = useState(false);

    const mid  = midUrl(painting.image_mid_res_filename);
    const full = fullUrl(painting.image_mid_res_filename);

    return (
      <>
        <div
          ref={ref}
          // bg-gray-900 bg-opacity-20 matches .ru desktop card exactly — nearly transparent on black bg
          className="relative flex flex-col gap-3 p-4 bg-gray-900 bg-opacity-20 rounded-md transition-all ease-in-out"
          style={{ borderRadius: "10px", transition: "all 0.3s ease" }}
        >
          {/* Price badge — left-7 top-7 matches .ru */}
          {painting.export_price && painting.export_price > 0 && (
            <div className="absolute left-7 top-7 z-20 bg-gray-800/60 px-2 py-1 rounded-md">
              <span className="text-white text-xs font-medium">
                {formatPrice(painting.export_price, "USD")}
              </span>
            </div>
          )}

          {/* Like button — right-7 top-7 matches .ru */}
          <button
            aria-label={isLiked ? "Unlike" : "Like"}
            onClick={(e) => { e.stopPropagation(); setIsLiked((v) => !v); }}
            className="absolute right-7 top-7 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/70 transition-colors"
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
            className="w-full h-full object-cover aspect-square rounded-lg cursor-pointer select-none"
            onClick={() => setIsModalOpen(true)}
            onDoubleClick={() => setIsLiked((v) => !v)}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            loading="lazy"
          />

          {/* Info */}
          <div className="flex flex-col gap-2 px-1">
            {/* Title + artist */}
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm font-medium text-gray-300 leading-snug">
                {painting.title || painting.title_ru}
              </h3>
              {painting.artist_name && (
                <p className="text-xs font-medium text-gray-300 whitespace-nowrap flex-shrink-0">
                  {painting.artist_name}
                </p>
              )}
            </div>

            {/* Chips — px-3 py-1 matches .ru */}
            <div className="flex items-start flex-wrap gap-2 mt-1">
              {painting.style_name && !UNKNOWN.includes(painting.style_name) && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-medium">
                  {painting.style_name}
                </span>
              )}
              {painting.canvas_width && painting.canvas_height && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                  {painting.canvas_width}×{painting.canvas_height} cm
                </span>
              )}
            </div>

            {/* Description — line-clamp-2, text-gray-500, matches .ru text-default-500 */}
            {painting.description && (
              <p className="text-sm text-gray-500 leading-snug line-clamp-2 mt-1">
                {painting.description}
              </p>
            )}

            {/* Details button — bg-gray-800 flat button matches .ru */}
            <div className="mt-2">
              <Link
                href={`/art/${painting.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
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
