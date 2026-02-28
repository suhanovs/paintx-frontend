"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { getEnabledContactIcons } from "@/lib/contactIcons";
import ContactInquiryPanel from "./ContactInquiryPanel";

export default function MobileBottomBar() {
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [contactOpen, setContactOpen] = useState(false);
  const prevY = useRef(0);
  const contactIcons = getEnabledContactIcons();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > prevY.current && y > 50) setScrollDir("down");
      else if (y < prevY.current) setScrollDir("up");
      prevY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = scrollDir === "down";

  return (
    // Mobile only — floating pill at bottom-center, matches .ru original exactly
    <div
      className="sm:hidden fixed bottom-4 left-1/2 z-50 flex space-x-4 backdrop-blur-lg bg-gray-800/60 p-3 rounded-2xl shadow-2xl transition-transform duration-500"
      style={{
        transform: `translateX(-50%) translateY(${hidden ? "5rem" : "0"})`,
      }}
    >
      {contactIcons.map(({ key, icon, url, buttonClass }) => (
        <button
          key={key}
          onClick={() => (key === "email" ? setContactOpen(true) : url && window.open(url, "_blank"))}
          className={`text-white p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 ${buttonClass}`}
        >
          <Icon icon={icon} width={24} height={24} />
        </button>
      ))}
      <ContactInquiryPanel open={contactOpen} onClose={() => setContactOpen(false)} mobile />
    </div>
  );
}
