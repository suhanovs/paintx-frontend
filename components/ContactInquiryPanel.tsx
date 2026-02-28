"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  mobile?: boolean;
}

export default function ContactInquiryPanel({ open, onClose, mobile = false }: Props) {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  if (!open) return null;

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
        onClose();
        setEmail("");
        setComment("");
        setOk(false);
      }, 700);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50" onClick={onClose}>
      <div
        className={
          mobile
            ? "absolute bottom-0 left-0 right-0 rounded-t-2xl bg-gray-900 border-t border-gray-700 p-4"
            : "absolute left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-900 border border-gray-700 p-5"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-lg font-semibold">Contact the gallery</h3>
        <p className="text-gray-400 text-sm mt-1">
          Share your email and a short note. Tip: like paintings you ask about so we can quickly narrow options.
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-full border border-gray-600 bg-gray-700/40 px-4 text-white placeholder-gray-400 outline-none"
          />
          <textarea
            placeholder="Short comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-gray-600 bg-gray-700/40 px-4 py-3 text-white placeholder-gray-400 outline-none"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-full border border-gray-600 text-gray-300">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || !email || !comment}
            className="h-10 px-4 rounded-full bg-red-500/80 text-white disabled:opacity-40"
          >
            {ok ? "Sent" : busy ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
