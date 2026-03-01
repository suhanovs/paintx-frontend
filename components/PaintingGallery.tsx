"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PaintingListItem } from "@/types";
import PaintingCard from "./PaintingCard";
import type { SearchState } from "./Navbar";

interface PaintingGalleryProps {
  initialPaintings: PaintingListItem[];
  initialPage: number;
  totalPages: number;
  initialSearchState?: SearchState;
}

const PAGE_SIZE = 30;
const DESKTOP_MEDIA = "(min-width: 1024px)";

export default function PaintingGallery({
  initialPaintings,
  initialPage,
  totalPages,
  initialSearchState,
}: PaintingGalleryProps) {
  const [paintings, setPaintings] = useState<PaintingListItem[]>(initialPaintings);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const [searchState, setSearchState] = useState<SearchState>(
    initialSearchState ?? { query: "", status: "available", sort: "newest" },
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [isDesktop, setIsDesktop] = useState(false);
  const [totalPagesState, setTotalPagesState] = useState(totalPages);
  const router = useRouter();
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
      setTotalPagesState(1);
      isFetching.current = false;

      const params = new URLSearchParams();
      params.set("page", "1");
      if (detail.query) params.set("search", detail.query);
      if (detail.status !== "available") params.set("status", detail.status);
      if (detail.sort !== "newest") params.set("sort", detail.sort);
      router.replace(`/?${params.toString()}`, { scroll: false });
    };
    window.addEventListener("paintx:search", handler);
    return () => window.removeEventListener("paintx:search", handler);
  }, [router]);

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
      setTotalPagesState(Math.max(1, Number(data.pages) || 1));
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

  const totalKnownPages = useMemo(() => Math.max(totalPagesState, page, 1), [page, totalPagesState]);
  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalKnownPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [page, totalKnownPages]);

  const buildPageHref = useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      if (searchState.query) params.set("search", searchState.query);
      if (searchState.status !== "available") params.set("status", searchState.status);
      if (searchState.sort !== "newest") params.set("sort", searchState.sort);
      const q = params.toString();
      return q ? `/?${q}` : "/";
    },
    [searchState],
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

      {totalKnownPages > 1 && (
        <div className="hidden lg:flex items-center justify-center gap-2 py-8 flex-wrap">
          {page > 1 ? (
            <Link
              href={buildPageHref(page - 1)}
              className="rounded-full px-3 py-2 transition-colors border border-gray-600 bg-gray-700/40 text-gray-300 text-sm"
            >
              Prev
            </Link>
          ) : (
            <span className="rounded-full px-3 py-2 border border-gray-600 bg-gray-700/20 text-gray-500 text-sm">Prev</span>
          )}

          {visiblePages.map((pNum) => {
            const active = pNum === page;
            return (
              <Link
                key={pNum}
                href={buildPageHref(pNum)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 transition-colors border border-gray-600 text-sm ${
                  active ? "bg-red-500/25 text-red-200" : "bg-gray-700/40 text-gray-300"
                }`}
              >
                {pNum}
              </Link>
            );
          })}

          {page < totalKnownPages ? (
            <Link
              href={buildPageHref(page + 1)}
              className="rounded-full px-3 py-2 transition-colors border border-gray-600 bg-gray-700/40 text-gray-300 text-sm"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full px-3 py-2 border border-gray-600 bg-gray-700/20 text-gray-500 text-sm">Next</span>
          )}
        </div>
      )}
    </div>
  );
}
