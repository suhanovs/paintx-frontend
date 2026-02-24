"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";

interface PaintingModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function PaintingModal({
  src,
  alt,
  onClose,
}: PaintingModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-lg"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white p-2 rounded-full bg-black/60 hover:bg-gray-800 transition-colors"
        >
          <Icon icon="mdi:close" width={24} height={24} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="object-contain max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl"
          onContextMenu={(e) => e.preventDefault()}
          onClick={onClose}
          draggable={false}
        />
      </div>
    </div>
  );
}
