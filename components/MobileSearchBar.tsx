"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import type { SearchState, SearchStatus, SortOrder } from "./Navbar";
import { getEnabledContactIcons } from "@/lib/contactIcons";

interface MobileSearchBarProps {
  onSearch?: (state: SearchState) => void;
  initialState?: SearchState;
}

export default function MobileSearchBar({ onSearch, initialState }: MobileSearchBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");

  const [query, setQuery] = useState(initialState?.query ?? "");
  const [status, setStatus] = useState<SearchStatus>(initialState?.status ?? "available");
  const [sort, setSort] = useState<SortOrder>(initialState?.sort ?? "newest");

  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const prevY = useRef(0);
  const prevDir = useRef<"up" | "down">("up");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const hasEmail = getEnabledContactIcons().some((i) => i.key === "email");

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

  const hidden = scrollDir === "down";

  useEffect(() => {
    if (hidden) {
      searchInputRef.current?.blur();
      emailInputRef.current?.blur();
    }
  }, [hidden]);

  useEffect(() => {
    if ((searchOpen || contactOpen) && prevDir.current === "down" && scrollDir === "up") {
      searchInputRef.current?.blur();
      emailInputRef.current?.blur();
      setSearchOpen(false);
      setContactOpen(false);
    }
    prevDir.current = scrollDir;
  }, [scrollDir, searchOpen, contactOpen]);

  const ensureVisitorCookie = () => {
    const name = "paintx_vid=";
    const existing = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(name));
    if (existing) return decodeURIComponent(existing.substring(name.length));
    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
    document.cookie = `paintx_vid=${encodeURIComponent(id)}; Path=/; Max-Age=315360000; SameSite=Lax; Secure`;
    return id;
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    if (!initialState) return;
    setQuery(initialState.query);
    setStatus(initialState.status);
    setSort(initialState.sort);
  }, [initialState]);

  const submitContact = async () => {
    setBusy(true);
    setOk(false);
    try {
      const res = await fetch("/api/contact/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-visitor-cookie": ensureVisitorCookie(),
        },
        body: JSON.stringify({ email, comment }),
      });
      if (!res.ok) throw new Error("submit failed");
      setOk(true);
      setContactOpen(false);
      setEmail("");
      setComment("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="sm:hidden fixed top-4 left-1/2 z-50 transition-transform duration-500"
      style={{
        transform: `translateX(-50%) translateY(${hidden ? (searchOpen || contactOpen ? "-130%" : "-5rem") : "0"})`,
      }}
    >
      {!searchOpen && !contactOpen && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setContactOpen(false);
              setSearchOpen(true);
            }}
            className="bg-gray-800/60 text-white w-10 h-10 rounded-2xl shadow-md flex items-center justify-center backdrop-blur-lg transition-transform transform hover:scale-110"
            aria-label="Open search"
          >
            <Icon icon="mdi:magnify" width={22} height={22} />
          </button>

          {hasEmail && (
            <button
              onClick={() => {
                setSearchOpen(false);
                setEmail("");
                setComment("");
                setContactOpen(true);
              }}
              className="bg-gray-800/60 text-white w-10 h-10 rounded-2xl shadow-md flex items-center justify-center backdrop-blur-lg transition-transform transform hover:scale-110"
              aria-label="Contact gallery"
            >
              <Icon icon="mdi:email-outline" width={22} height={22} />
            </button>
          )}
        </div>
      )}

      {searchOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-md">
          <div className="backdrop-blur-lg bg-gray-800/60 shadow-md rounded-2xl px-4 py-3 space-y-2 border border-gray-700/60">
            <div className="flex h-11 items-center rounded-full border border-gray-600 bg-gray-700/40 px-3 gap-2">
              <Icon icon="fluent:search-20-regular" className="text-gray-400 flex-shrink-0" width={20} />
              <input
                ref={searchInputRef}
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

            <div className="flex justify-center pt-1">
              <button
                onClick={() => {
                  searchInputRef.current?.blur();
                  setSearchOpen(false);
                }}
                className="w-10 h-1.5 rounded-full bg-gray-500/70 hover:bg-gray-400/80 transition-colors"
                aria-label="Collapse search panel"
              />
            </div>
          </div>
        </div>
      )}

      {contactOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-md">
          <div className="backdrop-blur-lg bg-gray-800/60 shadow-md rounded-2xl px-4 py-3 space-y-3 border border-gray-700/60">
            <p className="text-white text-sm font-medium">Contact the gallery</p>
            <p className="text-gray-400 text-sm">
              Share your email and note. Tip: like paintings you ask about so we can narrow options quickly.
            </p>

            <input
              ref={emailInputRef}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-full border border-gray-600 bg-gray-700/40 px-4 text-white placeholder-gray-400 outline-none text-[16px]"
            />
            <textarea
              placeholder="Short comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-gray-600 bg-gray-700/40 px-4 py-3 text-white placeholder-gray-400 outline-none text-[16px]"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  emailInputRef.current?.blur();
                  setContactOpen(false);
                  setEmail("");
                  setComment("");
                }}
                className="h-10 px-4 rounded-full border border-gray-600 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitContact}
                disabled={busy || !emailValid || !comment.trim()}
                className="h-10 px-4 rounded-full bg-red-500/80 text-white disabled:opacity-40"
              >
                {ok ? "Sent" : busy ? "Sending..." : "Send"}
              </button>
            </div>

            <div className="flex justify-center pt-1">
              <button
                onClick={() => {
                  emailInputRef.current?.blur();
                  setContactOpen(false);
                  setEmail("");
                  setComment("");
                }}
                className="w-10 h-1.5 rounded-full bg-gray-500/70 hover:bg-gray-400/80 transition-colors"
                aria-label="Collapse contact panel"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
