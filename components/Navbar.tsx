"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const TELEGRAM_URL = "https://t.me/+79119690469";
const YOUTUBE_URL = "https://youtu.be/tHY3NkSewy8";
const WHATSAPP_URL = "https://wa.me/79119690469";
const YANDEX_MAPS_URL = "https://yandex.ru/maps/org/paintx/49452764850";

export type SearchStatus = "available" | "sold" | "all" | "liked";
export type SortOrder = "newest" | "oldest";

export interface SearchState {
  query: string;
  status: SearchStatus;
  sort: SortOrder;
}

interface NavbarProps {
  onSearch?: (state: SearchState) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<SearchStatus>("available");
  const [sort, setSort] = useState<SortOrder>("newest");

  const emitSearch = useCallback(
    (query: string, nextStatus: SearchStatus, nextSort: SortOrder) => {
      if (onSearch) onSearch({ query, status: nextStatus, sort: nextSort });
    },
    [onSearch],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchTerm(query);
      emitSearch(query, status, sort);
    },
    [emitSearch, status, sort],
  );

  const clearSearch = () => {
    setSearchTerm("");
    emitSearch("", status, sort);
  };

  // Desktop only — mobile has floating search icon + bottom pill
  return (
    <div className="hidden sm:block w-full">
      <nav className="fixed top-0 z-50 w-full bg-black shadow-lg border-b border-gray-800 px-4 h-20">
        <div className="relative w-full h-full">
          {/* Logo (desktop first to hide when narrowing) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center">
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

          {/* Filters + Search — truly centered in viewport */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none max-[999px]:hidden">
            <div className="pointer-events-auto w-full max-w-4xl flex items-center gap-2">
              <div className="inline-flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 p-0.5 text-sm whitespace-nowrap">
                {([
                  ["available", "Available"],
                  ["sold", "Sold"],
                  ["all", "All"],
                  ["liked", "Liked"],
                ] as const).map(([value, label]) => {
                  const active = status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatus(value);
                        emitSearch(searchTerm, value, sort);
                      }}
                      className={`rounded-full px-3 py-2 transition-colors ${
                        active ? "bg-red-500/25 text-red-200" : "text-gray-300"
                      }`}
                      aria-pressed={active}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="inline-flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 p-0.5 text-sm whitespace-nowrap">
                {([
                  ["newest", "Newest first"],
                  ["oldest", "Oldest first"],
                ] as const).map(([value, label]) => {
                  const active = sort === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSort(value);
                        emitSearch(searchTerm, status, value);
                      }}
                      className={`rounded-full px-3 py-2 transition-colors ${
                        active ? "bg-red-500/25 text-red-200" : "text-gray-300"
                      }`}
                      aria-pressed={active}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="block max-[1199px]:hidden w-[16rem] relative">
                <div className="flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 px-4 transition-colors gap-3">
                  <Icon
                    icon="fluent:search-20-regular"
                    className="text-gray-400 flex-shrink-0"
                    width={24}
                  />
                  <input
                    type="text"
                    placeholder="Description, artist, style..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="bg-transparent text-white placeholder-gray-400 focus:placeholder-transparent outline-none flex-1 text-sm"
                  />
                  <button
                    onClick={clearSearch}
                    className={`text-gray-400 hover:text-white transition-opacity ${searchTerm ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-label="Clear search"
                  >
                    <Icon icon="mdi:close-circle" width={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact buttons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 flex-shrink-0">
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
