import { tierDescriptions, tierLabels } from "@/lib/format";
import type { Tier } from "@/types/trip";

const styles: Record<Tier, string> = {
  anchor: "border-accent bg-accent text-canvas",
  mid: "border-hairline bg-raised text-ink",
  low: "border-hairline bg-transparent text-muted",
};

/** Anchors must stand out — they're the reason a stop is on the map at all. */
export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      title={tierDescriptions[tier]}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${styles[tier]}`}
    >
      {tierLabels[tier]}
    </span>
  );
}
