/**
 * Turns a day's blocks into real clock spans.
 *
 * Content authors a start time and a duration, and only sometimes an end — so
 * the end is computed from the duration when it's missing, and a block with
 * only a loose slot ("Afternoon") is placed after the block before it. That
 * way every event on a day shows when it starts and when it's over, without
 * anyone having to hand-maintain two clocks per item.
 */

/** Where a block lands when nothing before it says otherwise. */
const SLOT_DEFAULTS: Array<[RegExp, number]> = [
  [/morning/i, 9 * 60],
  [/noon|lunch|midday/i, 12 * 60],
  [/afternoon/i, 13 * 60],
  [/evening|dinner/i, 18 * 60],
  [/night|late/i, 21 * 60],
];

const DAY_STARTS_AT = 9 * 60;

export function parseClock(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim());
  if (!match) return undefined;

  const [, rawHour, rawMinute, meridiem] = match;
  let hour = Number(rawHour) % 12;
  if (meridiem?.toUpperCase() === "PM") hour += 12;
  if (!meridiem) hour = Number(rawHour) % 24;
  return hour * 60 + Number(rawMinute);
}

export function formatClock(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const meridiem = hour24 < 12 ? "AM" : "PM";
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export type TimedEvent = {
  start?: string;
  end?: string;
  slot?: string;
  /** Absent means open-ended — a rest that takes whatever is left of the day. */
  durationMins?: number;
};

export type Span = {
  start?: string;
  end?: string;
  /** The author's loose label, kept as context when there was one. */
  slot?: string;
  /** Set instead of a clock span when the event has no duration to place. */
  label?: string;
};

const later = (a: number | undefined, b: number | undefined) =>
  a === undefined ? b : b === undefined ? a : Math.max(a, b);

/** Clock spans for a day's events, in order. */
export function scheduleSpans(events: TimedEvent[]): Span[] {
  let cursor: number | undefined;

  return events.map((event) => {
    const authoredStart = parseClock(event.start);
    const authoredEnd = parseClock(event.end);
    const unbounded =
      event.durationMins === undefined && authoredStart === undefined && authoredEnd === undefined;

    // Open-ended *and* first on the day — that's a whole free day, and there is
    // no clock to invent. Open-ended after something else is different: it's the
    // rest of the day, and it starts when the thing before it ended.
    if (unbounded && cursor === undefined) {
      return { label: "All day", slot: event.slot };
    }

    const slotDefault = event.slot
      ? SLOT_DEFAULTS.find(([pattern]) => pattern.test(event.slot!))?.[1]
      : undefined;

    // An authored start always wins. Otherwise take the later of where the last
    // event ended and what the slot label implies, so "Evening" never resolves
    // to half past three just because the afternoon finished early — and never
    // resolves to a time that overlaps what came before it either.
    const start = authoredStart ?? later(cursor, slotDefault) ?? DAY_STARTS_AT;
    const end = authoredEnd ?? (event.durationMins !== undefined ? start + event.durationMins : undefined);

    if (end === undefined) {
      cursor = start;
      return { start: formatClock(start), label: `from ${formatClock(start)}`, slot: event.slot };
    }

    cursor = end;
    return { start: formatClock(start), end: formatClock(end), slot: event.slot };
  });
}
