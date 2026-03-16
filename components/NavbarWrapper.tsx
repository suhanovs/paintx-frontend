"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar, { type SearchState } from "./Navbar";
import MobileSearchBar from "./MobileSearchBar";
import type { SiteVariant } from "@/lib/siteVariant";

const DEBOUNCE_MS = 700;

export default function NavbarWrapper({ initialState, variant = "en" }: { initialState?: SearchState; variant?: SiteVariant }) {
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  const urlState = useMemo<SearchState>(() => {
    const query = searchParams.get("search") ?? initialState?.query ?? "";
    const statusParam = searchParams.get("status") ?? initialState?.status;
    const sortParam = searchParams.get("sort") ?? initialState?.sort;
    const minPriceRaw = searchParams.get("min_price");
    const strategyRaw = searchParams.get("strategy") ?? initialState?.strategy;
    const status =
      statusParam === "sold" || statusParam === "all" || statusParam === "liked"
        ? statusParam
        : "available";
    const allowedSorts = new Set(["newest", "oldest", "price_desc", "price_asc", "year_asc", "year_desc", "listing_oldest"]);
    const sort = allowedSorts.has((sortParam ?? "").toLowerCase())
      ? ((sortParam as string).toLowerCase() as SearchState["sort"])
      : "newest";
    const minPrice = minPriceRaw ? Number.parseInt(minPriceRaw, 10) : initialState?.minPrice;
    const strategy =
      strategyRaw === "top_sellers_available" || strategyRaw === "author_top_25" || strategyRaw === "author_bottom_25"
        ? strategyRaw
        : undefined;
    return { query, status, sort, minPrice: Number.isFinite(minPrice as number) ? minPrice : undefined, strategy };
  }, [initialState, searchParams]);

  const [pending, setPending] = useState<SearchState>(urlState);

  const handleSearch = useCallback((state: SearchState) => {
    setPending(state);
  }, []);

  useEffect(() => {
    setPending(urlState);
  }, [urlState]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      pending.query === urlState.query &&
      pending.status === urlState.status &&
      pending.sort === urlState.sort &&
      pending.minPrice === urlState.minPrice &&
      pending.strategy === urlState.strategy
    ) {
      return;
    }

    const t = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("paintx:search", { detail: pending }));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [pending, urlState]);

  return (
    <>
      <Navbar onSearch={handleSearch} initialState={urlState} variant={variant} />
      <MobileSearchBar onSearch={handleSearch} initialState={urlState} />
    </>
  );
}
