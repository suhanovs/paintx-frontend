"use client";

import { useCallback } from "react";
import Navbar, { type SearchState } from "./Navbar";
import MobileSearchBar from "./MobileSearchBar";

export default function NavbarWrapper() {
  const handleSearch = useCallback((state: SearchState) => {
    window.dispatchEvent(new CustomEvent("paintx:search", { detail: state }));
  }, []);

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <MobileSearchBar onSearch={handleSearch} />
    </>
  );
}
