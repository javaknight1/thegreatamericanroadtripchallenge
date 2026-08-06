import { DayHeader } from "@/components/day-header";
import { formatDuration, mapUrl, tierLabels } from "@/lib/format";
import { formatClock, scheduleBlocks } from "@/lib/schedule";
import type { Category, Day, Item, Tier } from "@/types/trip";

/**
 * One day, in full — and every day type reads as the same timeline.
 *
 * A free day and a drive day take up just as much of your life as a full one,
 * so they get a block on the clock rather than a footnote: rest is scheduled,
 * and the drive shows its hours. What's optional (a free day's menu, the stops
 * worth pulling over for) sits below the timeline, clearly separated from what
 * the day actually commits you to.
 */

/** A timeline row, whether it came from an authored block or from the day itself. */
type Entry = {
  key: string;
  /** Every event shows a span; `slot` is the author's label when there was one. */
  timing: { start?: string; end?: string; slot?: string; label?: string };
  color: string;
  categoryLabel?: string;
  title: string;
  tier?: Tier;
  durationMins?: number;
  durationLabel?: string;
  blurb: string;
  gear?: string[];
  location?: Item["location"];
};

function timeline(day: Day, categories: Record<string, Category>): Entry[] {
  if (day.type === "active") {
    const blocks = day.blocks ?? [];
    const spans = scheduleBlocks(blocks);
    return blocks.map((block, index) => {
      const category = categories[block.item.categoryId];
      const span = spans[index];
      return {
        key: block.item.id,
        timing: { start: span.start, end: span.end, slot: span.slot },
        color: category?.color ?? "var(--color-muted)",
        categoryLabel: category?.label,
        title: block.item.title,
        tier: block.item.tier,
        durationMins: block.item.durationMins,
        blurb: block.item.blurb,
        gear: block.item.gear,
        location: block.item.location,
      };
    });
  }

  if (day.type === "commute" && day.commute) {
    const category = categories.commuting;
    return [
      {
        key: `drive-${day.dayNumber}`,
        // Departure is the driver's call, so the clock starts at a civilised
        // hour and the span shows how much of the day the drive eats.
        timing: {
          start: formatClock(9 * 60),
          end: formatClock(9 * 60 + day.commute.driveTimeMins),
          slot: "On the road",
        },
        color: category?.color ?? "#64748B",
        categoryLabel: category?.label,
        title: `${day.commute.from} → ${day.commute.to}`,
        durationMins: day.commute.driveTimeMins,
        blurb:
          day.commute.scenicNote ??
          "A driving day — the miles are the plan. Set out when you like and take the stops as they come.",
      },
    ];
  }

  const category = categories["free-rest"];
  return [
    {
      key: `free-${day.dayNumber}`,
      timing: { label: "All day" },
      color: category?.color ?? "#B0BEC5",
      categoryLabel: category?.label,
      title: "Rest — the day is yours",
      durationLabel: "unscheduled",
      blurb:
        "Nothing is booked today, on purpose. Sleep in, do laundry, wander, or pick something from the list below. The pace of this trip depends on days like this one.",
    },
  ];
}

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
  const entries = timeline(day, categories);
  const options = day.freeMenu ?? [];
  const roadStops = day.commute?.stopsAlongWay ?? [];

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

      {options.length > 0 && (
        <Extras
          title="If you want it — things to do with the free time"
          note="All optional. Pick none, pick all."
        >
          {options.map((item) => (
            <OptionCard
              key={item.id}
              item={item}
              category={categories[item.categoryId]}
            />
          ))}
        </Extras>
      )}

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

function TimelineRow({ entry }: { entry: Entry }) {
  const isAnchor = entry.tier === "anchor";
  const duration =
    entry.durationLabel ??
    (entry.durationMins ? formatDuration(entry.durationMins) : undefined);

  return (
    <li
      className={`relative list-none border-b border-hairline py-3 pl-10 last:border-b-0 ${
        isAnchor
          ? "rounded-lg bg-gradient-to-r from-accent/8 to-transparent"
          : ""
      }`}
    >
      <span
        aria-hidden
        className="absolute top-4 left-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-surface"
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
        className={`mt-0.5 font-cond text-[17.5px] leading-tight font-bold uppercase ${
          isAnchor ? "text-rock" : "text-ink"
        }`}
      >
        {entry.title}
        {entry.categoryLabel && (
          <span
            className="ml-2 inline-block rounded px-1.5 py-0.5 align-[2px] font-mono text-[8.5px] font-bold tracking-[0.14em] text-white uppercase"
            style={{ backgroundColor: entry.color }}
          >
            {entry.categoryLabel}
          </span>
        )}
        {isAnchor && (
          <span className="ml-1.5 inline-block rounded bg-accent px-1.5 py-0.5 align-[2px] font-mono text-[8.5px] font-bold tracking-[0.14em] text-white uppercase">
            {tierLabels.anchor}
          </span>
        )}
      </h4>

      <p className="mt-1 text-[13.5px] text-ink-soft">{entry.blurb}</p>

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
      </p>
      <p className="mt-1 text-[13px] text-ink-soft">{item.blurb}</p>
      <p className="mt-1 font-mono text-[10.5px] text-muted">
        {formatDuration(item.durationMins)}
      </p>
      <MapLink location={item.location} />
    </div>
  );
}
