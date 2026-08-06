import { CategoryBadge } from "@/components/category-badge";
import { TierBadge } from "@/components/tier-badge";
import { formatDuration, formatTimeSpan, mapUrl } from "@/lib/format";
import type { Block, Category, Item } from "@/types/trip";

/**
 * One activity. `item.id` is the stable seam future progress-tracking hangs
 * off — it's rendered as the element id, never derived from list position.
 */
export function ItemCard({
  item,
  category,
  timing,
}: {
  item: Item;
  category?: Category;
  timing?: Pick<Block, "start" | "end" | "slot">;
}) {
  const span = timing ? formatTimeSpan(timing) : "";
  const isAnchor = item.tier === "anchor";

  return (
    <article
      id={item.id}
      className={`scroll-mt-20 overflow-hidden rounded-xl border bg-surface ${
        isAnchor ? "border-accent/40 shadow-sm" : "border-hairline"
      }`}
    >
      <div className="flex">
        <div
          aria-hidden
          className="w-1.5 shrink-0"
          style={{ backgroundColor: category?.color ?? "var(--color-hairline)" }}
        />
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            {span && <p className="font-mono text-xs tracking-tight text-muted">{span}</p>}
            <p className="ml-auto text-xs text-muted">{formatDuration(item.durationMins)}</p>
          </div>

          <h4 className="mt-1 font-display text-lg leading-snug font-semibold">{item.title}</h4>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {category && <CategoryBadge category={category} />}
            <TierBadge tier={item.tier} />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">{item.blurb}</p>

          {item.gear?.length ? (
            <p className="mt-3 text-xs text-muted">
              <span className="font-semibold text-ink">Bring:</span> {item.gear.join(" · ")}
            </p>
          ) : null}

          <a
            href={mapUrl(item.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-highway underline decoration-dotted underline-offset-4"
          >
            {item.location.name}
            <span aria-hidden>↗</span>
          </a>
          {item.location.address && <p className="text-xs text-muted">{item.location.address}</p>}
        </div>
      </div>
    </article>
  );
}
