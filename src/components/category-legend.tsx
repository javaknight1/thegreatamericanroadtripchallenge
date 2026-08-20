import { categoryUsage } from "@/lib/derive";
import { tierDescriptions, tierLabels } from "@/lib/format";
import type { Category, Day, Region, Tier, Trip } from "@/types/trip";

/**
 * The key to the whole site.
 *
 * Every item on every page wears its category colour, and until now nothing
 * anywhere said what the colours *were* — the badge on an item names its own
 * category, but there was no way to see the set, or to know that a leg has
 * eleven `museums-history` items and one `festivals`. The brief asks for a
 * legend; this is it.
 *
 * It lists only what's actually in scope, with counts, so a region page shows
 * that leg's character rather than a fixed list of nineteen where half read
 * zero. `commuting` and `free-rest` are excluded everywhere: no authored item
 * can carry them (the renderer assigns them to drive and rest blocks), so they
 * would always read zero and look like holes.
 */
export function CategoryLegend({
  scope,
  categories,
  title = "The colour key",
  note,
}: {
  scope: Trip | Region | Day[];
  categories: Category[];
  title?: string;
  note?: string;
}) {
  const usage = categoryUsage(scope);
  const inScope = categories
    .filter((category) => (usage.get(category.id) ?? 0) > 0)
    .sort((a, b) => (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0));

  if (!inScope.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <div className="border-b border-hairline px-4 pt-4 pb-3 sm:px-5">
        <h2 className="font-display text-xl tracking-wide uppercase">{title}</h2>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted uppercase">
          {note ?? `${inScope.length} kinds of thing to do here`}
        </p>
      </div>

      <ul className="grid gap-x-4 px-4 py-3 sm:grid-cols-2 sm:px-5">
        {inScope.map((category) => (
          // min-w-0 on the grid child: without it a long label sets the track
          // width and pushes the page wider than the phone.
          <li key={category.id} className="flex min-w-0 items-baseline gap-2 py-1">
            <span
              aria-hidden
              className="size-2.5 shrink-0 translate-y-px rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
              {category.label}
            </span>
            <span className="shrink-0 font-mono text-[10.5px] text-muted tabular-nums">
              {usage.get(category.id)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-hairline bg-canvas px-4 py-3 sm:px-5">
        <p className="font-mono text-[10px] tracking-wide text-muted uppercase">
          And how much each one matters
        </p>
        <ul className="mt-2 space-y-1.5">
          {(["anchor", "mid", "low"] as Tier[]).map((tier) => (
            <li key={tier} className="flex items-baseline gap-2 text-[13px]">
              <TierMark tier={tier} />
              <span className="min-w-0 text-ink-soft">
                {tierDescriptions[tier]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The tier, as a mark rather than a word.
 *
 * `anchor` gets a filled accent chip, `mid` an outline, `low` nothing but a
 * dim label — deliberately, because the fix for three indistinguishable tiers
 * is to let the bottom one recede, not to make the middle one shout. Eight
 * hundred items in one voice is what made them unreadable in the first place.
 */
export function TierMark({ tier }: { tier: Tier }) {
  const base =
    "shrink-0 rounded px-1.5 py-0.5 font-mono text-[8.5px] font-bold tracking-[0.14em] uppercase";
  if (tier === "anchor") {
    return <span className={`${base} bg-accent text-white`}>{tierLabels.anchor}</span>;
  }
  if (tier === "mid") {
    return (
      <span className={`${base} border border-accent/45 text-accent`}>
        {tierLabels.mid}
      </span>
    );
  }
  return (
    <span className={`${base} border border-hairline text-muted`}>
      {tierLabels.low}
    </span>
  );
}
