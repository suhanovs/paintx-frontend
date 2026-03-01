"use client";

import { useMemo, useState } from "react";

interface RatingItem {
  title?: string;
  criterion?: string;
  score?: number;
  value?: number;
  reason?: string;
  comment?: string;
}

export default function ArtworkRating({ notesRu }: { notesRu: string }) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(notesRu);
      return Array.isArray(parsed) ? (parsed as RatingItem[]) : [];
    } catch {
      return [];
    }
  }, [notesRu]);

  if (!items.length) return null;

  const normalized = items.map((it, i) => {
    const name = it.title || it.criterion || `Criterion ${i + 1}`;
    const raw = Number(it.score ?? it.value ?? 0);
    const score = Math.max(0, Math.min(10, Number.isFinite(raw) ? raw : 0));
    return {
      name,
      score,
      pct: (score / 10) * 100,
      note: it.reason || it.comment || "",
    };
  });

  const avg = normalized.reduce((acc, it) => acc + it.score, 0) / normalized.length;

  return (
    <div className="mt-3 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-300">Our opinion</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-600 transition-colors"
          aria-expanded={open}
          aria-label="Toggle detailed artwork evaluation"
        >
          {avg.toFixed(1)}/10 {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-2xl border border-gray-800 bg-gray-900/40 p-4 space-y-3">
          {normalized.map((it, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                <span>{it.name}</span>
                <span>{it.score.toFixed(1)}/10</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-700/70 overflow-hidden">
                <div className="h-full bg-gray-200" style={{ width: `${it.pct}%` }} />
              </div>
              {it.note && <p className="mt-1 text-xs text-gray-400 leading-relaxed">{it.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
