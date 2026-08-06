import { ItemCard } from "@/components/item-card";
import { formatDuration } from "@/lib/format";
import type { Category, Day, DayType } from "@/types/trip";

const typeLabels: Record<DayType, string> = {
  active: "Full day",
  free: "Free day",
  commute: "Drive day",
};

const typeStyles: Record<DayType, string> = {
  active: "border-hairline bg-raised text-ink",
  free: "border-hairline bg-transparent text-muted",
  commute: "border-highway/30 bg-highway/10 text-highway",
};

/**
 * A day, rendered by type. Free and commute days stay deliberately light —
 * the trip's unrushed pace is a feature, not empty space to fill.
 */
export function DayCard({
  day,
  categories,
  visibleCategoryIds,
}: {
  day: Day;
  categories: Record<string, Category>;
  /** When set, only items in these categories render. */
  visibleCategoryIds?: string[];
}) {
  const shown = (categoryId: string) => !visibleCategoryIds || visibleCategoryIds.includes(categoryId);
  const blocks = (day.blocks ?? []).filter((block) => shown(block.item.categoryId));
  const freeMenu = (day.freeMenu ?? []).filter((item) => shown(item.categoryId));
  // A day whose every item was filtered out disappears; a day that never had
  // items (a drive day) stays.
  const filteredOut = Boolean(
    visibleCategoryIds &&
      blocks.length === 0 &&
      freeMenu.length === 0 &&
      ((day.blocks?.length ?? 0) > 0 || (day.freeMenu?.length ?? 0) > 0),
  );

  if (filteredOut) return null;

  return (
    <section id={`day-${day.dayNumber}`} className="scroll-mt-20">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline bg-surface font-mono text-sm font-semibold">
          {day.dayNumber}
        </span>
        <h3 className="font-display text-xl leading-tight font-semibold">{day.label}</h3>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${typeStyles[day.type]}`}
        >
          {typeLabels[day.type]}
        </span>
      </header>

      <p className="mt-2 pl-12 text-sm leading-relaxed text-muted">{day.summary}</p>

      <div className="mt-4 space-y-3 pl-0 sm:pl-12">
        {day.type === "active" &&
          blocks.map((block) => (
            <ItemCard
              key={block.item.id}
              item={block.item}
              category={categories[block.item.categoryId]}
              timing={block}
            />
          ))}

        {day.type === "free" && (
          <>
            <p className="rounded-xl border border-dashed border-hairline bg-surface/50 p-4 text-sm text-muted">
              Nothing is scheduled today, on purpose. Sleep in, do laundry, wander.
              {freeMenu.length > 0 && " If you want something, here's a menu — pick none, pick all."}
            </p>
            {freeMenu.map((item) => (
              <ItemCard key={item.id} item={item} category={categories[item.categoryId]} />
            ))}
          </>
        )}

        {day.type === "commute" && day.commute && (
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
            <div className="flex items-center gap-3 border-b border-hairline bg-raised px-4 py-3">
              <span className="font-display text-base font-semibold">{day.commute.from}</span>
              <span aria-hidden className="text-muted">
                →
              </span>
              <span className="font-display text-base font-semibold">{day.commute.to}</span>
              <span className="ml-auto shrink-0 text-xs text-muted">
                {formatDuration(day.commute.driveTimeMins)} drive
              </span>
            </div>

            <div className="space-y-4 p-4">
              {day.commute.scenicNote && (
                <p className="text-sm leading-relaxed text-muted">
                  <span className="font-semibold text-ink">Scenic route: </span>
                  {day.commute.scenicNote}
                </p>
              )}

              {day.commute.stopsAlongWay?.length ? (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">Stops along the way</p>
                  <ul className="mt-2 space-y-3">
                    {day.commute.stopsAlongWay.map((stop) => (
                      <li key={stop.title} className="border-l-2 border-hairline pl-3">
                        {stop.mapLink ? (
                          <a
                            href={stop.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-highway underline decoration-dotted underline-offset-4"
                          >
                            {stop.title} <span aria-hidden>↗</span>
                          </a>
                        ) : (
                          <p className="text-sm font-medium">{stop.title}</p>
                        )}
                        <p className="mt-0.5 text-sm text-muted">{stop.blurb}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
