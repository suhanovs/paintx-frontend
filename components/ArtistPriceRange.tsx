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
    <div className="w-full min-w-0">
      <div className="relative h-1.5 rounded-full bg-gray-700/80">
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border border-gray-200 bg-gray-100"
          style={{ left: `${percent}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
        <span>{formatPrice(min, currency)}</span>
        <span>{formatPrice(max, currency)}</span>
      </div>
    </div>
  );
}
