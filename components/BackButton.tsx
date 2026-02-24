"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-lg border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all text-sm"
    >
      <Icon icon="mdi:arrow-left" width={16} />
      Gallery
    </button>
  );
}
