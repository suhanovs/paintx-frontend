"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const TELEGRAM_URL = "https://t.me/+79119690469";
const YOUTUBE_URL = "https://youtu.be/tHY3NkSewy8";
const WHATSAPP_URL = "https://wa.me/79119690469";
const YANDEX_MAPS_URL = "https://yandex.ru/maps/org/paintx/49452764850";

export interface SearchState {
  query: string;
  soldOnly: boolean;
}

interface NavbarProps {
  onSearch?: (state: SearchState) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [soldOnly, setSoldOnly] = useState(false);

  const emitSearch = useCallback(
    (query: string, sold: boolean) => {
      if (onSearch) onSearch({ query, soldOnly: sold });
    },
    [onSearch],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchTerm(query);
      emitSearch(query, soldOnly);
    },
    [emitSearch, soldOnly],
  );

  const clearSearch = () => {
    setSearchTerm("");
    emitSearch("", soldOnly);
  };

  // Desktop only — mobile has floating search icon + bottom pill
  return (
    <div className="hidden sm:block w-full">
      <nav className="fixed top-0 z-50 w-full bg-black shadow-lg border-b border-gray-800 px-4 h-20">
        {/* 3-column grid: logo left | search centered | buttons right */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center w-full h-full">
          {/* Logo */}
          <div className="flex items-center px-6">
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

          {/* Search — centered in the middle column */}
          <div className="flex justify-center px-4">
            <div className="w-full max-w-xl relative">
              <div className="flex items-center bg-zinc-800 rounded-xl px-4 py-2 transition-colors gap-3">
                <Icon
                  icon="fluent:search-20-regular"
                  className="text-gray-400 flex-shrink-0"
                  width={24}
                />
                <input
                  type="text"
                  placeholder="Search paintings, artist, style..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = !soldOnly;
                    setSoldOnly(next);
                    emitSearch(searchTerm, next);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-colors ${
                    soldOnly
                      ? "border-emerald-400/80 bg-emerald-500/20 text-emerald-200"
                      : "border-gray-600 bg-gray-700/40 text-gray-300"
                  }`}
                  aria-pressed={soldOnly}
                  aria-label="Toggle sold-only filter"
                  title="Show sold paintings only"
                >
                  <Icon icon={soldOnly ? "mdi:check-circle" : "mdi:circle-outline"} width={14} />
                  Sold
                </button>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-white"
                    aria-label="Clear search"
                  >
                    <Icon icon="mdi:close-circle" width={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contact buttons */}
          <div className="flex items-center gap-3 px-4 flex-shrink-0">
            {[
              {
                url: TELEGRAM_URL,
                icon: "simple-icons:telegram",
                hover: "hover:bg-blue-500",
              },
              {
                url: YOUTUBE_URL,
                icon: "simple-icons:youtube",
                hover: "hover:bg-red-500",
              },
              {
                url: WHATSAPP_URL,
                icon: "simple-icons:whatsapp",
                hover: "hover:bg-green-500",
              },
              {
                url: YANDEX_MAPS_URL,
                icon: "mdi:map-marker",
                hover: "hover:bg-yellow-500",
              },
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
      <div className="h-20" />
    </div>
  );
}
