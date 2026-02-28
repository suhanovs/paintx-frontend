"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import type { SearchState } from "./Navbar";

interface MobileSearchBarProps {
  onSearch?: (state: SearchState) => void;
}

export default function MobileSearchBar({ onSearch }: MobileSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [query, setQuery] = useState("");
  const [soldOnly, setSoldOnly] = useState(false);
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

  const emit = (nextQuery: string, nextSoldOnly: boolean) => {
    if (onSearch) onSearch({ query: nextQuery, soldOnly: nextSoldOnly });
  };

  const toggle = () => {
    if (isOpen) {
      setQuery("");
      setSoldOnly(false);
      emit("", false);
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
                  emit(v, soldOnly);
                }}
                autoFocus
                className="flex-grow bg-transparent text-white outline-none placeholder-gray-400 text-sm"
              />
              <button onClick={toggle} className="ml-2 text-gray-400 hover:text-white flex-shrink-0">
                <Icon icon="mdi:close" width={24} height={24} />
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={soldOnly}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSoldOnly(checked);
                  emit(query, checked);
                }}
                className="accent-gray-200"
              />
              Sold only
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
