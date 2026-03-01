"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { PaintingListItem } from "@/types";
import PaintingCard from "./PaintingCard";
import type { SearchState } from "./Navbar";

interface PaintingGalleryProps {
  initialPaintings: PaintingListItem[];
  initialPage: number;
  totalPages: number;
}

const PAGE_SIZE = 30;
const DESKTOP_MEDIA = "(min-width: 1024px)";

export default function PaintingGallery({
  initialPaintings,
  initialPage,
  totalPages,
}: PaintingGalleryProps) {
  const [paintings, setPaintings] = useState<PaintingListItem[]>(initialPaintings);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const [searchState, setSearchState] = useState<SearchState>({ query: "", status: "available", sort: "newest" });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [isDesktop, setIsDesktop] = useState(false);
  const isFetching = useRef(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SearchState>).detail;
      setSearchState(detail);
      setPage(1);
      setPaintings([]);
      setHasMore(true);
      isFetching.current = false;
    };
    window.addEventListener("paintx:search", handler);
    return () => window.removeEventListener("paintx:search", handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const getVisitorCookie = () => {
    const name = "paintx_vid=";
    const existing = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(name));
    if (existing) return decodeURIComponent(existing.substring(name.length));

    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
      .toString()
      .replace(/\s+/g, "");
    document.cookie = `paintx_vid=${encodeURIComponent(id)}; Path=/; Max-Age=315360000; SameSite=Lax; Secure`;
    return id;
  };

  useEffect(() => {
    const visitorCookie = getVisitorCookie();
    fetch("/api/visitor/likes", { headers: { "x-visitor-cookie": visitorCookie } })
      .then((r) => (r.ok ? r.json() : { liked_painting_ids: [] }))
      .then((data) => {
        const ids = Array.isArray(data?.liked_painting_ids) ? data.liked_painting_ids : [];
        setLikedIds(new Set(ids));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (paintings.length === 0) return;
    try {
      sessionStorage.setItem("galleryPaintings", JSON.stringify(paintings));
      sessionStorage.setItem("galleryPage", String(page));
      sessionStorage.setItem("galleryHasMore", String(hasMore));
      sessionStorage.setItem("gallerySearch", searchState.query);
      sessionStorage.setItem("galleryStatus", searchState.status);
      sessionStorage.setItem("gallerySort", searchState.sort);
    } catch {}
  }, [paintings, page, hasMore, searchState]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("galleryScrollPos");
    if (!savedScroll) return;

    const raw = sessionStorage.getItem("galleryPaintings");
    if (raw) {
      try {
        const restoredPaintings: PaintingListItem[] = JSON.parse(raw);
        const restoredPage = parseInt(sessionStorage.getItem("galleryPage") ?? "1", 10);
        const restoredHasMore = sessionStorage.getItem("galleryHasMore") !== "false";
        const restoredSearch = sessionStorage.getItem("gallerySearch") ?? "";
        const restoredStatus = (sessionStorage.getItem("galleryStatus") ?? "available") as SearchState["status"];
        const restoredSort = (sessionStorage.getItem("gallerySort") ?? "newest") as SearchState["sort"];
        setPaintings(restoredPaintings);
        setPage(restoredPage);
        setHasMore(restoredHasMore);
        setSearchState({ query: restoredSearch, status: restoredStatus, sort: restoredSort });
        isFetching.current = false;
      } catch {}
    }

    const scrollPos = parseInt(savedScroll, 10);
    sessionStorage.removeItem("galleryScrollPos");
    setTimeout(() => window.scrollTo({ top: scrollPos, behavior: "instant" }), 150);
  }, []);

  const fetchMore = useCallback(async (nextPage: number, state: SearchState, append: boolean) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(PAGE_SIZE),
      });
      if (state.query) params.set("search", state.query);
      params.set("status", state.status);
      params.set("sort", state.sort);

      const res = await fetch(`/api/paintings?${params}`, {
        headers: { "x-visitor-cookie": getVisitorCookie() },
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPaintings((prev) => (append ? [...prev, ...data.items] : data.items));
      setPage(nextPage);
      setHasMore(nextPage < data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      isFetching.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (paintings.length === 0 && hasMore && !isFetching.current) {
      fetchMore(1, searchState, false);
    }
  }, [searchState, paintings.length, hasMore, fetchMore]);

  const setLastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      lastCardRef.current = node;
      if (!node || !hasMore || isDesktop) return;
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetching.current && hasMore) {
            fetchMore(page + 1, searchState, true);
          }
        },
        { rootMargin: "200px" },
      );
      observer.current.observe(node);
    },
    [hasMore, isDesktop, page, searchState, fetchMore],
  );

  const totalKnownPages = useMemo(() => Math.max(totalPages, page, 1), [page, totalPages]);
  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalKnownPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [page, totalKnownPages]);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalKnownPages || nextPage === page || isLoading) return;
      fetchMore(nextPage, searchState, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [fetchMore, isLoading, page, searchState, totalKnownPages],
  );

  return (
    <div className="relative min-h-screen">
      <div className="w-full px-2 py-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {paintings.map((painting, index) => {
          const isLast = index === paintings.length - 1;
          return (
            <PaintingCard
              key={painting.id}
              painting={painting}
              initiallyLiked={likedIds.has(painting.id)}
              ref={!isDesktop && isLast ? setLastCardRef : null}
            />
          );
        })}
      </div>

      {isLoading && !isDesktop && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      )}

      {!isDesktop && !hasMore && paintings.length > 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">All {paintings.length} paintings loaded</p>
      )}

      {isDesktop && totalKnownPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8 flex-wrap">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isLoading}
            className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium whitespace-nowrap disabled:opacity-40"
          >
            Prev
          </button>

          {visiblePages.map((pNum) => (
            <button
              key={pNum}
              onClick={() => goToPage(pNum)}
              disabled={isLoading}
              className={
                pNum === page
                  ? "px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium whitespace-nowrap"
                  : "px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium whitespace-nowrap disabled:opacity-40"
              }
            >
              {pNum}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalKnownPages || isLoading}
            className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium whitespace-nowrap disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
