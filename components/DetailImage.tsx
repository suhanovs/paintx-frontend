"use client";

import { useState } from "react";
import PaintingModal from "./PaintingModal";

interface DetailImageProps {
  mid: string;
  full: string;
  alt: string;
}

export default function DetailImage({ mid, full, alt }: DetailImageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mid}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-2xl object-contain cursor-zoom-in select-none"
        onClick={() => setModalOpen(true)}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
      {modalOpen && (
        <PaintingModal src={full} alt={alt} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
