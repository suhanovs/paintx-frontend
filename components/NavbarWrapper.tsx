"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar, { type SearchState } from "./Navbar";
import MobileSearchBar from "./MobileSearchBar";

const DEBOUNCE_MS = 700;

export default function NavbarWrapper() {
  const [pending, setPending] = useState<SearchState>({ query: "", status: "available", sort: "newest" });
  const [urlState, setUrlState] = useState<SearchState>({ query: "", status: "available", sort: "newest" });
  const isFirstRender = useRef(true);

  const handleSearch = useCallback((state: SearchState) => {
    setPending(state);
  }, []);

  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search") ?? "";
      const statusParam = params.get("status");
      const sortParam = params.get("sort");
      const status =
        statusParam === "sold" || statusParam === "all" || statusParam === "liked"
          ? statusParam
          : "available";
      const sort = sortParam === "oldest" ? "oldest" : "newest";
      const next = { query, status, sort } as SearchState;
      setUrlState(next);
      setPending(next);
    };

    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const t = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("paintx:search", { detail: pending }));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [pending]);

  return (
    <>
      <Navbar onSearch={handleSearch} initialState={urlState} />
      <MobileSearchBar onSearch={handleSearch} initialState={urlState} />
    </>
  );
}
