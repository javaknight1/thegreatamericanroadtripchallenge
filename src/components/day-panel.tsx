import { DayHeader } from "@/components/day-header";
import { formatDuration, formatTimeSpan, mapUrl, tierLabels } from "@/lib/format";
import type { Block, Category, Day, Item } from "@/types/trip";

/**
 * One day, in full. Active days read as an hour-by-hour timeline; free days
 * present an optional menu that is explicitly optional; drive days show the
 * route and what's worth pulling over for.
 */
export function DayPanel({
  day,
  place,
  categories,
}: {
  day: Day;
  place: string;
  categories: Record<string, Category>;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <DayHeader day={day} place={place} />

      <p className="px-4 pt-4 text-[15px] font-medium text-ink sm:px-6">{day.summary}</p>

      {day.type === "active" && (
        <ol className="mt-2 px-4 pb-5 sm:px-6">
          {(day.blocks ?? []).map((block) => (
            <TimelineEntry key={block.item.id} block={block} category={categories[block.item.categoryId]} />
          ))}
        </ol>
      )}

      {day.type === "free" && <FreeDayBody day={day} categories={categories} />}

      {day.type === "commute" && day.commute && <CommuteBody commute={day.commute} />}
    </article>
  );
}

function TimelineEntry({ block, category }: { block: Block; category?: Category }) {
  const { item } = block;
  const isAnchor = item.tier === "anchor";
  const color = category?.color ?? "var(--color-muted)";

  return (
    <li
      className={`relative list-none border-b border-hairline py-3 pl-10 last:border-b-0 ${
        isAnchor ? "rounded-lg bg-gradient-to-r from-accent/8 to-transparent" : ""
      }`}
    >
      <span
        aria-hidden
        className="absolute top-4 left-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-surface"
        style={{ backgroundColor: color }}
      />
      <span aria-hidden className="absolute top-0 bottom-0 left-[13px] -z-10 w-0.5 bg-hairline" />

      <p className="font-mono text-[10.5px] font-bold tracking-wide text-muted">
        {formatTimeSpan(block)}
        <span className="ml-2 font-normal">· {formatDuration(item.durationMins)}</span>
      </p>

      <h4
        className={`mt-0.5 font-cond text-[17.5px] leading-tight font-bold uppercase ${
          isAnchor ? "text-rock" : "text-ink"
        }`}
      >
        {item.title}
        {category && (
          <span
            className="ml-2 inline-block rounded px-1.5 py-0.5 align-[2px] font-mono text-[8.5px] font-bold tracking-[0.14em] text-white uppercase"
            style={{ backgroundColor: category.color }}
          >
            {category.label}
          </span>
        )}
        {isAnchor && (
          <span className="ml-1.5 inline-block rounded bg-accent px-1.5 py-0.5 align-[2px] font-mono text-[8.5px] font-bold tracking-[0.14em] text-white uppercase">
            {tierLabels.anchor}
          </span>
        )}
      </h4>

      <p className="mt-1 text-[13.5px] text-ink-soft">{item.blurb}</p>

      {item.gear?.length ? (
        <p className="mt-1.5 font-mono text-[10.5px] tracking-wide text-muted uppercase">
          Bring: {item.gear.join(" · ")}
        </p>
      ) : null}

      <MapLink item={item} />
    </li>
  );
}

function MapLink({ item }: { item: Item }) {
  return (
    <a
      href={mapUrl(item.location)}
      target="_blank"
      rel="noopener noreferrer"
      className="pin-link mt-2 inline-flex flex-wrap items-center gap-1.5 border-b border-dashed border-accent pb-0.5 font-mono text-[11px] font-medium break-words text-accent"
    >
      {item.location.address ?? item.location.name}
    </a>
  );
}

function FreeDayBody({ day, categories }: { day: Day; categories: Record<string, Category> }) {
  const menu = day.freeMenu ?? [];

  return (
    <div className="px-4 pb-5 sm:px-6">
      <p className="mt-3 rounded-lg border border-dashed border-hairline bg-canvas p-4 text-sm text-muted">
        Nothing is scheduled today, on purpose. The pace of this trip depends on days like this one.
      </p>

      {menu.length > 0 && (
        <details className="mt-4 overflow-hidden rounded-xl border border-hairline bg-canvas">
          <summary className="flex cursor-pointer items-center gap-2.5 p-3.5 font-cond text-[15px] font-bold tracking-wider uppercase">
            <span className="rounded bg-sage px-2 py-0.5 font-mono text-[10px] tracking-widest text-white">
              {menu.length}
            </span>
            If you feel like it
          </summary>
          {menu.map((item) => {
            const category = categories[item.categoryId];
            return (
              <div key={item.id} className="border-t border-hairline p-3.5">
                <p className="font-cond text-[15.5px] font-bold uppercase">
                  {item.title}
                  {category && (
                    <span
                      className="ml-2 inline-block rounded px-1.5 py-0.5 align-[2px] font-mono text-[8.5px] font-bold tracking-[0.14em] text-white uppercase"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.label}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">{item.blurb}</p>
                <p className="mt-1 font-mono text-[10.5px] text-muted">{formatDuration(item.durationMins)}</p>
                <MapLink item={item} />
              </div>
            );
          })}
        </details>
      )}
    </div>
  );
}

function CommuteBody({ commute }: { commute: NonNullable<Day["commute"]> }) {
  return (
    <div className="px-4 pb-5 sm:px-6">
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-hairline bg-canvas px-4 py-3">
        <span className="font-cond text-base font-bold uppercase">{commute.from}</span>
        <span aria-hidden className="text-accent">
          ——▶
        </span>
        <span className="font-cond text-base font-bold uppercase">{commute.to}</span>
        <span className="ml-auto font-mono text-[11px] text-muted">
          {formatDuration(commute.driveTimeMins)}
        </span>
      </div>

      {commute.scenicNote && (
        <p className="mt-3 text-[13.5px] text-ink-soft">
          <span className="font-cond font-bold tracking-wide uppercase">Scenic route: </span>
          {commute.scenicNote}
        </p>
      )}

      {commute.stopsAlongWay?.length ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Stops along the way</p>
          <ul className="mt-2 space-y-3">
            {commute.stopsAlongWay.map((stop) => (
              <li key={stop.title} className="border-l-2 border-hairline pl-3">
                <p className="font-cond text-[15.5px] font-bold uppercase">{stop.title}</p>
                <p className="mt-0.5 text-[13px] text-ink-soft">{stop.blurb}</p>
                {stop.mapLink && (
                  <a
                    href={stop.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pin-link mt-1.5 inline-flex items-center gap-1.5 border-b border-dashed border-accent pb-0.5 font-mono text-[11px] text-accent"
                  >
                    Open in Maps
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
