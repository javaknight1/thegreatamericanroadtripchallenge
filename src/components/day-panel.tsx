import { DayHeader } from "@/components/day-header";
import { dayExtras, dayTimeline, type TimelineEntry } from "@/lib/day-timeline";
import { TierMark } from "@/components/category-legend";
import { formatDuration, mapUrl, tint } from "@/lib/format";
import type { Category, Day, Item } from "@/types/trip";

/**
 * One day, in full — and every kind of event reads the same way.
 *
 * Driving and resting sit on the clock alongside everything else, because a
 * three-hour drive or a scheduled afternoon off consumes the day just as surely
 * as a museum does. What's *optional* — a free day's menu, the stops worth
 * pulling over for — sits below the timeline, so a day's commitments and its
 * suggestions never blur together.
 */

export function DayPanel({
  day,
  place,
  categories,
  withHeader = true,
}: {
  day: Day;
  place: string;
  categories: Record<string, Category>;
  /** Day pages lead with the header themselves, above the map. */
  withHeader?: boolean;
}) {
  const entries = dayTimeline(day, categories);
  const { freeTime, roadStops } = dayExtras(day, entries);

  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-surface">
      {withHeader && <DayHeader day={day} place={place} />}

      <p className="px-4 pt-4 text-[15px] font-medium text-ink sm:px-6">
        {day.summary}
      </p>

      <ol className="mt-2 px-4 pb-5 sm:px-6">
        {entries.map((entry) => (
          <TimelineRow key={entry.key} entry={entry} />
        ))}
      </ol>

      {freeTime.map((group) => (
        <Extras
          key={group.key}
          title={`If you want it — ${group.title.toLowerCase()}`}
          note={
            group.when
              ? `${group.when} · all optional, pick none or all`
              : "All optional. Pick none, pick all."
          }
        >
          {group.items.map((item) => (
            <OptionCard
              key={item.id}
              item={item}
              category={categories[item.categoryId]}
            />
          ))}
        </Extras>
      ))}

      {roadStops.length > 0 && (
        <Extras
          title="Worth pulling over for"
          note="On the way, if the timing suits."
        >
          {roadStops.map((stop) => (
            <div key={stop.title} className="px-4 py-3 sm:px-6">
              <p className="font-cond text-[15.5px] font-bold uppercase">
                {stop.title}
              </p>
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
            </div>
          ))}
        </Extras>
      )}
    </article>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const isAnchor = entry.tier === "anchor";
  // `low` is the quirky bonus — "only if it's happening while you're here" —
  // and used to render identically to `mid`. It now recedes instead: the fix
  // for three indistinguishable tiers is to quieten the bottom one, because
  // making the middle one louder just gives you two kinds of shouting.
  const isLow = entry.tier === "low";
  // Time on the road and time off both read differently from time spent doing
  // something: each wears a wash of its own category colour, so you can see the
  // shape of a day — drive, do, rest — before reading a word of it.
  const wash = entry.kind === "drive" ? 0.14 : entry.kind === "rest" ? 0.1 : 0;
  const duration =
    entry.durationLabel ??
    (entry.durationMins ? formatDuration(entry.durationMins) : undefined);

  return (
    <li
      className={`relative list-none border-b border-hairline py-3 pr-3 pl-10 last:border-b-0 ${
        isAnchor
          ? "rounded-lg bg-gradient-to-r from-accent/8 to-transparent"
          : ""
      } ${wash ? "rounded-lg border-l-4" : ""}`}
      style={
        wash
          ? {
              backgroundColor: tint(entry.color, wash),
              borderLeftColor: entry.color,
            }
          : undefined
      }
    >
      <span
        aria-hidden
        className={`absolute top-4 h-3.5 w-3.5 rounded-full border-[3px] ${
          wash ? "left-1 border-transparent" : "left-1.5 border-surface"
        }`}
        style={{ backgroundColor: entry.color }}
      />
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-[13px] -z-10 w-0.5 bg-hairline"
      />

      <p className="font-mono text-[10.5px] font-bold tracking-wide text-muted">
        {entry.timing.label ?? `${entry.timing.start} – ${entry.timing.end}`}
        {entry.timing.slot && (
          <span className="ml-2 font-normal">({entry.timing.slot})</span>
        )}
        {duration && <span className="ml-2 font-normal">· {duration}</span>}
      </p>

      <h4
        className={`mt-0.5 font-cond leading-tight font-bold uppercase ${
          isAnchor ? "text-[17.5px] text-rock" : isLow ? "text-[15.5px] text-ink-soft" : "text-[17.5px] text-ink"
        }`}
      >
        {entry.title}
        {entry.categoryLabel && (
          <span
            className={`ml-2 inline-block rounded px-1.5 py-0.5 align-[2px] font-mono text-[8.5px] font-bold tracking-[0.14em] text-white uppercase ${
              isLow ? "opacity-70" : ""
            }`}
            style={{ backgroundColor: entry.color }}
          >
            {entry.categoryLabel}
          </span>
        )}
        {/* All three, so the legend is describing marks that actually appear.
            Every item carries a tier, so an unmarked row would have been a
            fourth, undocumented state. */}
        {entry.tier && (
          <span className="ml-1.5 inline-block align-[2px]">
            <TierMark tier={entry.tier} />
          </span>
        )}
      </h4>

      <p
        className={`mt-1 ${isLow ? "text-[12.5px] text-muted" : "text-[13.5px] text-ink-soft"}`}
      >
        {entry.blurb}
      </p>

      {entry.gear?.length ? (
        <p className="mt-1.5 font-mono text-[10.5px] tracking-wide text-muted uppercase">
          Bring: {entry.gear.join(" · ")}
        </p>
      ) : null}

      {entry.location && <MapLink location={entry.location} />}
    </li>
  );
}

function MapLink({ location }: { location: Item["location"] }) {
  return (
    <a
      href={mapUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className="pin-link mt-2 inline-flex flex-wrap items-center gap-1.5 border-b border-dashed border-accent pb-0.5 font-mono text-[11px] font-medium break-words text-accent"
    >
      {location.address ?? location.name}
    </a>
  );
}

/** The optional half of a day, kept visually distinct from the timeline above. */
function Extras({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-hairline bg-canvas">
      <div className="px-4 pt-4 sm:px-6">
        <h4 className="font-display text-base tracking-wide uppercase">
          {title}
        </h4>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted uppercase">
          {note}
        </p>
      </div>
      <div className="mt-2 divide-y divide-hairline pb-4">{children}</div>
    </section>
  );
}

function OptionCard({ item, category }: { item: Item; category?: Category }) {
  return (
    <div className="px-4 py-3 sm:px-6">
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
        <span className="ml-1.5 inline-block align-[2px]">
          <TierMark tier={item.tier} />
        </span>
      </p>
      <p className="mt-1 text-[13px] text-ink-soft">{item.blurb}</p>
      <p className="mt-1 font-mono text-[10.5px] text-muted">
        {formatDuration(item.durationMins)}
      </p>
      <MapLink location={item.location} />
    </div>
  );
}
