"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { PaintingListItem } from "@/types";
import PaintingCard from "./PaintingCard";
import type { SearchState } from "./Navbar";

interface PaintingGalleryProps {
  initialPaintings: PaintingListItem[];
  initialPage: number;
  totalPages: number;
}

export default function PaintingGallery({
  initialPaintings,
  initialPage,
  totalPages,
}: PaintingGalleryProps) {
  const [paintings, setPaintings] = useState<PaintingListItem[]>(initialPaintings);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const [searchState, setSearchState] = useState<SearchState>({ query: "", soldOnly: false });
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
    if (paintings.length === 0) return;
    try {
      sessionStorage.setItem("galleryPaintings", JSON.stringify(paintings));
      sessionStorage.setItem("galleryPage", String(page));
      sessionStorage.setItem("galleryHasMore", String(hasMore));
      sessionStorage.setItem("gallerySearch", searchState.query);
      sessionStorage.setItem("gallerySoldOnly", String(searchState.soldOnly));
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
        const restoredSoldOnly = sessionStorage.getItem("gallerySoldOnly") === "true";
        setPaintings(restoredPaintings);
        setPage(restoredPage);
        setHasMore(restoredHasMore);
        setSearchState({ query: restoredSearch, soldOnly: restoredSoldOnly });
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
        limit: "12",
      });
      if (state.query) params.set("search", state.query);
      if (state.soldOnly) params.set("sold_only", "true");

      const res = await fetch(`/api/paintings?${params}`);
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
      if (!node || !hasMore) return;
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
    [hasMore, page, searchState, fetchMore],
  );

  return (
    <div className="relative min-h-screen">
      <div className="w-full px-2 py-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {paintings.map((painting, index) => {
          const isLast = index === paintings.length - 1;
          return <PaintingCard key={painting.id} painting={painting} ref={isLast ? setLastCardRef : null} />;
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && paintings.length > 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">All {paintings.length} paintings loaded</p>
      )}
    </div>
  );
}
