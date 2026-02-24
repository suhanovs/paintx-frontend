"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const TELEGRAM_URL = "https://t.me/+79119690469";
const YOUTUBE_URL = "https://youtu.be/tHY3NkSewy8";
const WHATSAPP_URL = "https://wa.me/79119690469";
const YANDEX_MAPS_URL = "https://yandex.ru/maps/org/paintx/49452764850";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");

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

  // Desktop only — mobile has its own floating search + bottom pill
  return (
    <div className="hidden sm:block w-full">
      <nav className="fixed top-0 z-50 w-full bg-black border-b border-gray-800 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 gap-4 max-w-screen-xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="PaintX"
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search — balanced, capped at max-w-xl */}
          <div className="flex-1 max-w-xl relative">
            <div className="flex items-center bg-gray-900 rounded-full px-4 py-2 border border-gray-700 focus-within:border-gray-500 transition-colors">
              <Icon
                icon="fluent:search-20-regular"
                className="text-gray-400 flex-shrink-0 mr-2"
                width={20}
              />
              <input
                type="text"
                placeholder="Search paintings..."
                value={searchTerm}
                onChange={handleInputChange}
                className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <Icon icon="mdi:close-circle" width={18} />
                </button>
              )}
            </div>
          </div>

          {/* Social buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => window.open(TELEGRAM_URL, "_blank")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <Icon icon="simple-icons:telegram" width={20} height={20} />
            </button>
            <button
              onClick={() => window.open(YOUTUBE_URL, "_blank")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <Icon icon="simple-icons:youtube" width={20} height={20} />
            </button>
            <button
              onClick={() => window.open(WHATSAPP_URL, "_blank")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
            >
              <Icon icon="simple-icons:whatsapp" width={20} height={20} />
            </button>
            <button
              onClick={() => window.open(YANDEX_MAPS_URL, "_blank")}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-yellow-500 transition-colors"
            >
              <Icon icon="mdi:map-marker" width={20} height={20} />
            </button>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </div>
  );
}
