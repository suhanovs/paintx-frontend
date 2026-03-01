interface RatingItem {
  title?: string;
  criterion?: string;
  score?: number;
  value?: number;
  reason?: string;
  comment?: string;
}

export default function ArtworkRating({ notesRu }: { notesRu: string }) {
  let items: RatingItem[] = [];
  try {
    const parsed = JSON.parse(notesRu);
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    return null;
  }

  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
      <h3 className="text-sm font-medium text-gray-200 mb-3">Artwork evaluation</h3>
      <div className="space-y-3">
        {items.map((it, i) => {
          const name = it.title || it.criterion || `Criterion ${i + 1}`;
          const raw = Number(it.score ?? it.value ?? 0);
          const score = Math.max(0, Math.min(10, Number.isFinite(raw) ? raw : 0));
          const pct = (score / 10) * 100;
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{name}</span>
                <span>{score.toFixed(1)}/10</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-700/70 overflow-hidden">
                <div className="h-full bg-gray-200" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
