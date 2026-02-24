"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const TELEGRAM_URL    = "https://t.me/+79119690469";
const YOUTUBE_URL     = "https://youtu.be/tHY3NkSewy8";
const WHATSAPP_URL    = "https://wa.me/79119690469";
const YANDEX_MAPS_URL = "https://yandex.ru/maps/org/paintx/49452764850";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Hide navbar when scrolling down, reveal when scrolling up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchTerm(query);
      if (onSearch) onSearch(query);
    },
    [onSearch]
  );

  const clearSearch = () => {
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  return (
    <div className="w-full">
      <nav
        className="fixed top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-gray-800/60 shadow-lg transition-transform duration-300"
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="flex items-center h-14 px-4 gap-3 max-w-screen-xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="PaintX"
              width={110}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search — centered, capped width on desktop */}
          <div className="flex-1 max-w-md mx-auto relative">
            <div className="flex items-center bg-white/8 rounded-full px-3 py-1.5 border border-white/10 focus-within:border-white/30 transition-colors">
              <Icon
                icon="fluent:search-20-regular"
                className="text-gray-500 flex-shrink-0 mr-2"
                width={18}
              />
              <input
                type="text"
                placeholder="Search paintings..."
                value={searchTerm}
                onChange={handleInputChange}
                className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="text-gray-500 hover:text-white ml-1.5">
                  <Icon icon="mdi:close-circle" width={16} />
                </button>
              )}
            </div>
          </div>

          {/* Social buttons — desktop only */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            {[
              { url: TELEGRAM_URL,    icon: "simple-icons:telegram",  hover: "hover:bg-blue-600"   },
              { url: YOUTUBE_URL,     icon: "simple-icons:youtube",    hover: "hover:bg-red-600"    },
              { url: WHATSAPP_URL,    icon: "simple-icons:whatsapp",   hover: "hover:bg-green-600"  },
              { url: YANDEX_MAPS_URL, icon: "mdi:map-marker",         hover: "hover:bg-yellow-500" },
            ].map(({ url, icon, hover }) => (
              <button
                key={icon}
                onClick={() => window.open(url, "_blank")}
                className={`bg-white/8 text-gray-300 p-1.5 rounded-full transition-colors ${hover} hover:text-white`}
              >
                <Icon icon={icon} width={18} />
              </button>
            ))}
          </div>
        </div>
      </nav>
      {/* Spacer matching navbar height */}
      <div className="h-14" />
    </div>
  );
}
