import { formatPrice } from "@/lib/api";

interface Props {
  min: number;
  max: number;
  current: number;
  count: number;
  currency?: string;
}

export default function ArtistPriceRange({ min, max, current, count, currency = "USD" }: Props) {
  if (count <= 1) return null;
  if (!(min >= 0 && max > min && current >= 0)) return null;

  const clamped = Math.min(max, Math.max(min, current));
  const percent = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-700/40 text-gray-300 px-3 py-1 text-xs font-medium whitespace-nowrap max-w-full">
      <span className="text-gray-200">{formatPrice(min, currency)}</span>
      <div className="relative w-20 h-1.5 rounded-full bg-gray-500/60 flex-shrink-0" aria-hidden>
        <div className="absolute inset-y-0 left-0 rounded-full bg-gray-200/90" style={{ width: `${percent}%` }} />
        <div className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white" style={{ left: `${percent}%` }} />
      </div>
      <span className="text-gray-200">{formatPrice(max, currency)}</span>
    </div>
  );
}
