"use client";

import { useMemo, useState } from "react";
import PaintingModal from "./PaintingModal";

interface DetailImageProps {
  mid: string;
  full: string;
  alt: string;
}

export default function DetailImage({ mid, full, alt }: DetailImageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mid}
        alt={alt}
        className="w-full h-auto rounded-none sm:rounded-lg shadow-2xl object-contain cursor-default sm:cursor-zoom-in select-none"
        onClick={() => {
          if (!isMobile) setModalOpen(true);
        }}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
      {modalOpen && (
        <PaintingModal src={full} alt={alt} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
