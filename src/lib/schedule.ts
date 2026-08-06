import type { Block } from "@/types/trip";

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

export type Span = {
  start: string;
  end: string;
  /** The author's loose label, kept as context when there was one. */
  slot?: string;
  /** True when the clock times were computed rather than authored. */
  estimated: boolean;
};

/** Clock spans for a day's blocks, in order. */
export function scheduleBlocks(blocks: Block[]): Span[] {
  let cursor: number | undefined;

  return blocks.map((block) => {
    const authoredStart = parseClock(block.start);
    const authoredEnd = parseClock(block.end);

    const slotDefault = block.slot
      ? SLOT_DEFAULTS.find(([pattern]) => pattern.test(block.slot!))?.[1]
      : undefined;

    // An authored start always wins; otherwise continue from the last block,
    // falling back to what the slot label implies and then to the day's start.
    const start = authoredStart ?? cursor ?? slotDefault ?? DAY_STARTS_AT;
    const end = authoredEnd ?? start + block.item.durationMins;
    cursor = end;

    return {
      start: formatClock(start),
      end: formatClock(end),
      slot: block.slot,
      estimated: authoredStart === undefined || authoredEnd === undefined,
    };
  });
}
