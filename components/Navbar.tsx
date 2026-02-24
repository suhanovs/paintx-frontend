"use client";

import React, { useState, useCallback } from "react";
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

  // Desktop only — completely hidden on mobile
  return (
    <div className="hidden sm:block w-full">
      <nav className="fixed top-0 z-50 w-full bg-black shadow-lg border-b border-gray-800 px-4 h-20">
        <div className="flex items-center justify-between w-full h-full gap-6 max-w-screen-xl mx-auto">

          {/* Logo */}
          <div className="flex items-center px-2 flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.jpg"
                alt="PaintX"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Search bar — flex-grow, centered */}
          <div className="flex-grow relative">
            <div className="flex items-center bg-gray-900 rounded-full px-4 py-2.5 border border-gray-700 focus-within:border-gray-500 transition-colors">
              <Icon
                icon="fluent:search-20-regular"
                className="text-gray-400 flex-shrink-0 mr-2"
                width={24}
              />
              <input
                type="text"
                placeholder="Search paintings..."
                value={searchTerm}
                onChange={handleInputChange}
                className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-base"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <Icon icon="mdi:close-circle" width={20} />
                </button>
              )}
            </div>
          </div>

          {/* Contact buttons */}
          <div className="flex items-center gap-3 px-2 flex-shrink-0">
            {[
              { url: TELEGRAM_URL,    icon: "simple-icons:telegram", hover: "hover:bg-blue-500"   },
              { url: YOUTUBE_URL,     icon: "simple-icons:youtube",  hover: "hover:bg-red-500"    },
              { url: WHATSAPP_URL,    icon: "simple-icons:whatsapp", hover: "hover:bg-green-500"  },
              { url: YANDEX_MAPS_URL, icon: "mdi:map-marker",       hover: "hover:bg-yellow-500" },
            ].map(({ url, icon, hover }) => (
              <button
                key={icon}
                onClick={() => window.open(url, "_blank")}
                className={`bg-gray-700 text-white p-2 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 ${hover}`}
              >
                <Icon icon={icon} width={24} height={24} />
              </button>
            ))}
          </div>
        </div>
      </nav>
      {/* Spacer */}
      <div className="h-20" />
    </div>
  );
}
