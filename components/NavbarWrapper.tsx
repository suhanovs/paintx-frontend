"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar, { type SearchState } from "./Navbar";
import MobileSearchBar from "./MobileSearchBar";

const DEBOUNCE_MS = 350;

export default function NavbarWrapper() {
  const [pending, setPending] = useState<SearchState>({ query: "", soldOnly: false });

  const handleSearch = useCallback((state: SearchState) => {
    setPending(state);
  }, []);

  useEffect(() => {
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
