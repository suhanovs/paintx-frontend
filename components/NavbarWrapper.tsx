"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar, { type SearchState } from "./Navbar";
import MobileSearchBar from "./MobileSearchBar";

const DEBOUNCE_MS = 700;

export default function NavbarWrapper() {
  const [pending, setPending] = useState<SearchState>({ query: "", status: "available" });
  const isFirstRender = useRef(true);

  const handleSearch = useCallback((state: SearchState) => {
    setPending(state);
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
      <Navbar onSearch={handleSearch} />
      <MobileSearchBar onSearch={handleSearch} />
    </>
  );
}
