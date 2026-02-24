"use client";

import { useCallback } from "react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const handleSearch = useCallback((query: string) => {
    window.dispatchEvent(
      new CustomEvent("paintx:search", { detail: query })
    );
  }, []);

  return <Navbar onSearch={handleSearch} />;
}
