"use client";

import { useState } from "react";
import PaintingModal from "./PaintingModal";

interface DetailImageProps {
  mid: string;
  full: string;
  alt: string;
  width?: number | null;
  height?: number | null;
}

export default function DetailImage({ mid, full, alt, width, height }: DetailImageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const aspectRatio = width && height && width > 0 && height > 0 ? `${width} / ${height}` : "4 / 3";

  return (
    <>
      <div
        className="relative w-full rounded-lg shadow-2xl overflow-hidden bg-gray-900"
        style={{ aspectRatio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mid}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain cursor-zoom-in select-none"
          onClick={() => setModalOpen(true)}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </div>
      {modalOpen && (
        <PaintingModal src={full} alt={alt} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
