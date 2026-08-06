import type { DayRef } from "@/components/day-rail";
import type { Category, Day, Region, Stop, Trip } from "@/types/trip";

/** "Freedom Trail & Fenway" out of "Day 1 — Freedom Trail & Fenway". */
export function shortLabel(label: string): string {
  const tail = label
    .split(/—|–|-{2}/)
    .slice(1)
    .join("—")
    .trim();
  return (tail || label).slice(0, 14);
}

/** Every day in the region, flattened in driving order, with its stop attached. */
export function regionDays(region: Region): DayRef[] {
  return region.stops.flatMap((stop) =>
    stop.days.map((day) => ({
      dayNumber: day.dayNumber,
      label: day.label,
      shortLabel: shortLabel(day.label),
      type: day.type,
      stopId: stop.id,
      stopName: stop.name,
    })),
  );
}

export function findDay(region: Region, dayNumber: number): { stop: Stop; day: Day } | undefined {
  for (const stop of region.stops) {
    const day = stop.days.find((candidate) => candidate.dayNumber === dayNumber);
    if (day) return { stop, day };
  }
  return undefined;
}

/** Categories keyed by id — the lookup every day view needs. */
export function categoryIndex(trip: Trip): Record<string, Category> {
  return Object.fromEntries(trip.categories.map((category) => [category.id, category]));
}
