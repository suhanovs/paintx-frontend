"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

const TELEGRAM_URL = "https://t.me/+79119690469";
const YOUTUBE_URL  = "https://youtu.be/tHY3NkSewy8";
const WHATSAPP_URL = "https://wa.me/79119690469";
const MAPS_URL     = "https://yandex.ru/maps/org/paintx/49452764850";

export default function MobileBottomBar() {
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const prevY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > prevY.current && y > 50) setScrollDir("down");
      else if (y < prevY.current) setScrollDir("up");
      prevY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = scrollDir === "down";

  return (
    // Mobile only — floating pill at bottom-center, matches .ru original exactly
    <div
      className="sm:hidden fixed bottom-4 left-1/2 z-50 flex space-x-4 backdrop-blur-lg bg-gray-800/60 p-3 rounded-2xl shadow-2xl transition-transform duration-500"
      style={{
        transform: `translateX(-50%) translateY(${hidden ? "5rem" : "0"})`,
      }}
    >
      <button
        onClick={() => window.open(TELEGRAM_URL, "_blank")}
        className="bg-blue-500 text-white p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 hover:bg-blue-400"
      >
        <Icon icon="simple-icons:telegram" width={24} height={24} />
      </button>
      <button
        onClick={() => window.open(YOUTUBE_URL, "_blank")}
        className="bg-red-500 text-white p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 hover:bg-red-400"
      >
        <Icon icon="simple-icons:youtube" width={24} height={24} />
      </button>
      <button
        onClick={() => window.open(WHATSAPP_URL, "_blank")}
        className="bg-green-500 text-white p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 hover:bg-green-400"
      >
        <Icon icon="simple-icons:whatsapp" width={24} height={24} />
      </button>
      <button
        onClick={() => window.open(MAPS_URL, "_blank")}
        className="bg-yellow-500 text-white p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 hover:bg-yellow-400"
      >
        <Icon icon="mdi:map-marker" width={24} height={24} />
      </button>
    </div>
  );
}
