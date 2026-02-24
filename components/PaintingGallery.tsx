"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { PaintingListItem } from "@/types";
import PaintingCard from "./PaintingCard";

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
  const [search, setSearch] = useState("");
  const isFetching = useRef(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  // Listen for search events from Navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent<string>).detail;
      setSearch(query);
      setPage(1);
      setPaintings([]);
      setHasMore(true);
      isFetching.current = false;
    };
    window.addEventListener("paintx:search", handler);
    return () => window.removeEventListener("paintx:search", handler);
  }, []);

  // Restore scroll position when returning from a detail page
  useEffect(() => {
    const saved = sessionStorage.getItem("galleryScrollPos");
    if (saved) {
      sessionStorage.removeItem("galleryScrollPos");
      window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
    }
  }, []);

  const fetchMore = useCallback(
    async (nextPage: number, searchQuery: string, append: boolean) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: "12",
        });
        if (searchQuery) params.set("search", searchQuery);
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
    },
    []
  );

  // When paintings are cleared by a new search, fetch page 1
  useEffect(() => {
    if (paintings.length === 0 && hasMore && !isFetching.current) {
      fetchMore(1, search, false);
    }
  }, [search, paintings.length, hasMore, fetchMore]);

  // Set up intersection observer on last card
  const setLastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      lastCardRef.current = node;
      if (!node || !hasMore) return;
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetching.current && hasMore) {
            fetchMore(page + 1, search, true);
          }
        },
        { rootMargin: "200px" }
      );
      observer.current.observe(node);
    },
    [hasMore, page, search, fetchMore]
  );

  return (
    <div className="relative min-h-screen">
      {/* px-2 on mobile = 8px edge gap (close to screen edge, matches .ru)
          p-4 on sm+ = standard desktop padding
          gap-3 on mobile = tighter card spacing, gap-6 on sm+ */}
      <div className="w-full px-2 py-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {paintings.map((painting, index) => {
          const isLast = index === paintings.length - 1;
          return (
            <PaintingCard
              key={painting.id}
              painting={painting}
              ref={isLast ? setLastCardRef : null}
            />
          );
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && paintings.length > 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">
          All {paintings.length} paintings loaded
        </p>
      )}
    </div>
  );
}
