import { formatPrice } from "@/lib/api";

interface Props {
  min: number;
  max: number;
  current: number;
  count: number;
  currency?: string;
}

export default function ArtistPriceRange({
  min,
  max,
  current,
  count,
  currency = "USD",
}: Props) {
  if (count <= 1) return null;
  if (!(min >= 0 && max > min && current >= 0)) return null;

  const clamped = Math.min(max, Math.max(min, current));
  const percent = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="hidden lg:block rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span>Artist price range</span>
        <span>{count} works</span>
      </div>

      <div className="relative h-2 rounded-full bg-gray-700/70">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border border-gray-200 bg-gray-100 shadow"
          style={{ left: `${percent}%` }}
          aria-hidden
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{formatPrice(min, currency)}</span>
        <span>{formatPrice(max, currency)}</span>
      </div>

      <div className="mt-2 text-sm text-gray-200">
        This artwork: <span className="font-medium">{formatPrice(current, currency)}</span>
      </div>
    </div>
  );
}
