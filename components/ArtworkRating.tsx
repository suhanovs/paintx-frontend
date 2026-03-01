"use client";

import { useMemo, useState } from "react";

interface RatingItem {
  title?: string;
  criterion?: string;
  score?: number;
  value?: number;
  reason?: string;
  comment?: string;
  rarity?: number;
  complexity?: number;
  quality?: number;
  appreciation?: number;
  description?: string;
}

export default function ArtworkRating({ notesRu }: { notesRu: string }) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(notesRu);
      if (Array.isArray(parsed)) return parsed as RatingItem[];
      if (parsed && typeof parsed === "object" && Array.isArray((parsed as { ratings?: unknown[] }).ratings)) {
        return (parsed as { ratings: RatingItem[] }).ratings;
      }
      return [];
    } catch {
      return [];
    }
  }, [notesRu]);

  if (!items.length) return null;

  const normalized = items.map((it, i) => {
    const scoreCandidates = [it.score, it.value, it.rarity, it.complexity, it.quality, it.appreciation]
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));
    const raw = scoreCandidates.length ? scoreCandidates[0] : 0;

    const name =
      it.title ||
      it.criterion ||
      (it.rarity != null ? "Rarity" : undefined) ||
      (it.complexity != null ? "Complexity" : undefined) ||
      (it.quality != null ? "Quality" : undefined) ||
      (it.appreciation != null ? "Appreciation" : undefined) ||
      `Criterion ${i + 1}`;

    const score = Math.max(0, Math.min(10, Number.isFinite(raw) ? raw : 0));
    return {
      name,
      score,
      pct: (score / 10) * 100,
      note: it.reason || it.comment || it.description || "",
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
