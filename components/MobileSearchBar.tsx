"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import type { SearchState, SearchStatus } from "./Navbar";

interface MobileSearchBarProps {
  onSearch?: (state: SearchState) => void;
}

export default function MobileSearchBar({ onSearch }: MobileSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("available");
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

  const emit = (nextQuery: string, nextStatus: SearchStatus) => {
    if (onSearch) onSearch({ query: nextQuery, status: nextStatus });
  };

  const toggle = () => {
    if (isOpen) {
      setQuery("");
      setStatus("available");
      emit("", "available");
    }
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
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search paintings, artist, style..."
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  emit(v, status);
                }}
                autoFocus
                className="flex-grow bg-transparent text-white outline-none placeholder-gray-400 text-sm"
              />
              <button onClick={toggle} className="ml-2 text-gray-400 hover:text-white flex-shrink-0">
                <Icon icon="mdi:close" width={24} height={24} />
              </button>
            </div>
            <div className="inline-flex items-center rounded-full border border-gray-600 bg-gray-700/40 p-0.5 text-xs w-fit">
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
                      emit(query, value);
                    }}
                    className={`rounded-full px-2 py-1 transition-colors ${
                      active ? "bg-emerald-500/25 text-emerald-200" : "text-gray-300"
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
