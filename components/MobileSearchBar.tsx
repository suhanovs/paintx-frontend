"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import type { SearchState, SearchStatus, SortOrder } from "./Navbar";

interface MobileSearchBarProps {
  onSearch?: (state: SearchState) => void;
}

export default function MobileSearchBar({ onSearch }: MobileSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("available");
  const [sort, setSort] = useState<SortOrder>("newest");
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

  const emit = (nextQuery: string, nextStatus: SearchStatus, nextSort: SortOrder) => {
    if (onSearch) onSearch({ query: nextQuery, status: nextStatus, sort: nextSort });
  };

  const toggle = () => {
    setIsOpen((v) => !v);
  };

  const hidden = scrollDir === "down";

  return (
    <div
      className="sm:hidden fixed top-4 left-1/2 z-50 transition-transform duration-500"
      style={{
        transform: `translateX(-50%) translateY(${hidden ? "-5rem" : "0"})`,
      }}
    >
      {!isOpen ? (
        <button
          onClick={toggle}
          className="bg-gray-800/60 text-white p-3 rounded-full shadow-md flex items-center justify-center backdrop-blur-lg transition-transform transform hover:scale-110"
        >
          <Icon icon="mdi:magnify" width={28} height={28} />
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-md">
          <div className="backdrop-blur-lg bg-gray-800/60 shadow-md rounded-2xl px-4 py-3 space-y-2">
            <div className="flex justify-center pb-1">
              <button
                onClick={toggle}
                className="w-10 h-1.5 rounded-full bg-gray-500/70 hover:bg-gray-400/80 transition-colors"
                aria-label="Collapse search panel"
                title="Collapse"
              />
            </div>

            <div className="flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 px-3 gap-2">
              <Icon icon="fluent:search-20-regular" className="text-gray-400 flex-shrink-0" width={20} />
              <input
                type="text"
                placeholder="Description, artist, style..."
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  emit(v, status, sort);
                }}
                autoFocus
                className="flex-grow bg-transparent text-white outline-none placeholder-gray-400 focus:placeholder-transparent text-[16px]"
              />
              <button
                onClick={() => {
                  setQuery("");
                  emit("", status, sort);
                }}
                className={`text-gray-400 hover:text-white transition-opacity ${query ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                aria-label="Clear search"
              >
                <Icon icon="mdi:close-circle" width={20} height={20} />
              </button>
            </div>
            <div className="inline-flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 p-0.5 text-sm w-fit">
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
                      emit(query, value, sort);
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

            <div className="inline-flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 p-0.5 text-sm w-fit">
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
                      emit(query, status, value);
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
          </div>
        </div>
      )}
    </div>
  );
}
