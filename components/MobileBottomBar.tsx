"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { getEnabledContactIcons } from "@/lib/contactIcons";

export default function MobileBottomBar() {
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [contactOpen, setContactOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
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
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async () => {
    setBusy(true);
    setOk(false);
    try {
      const res = await fetch("/api/contact/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, comment }),
      });
      if (!res.ok) throw new Error("submit failed");
      setOk(true);
      setTimeout(() => {
        setContactOpen(false);
        setEmail("");
        setComment("");
        setOk(false);
      }, 700);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {contactOpen && (
        <div
          className="sm:hidden fixed left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 transition-transform duration-500"
          style={{
            bottom: "5.6rem",
            transform: `translateX(-50%) translateY(${hidden ? "130%" : "0"})`,
          }}
        >
          <div className="backdrop-blur-lg bg-gray-800/60 shadow-2xl rounded-2xl p-4 space-y-3 border border-gray-700/60">
            <p className="text-white text-sm font-medium">Contact the gallery</p>
            <p className="text-gray-400 text-xs">
              Share your email and note. Tip: like paintings you ask about so we can narrow options quickly.
            </p>

            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-full border border-gray-600 bg-gray-700/40 px-4 text-white placeholder-gray-400 outline-none text-[16px]"
            />
            <textarea
              placeholder="Short comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-gray-600 bg-gray-700/40 px-4 py-3 text-white placeholder-gray-400 outline-none text-[16px]"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setContactOpen(false)}
                className="h-10 px-4 rounded-full border border-gray-600 text-gray-300"
              >
                Close
              </button>
              <button
                onClick={submit}
                disabled={busy || !emailValid || !comment.trim()}
                className="h-10 px-4 rounded-full bg-red-500/80 text-white disabled:opacity-40"
              >
                {ok ? "Sent" : busy ? "Sending..." : "Send"}
              </button>
            </div>

            <div className="flex justify-center pt-1">
              <button
                onClick={() => setContactOpen(false)}
                className="w-10 h-1.5 rounded-full bg-gray-500/70 hover:bg-gray-400/80 transition-colors"
                aria-label="Collapse contact panel"
              />
            </div>
          </div>
        </div>
      )}

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
            className={`text-white w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-110 ${buttonClass}`}
          >
            <Icon icon={icon} width={22} height={22} />
          </button>
        ))}
      </div>
    </>
  );
}
