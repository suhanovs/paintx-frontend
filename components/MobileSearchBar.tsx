"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

interface MobileSearchBarProps {
  onSearch?: (query: string) => void;
}

export default function MobileSearchBar({ onSearch }: MobileSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggle = () => {
    if (isOpen && onSearch) onSearch(""); // clear on close
    setIsOpen((v) => !v);
  };

  const hidden = scrollDir === "down";

  return (
    // Mobile only
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
        <div className="w-[calc(100vw-2rem)] max-w-sm">
          <div className="flex items-center backdrop-blur-lg bg-gray-800/60 shadow-md rounded-full px-4 py-3">
            <input
              type="text"
              placeholder="Search paintings..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              autoFocus
              className="flex-grow bg-transparent text-white outline-none placeholder-gray-400 text-sm"
            />
            <button onClick={toggle} className="ml-2 text-gray-400 hover:text-white flex-shrink-0">
              <Icon icon="mdi:close" width={24} height={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
