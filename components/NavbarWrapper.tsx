"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar, { type SearchState } from "./Navbar";
import MobileSearchBar from "./MobileSearchBar";

const DEBOUNCE_MS = 700;

export default function NavbarWrapper({ initialState }: { initialState?: SearchState }) {
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  const urlState = useMemo<SearchState>(() => {
    const query = searchParams.get("search") ?? initialState?.query ?? "";
    const statusParam = searchParams.get("status") ?? initialState?.status;
    const sortParam = searchParams.get("sort") ?? initialState?.sort;
    const status =
      statusParam === "sold" || statusParam === "all" || statusParam === "liked"
        ? statusParam
        : "available";
    const sort = sortParam === "oldest" ? "oldest" : "newest";
    return { query, status, sort };
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
      pending.sort === urlState.sort
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
      <Navbar onSearch={handleSearch} initialState={urlState} />
      <MobileSearchBar onSearch={handleSearch} initialState={urlState} />
    </>
  );
}
