import { scheduleSpans } from "@/lib/schedule";
import type { Category, CommuteStop, Day, Item, Tier } from "@/types/trip";

/**
 * Flattens a day into one ordered list of events.
 *
 * Driving and resting are events, not day-level footnotes: a day can open with
 * a three-hour drive and still have an afternoon in town, or hold a scheduled
 * rest between two museums. Content can author those directly as `drive` and
 * `rest` blocks. A day that instead carries the older day-level `commute`
 * object, or is simply marked `free`, is normalised into the same shape here,
 * so the renderer only ever sees one kind of list.
 */

export type TimelineEntry = {
  key: string;
  kind: "item" | "drive" | "rest";
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
  /** Ideas attached to this event — only rest carries them. */
  options?: Item[];
  /** What to call that stretch of time in the menu heading below. */
  optionsLabel?: string;
};

/** A menu of optional ideas, tied to the stretch of free time it belongs to. */
export type FreeTimeGroup = {
  key: string;
  title: string;
  when?: string;
  items: Item[];
};

const DRIVE_FALLBACK_COLOR = "#64748B";
const REST_FALLBACK_COLOR = "#B0BEC5";

const REST_DEFAULT_NOTE =
  "Nothing is booked, on purpose. Sleep in, do laundry, wander, or pick something from the list below. The pace of this trip depends on time like this.";

type Source = {
  timing: { start?: string; end?: string; slot?: string };
  durationMins?: number;
  build: (timing: TimelineEntry["timing"]) => TimelineEntry;
};

export function dayTimeline(
  day: Day,
  categories: Record<string, Category>,
): TimelineEntry[] {
  const blocks = day.blocks ?? [];
  const sources: Source[] = [];

  // A day-level commute predates block-level drives; treat it as the day's
  // opening event so both authoring styles render identically.
  if (day.commute && !blocks.some((block) => block.drive)) {
    sources.push(
      driveSource(day.commute, `drive-${day.dayNumber}`, {}, categories),
    );
  }

  blocks.forEach((block, index) => {
    const timing = { start: block.start, end: block.end, slot: block.slot };

    if (block.item) {
      const category = categories[block.item.categoryId];
      const item = block.item;
      sources.push({
        timing,
        durationMins: item.durationMins,
        build: (resolved) => ({
          key: item.id,
          kind: "item",
          timing: resolved,
          color: category?.color ?? "var(--color-muted)",
          categoryLabel: category?.label,
          title: item.title,
          tier: item.tier,
          durationMins: item.durationMins,
          blurb: item.blurb,
          gear: item.gear,
          location: item.location,
        }),
      });
      return;
    }

    if (block.drive) {
      sources.push(
        driveSource(
          block.drive,
          `drive-${day.dayNumber}-${index}`,
          timing,
          categories,
        ),
      );
      return;
    }

    if (block.rest) {
      sources.push(
        restSource(
          `rest-${day.dayNumber}-${index}`,
          timing,
          categories,
          block.rest,
        ),
      );
    }
  });

  // A free day with nothing else authored still gets its rest on the clock,
  // and the day's own menu belongs to that rest.
  if (day.type === "free" && !sources.length) {
    sources.push(
      restSource(`rest-${day.dayNumber}`, {}, categories, {
        options: day.freeMenu,
      }),
    );
  }

  const spans = scheduleSpans(
    sources.map((source) => ({
      ...source.timing,
      durationMins: source.durationMins,
    })),
  );
  return sources.map((source, index) => source.build(spans[index]));
}

function driveSource(
  drive: NonNullable<Day["commute"]>,
  key: string,
  timing: Source["timing"],
  categories: Record<string, Category>,
): Source {
  const category = categories.commuting;
  return {
    timing,
    durationMins: drive.driveTimeMins,
    build: (resolved) => ({
      key,
      kind: "drive",
      timing: { ...resolved, slot: resolved.slot ?? "On the road" },
      color: category?.color ?? DRIVE_FALLBACK_COLOR,
      categoryLabel: category?.label,
      title: `${drive.from} → ${drive.to}`,
      durationMins: drive.driveTimeMins,
      blurb:
        drive.scenicNote ??
        "Miles are the plan for this stretch — set out when you like and take the stops as they come.",
    }),
  };
}

function restSource(
  key: string,
  timing: Source["timing"],
  categories: Record<string, Category>,
  rest: {
    label?: string;
    durationMins?: number;
    note?: string;
    options?: Item[];
  },
): Source {
  const category = categories["free-rest"];
  return {
    timing,
    durationMins: rest.durationMins,
    build: (resolved) => ({
      key,
      kind: "rest",
      timing: resolved,
      color: category?.color ?? REST_FALLBACK_COLOR,
      categoryLabel: category?.label,
      title: rest.label ?? "Rest — the time is yours",
      durationMins: rest.durationMins,
      durationLabel: rest.durationMins ? undefined : "unscheduled",
      blurb: rest.note ?? REST_DEFAULT_NOTE,
      options: rest.options?.length ? rest.options : undefined,
      // An unnamed rest is just "the free time"; a named one keeps its name.
      optionsLabel: rest.label ?? "the free time",
    }),
  };
}

/**
 * The optional half of a day, grouped by the free time it belongs to — so a
 * day with two rest events gets two menus, each labelled with its own hours,
 * rather than one undifferentiated pile of suggestions.
 */
export function dayExtras(
  day: Day,
  entries: TimelineEntry[],
): { freeTime: FreeTimeGroup[]; roadStops: CommuteStop[] } {
  const freeTime: FreeTimeGroup[] = entries
    .filter((entry) => entry.kind === "rest" && entry.options?.length)
    .map((entry) => ({
      key: entry.key,
      title: entry.optionsLabel ?? entry.title,
      when: entry.timing.label ?? `${entry.timing.start} – ${entry.timing.end}`,
      items: entry.options!,
    }));

  // A day-level menu that no rest event claimed still gets a group of its own.
  const claimed = new Set(
    freeTime.flatMap((group) => group.items.map((item) => item.id)),
  );
  const unclaimed = (day.freeMenu ?? []).filter(
    (item) => !claimed.has(item.id),
  );
  if (unclaimed.length) {
    freeTime.push({
      key: `menu-${day.dayNumber}`,
      title: "the free time",
      items: unclaimed,
    });
  }

  const fromBlocks = (day.blocks ?? []).flatMap(
    (block) => block.drive?.stopsAlongWay ?? [],
  );
  return {
    freeTime,
    roadStops: [...(day.commute?.stopsAlongWay ?? []), ...fromBlocks],
  };
}
