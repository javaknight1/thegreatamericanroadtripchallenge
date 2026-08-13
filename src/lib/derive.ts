import { itemsOf } from "@/lib/content";
import type { Coordinates, Day, Item, Region, Stop, Trip } from "@/types/trip";

/**
 * Everything computed rather than authored. Nothing here is ever stored in the
 * JSON — notably the master packing list, which is aggregated from item.gear[].
 */

export type PackingEntry = {
  /** The gear string as authored, e.g. "hiking boots". */
  gear: string;
  /** How many items across the trip call for it. */
  count: number;
  /** Region names that need it, in trip order. */
  regions: string[];
};

export type TripStats = {
  regions: number;
  stops: number;
  days: number;
  activeDays: number;
  freeDays: number;
  commuteDays: number;
  items: number;
  anchors: number;
  states: string[];
  countries: string[];
  driveTimeMins: number;
};

export type RegionStats = {
  stops: number;
  days: number;
  items: number;
  states: string[];
};

export function allStops(trip: Trip): Stop[] {
  return trip.regions.flatMap((region) => region.stops);
}

export function allDays(scope: Trip | Region): Day[] {
  const regions = "regions" in scope ? scope.regions : [scope];
  return regions.flatMap((region) => region.stops.flatMap((stop) => stop.days));
}

export function allItems(scope: Trip | Region): Item[] {
  return allDays(scope).flatMap(itemsOf);
}

/** Day range for a stop, e.g. "Days 1–5" (or "Day 1" for a single day). */
export function dayRange(stop: Stop): string | undefined {
  if (!stop.days.length) return undefined;
  const first = stop.days[0].dayNumber;
  const last = stop.days[stop.days.length - 1].dayNumber;
  return first === last ? `Day ${first}` : `Days ${first}–${last}`;
}

/**
 * Every minute of driving in a day, however it was authored.
 *
 * A day-level `commute` is the older shape and still the common one; a drive
 * that happens *after* something else — a morning in town, then two hours down
 * the canyon — has to be a block instead, because the day-level commute always
 * renders first. Counting only one of the two would quietly under-report the
 * trip's driving every time a day is authored the second way.
 */
function driveMinutes(day: Day): number {
  const fromBlocks = (day.blocks ?? []).reduce(
    (total, block) => total + (block.drive?.driveTimeMins ?? 0),
    0,
  );
  return (day.commute?.driveTimeMins ?? 0) + fromBlocks;
}

export function tripStats(trip: Trip): TripStats {
  const days = allDays(trip);
  const items = allItems(trip);
  const stops = allStops(trip);

  return {
    regions: trip.regions.length,
    stops: stops.length,
    days: days.length,
    activeDays: days.filter((day) => day.type === "active").length,
    freeDays: days.filter((day) => day.type === "free").length,
    commuteDays: days.filter((day) => day.type === "commute").length,
    items: items.length,
    anchors: items.filter((item) => item.tier === "anchor").length,
    states: [...new Set(stops.map((stop) => stop.state))].sort(),
    countries: [...new Set(stops.map((stop) => stop.country))].sort(),
    driveTimeMins: days.reduce((total, day) => total + driveMinutes(day), 0),
  };
}

export function regionStats(region: Region): RegionStats {
  return {
    stops: region.stops.length,
    days: allDays(region).length,
    items: allItems(region).length,
    states: [...new Set(region.stops.map((stop) => stop.state))].sort(),
  };
}

/**
 * The master packing list: every `item.gear[]` in the trip, deduped
 * case-insensitively, counted, and tagged with the regions that need it.
 */
/**
 * Roughly how far the loop is, in miles.
 *
 * There are no distances in the content — only coordinates and drive times — so
 * this is derived: great-circle distance between consecutive stops in trip
 * order, closed back to the first stop (day 735 drives home to Boston), times a
 * road-circuity factor because roads don't go in straight lines. 1.2 is the
 * usual figure for long-haul US driving.
 *
 * Sanity check: the trip's own authored drive times total ~555 hours, which at
 * 55 mph is ~30,500 miles. This method gives ~31,100. Two independent routes to
 * the same number, so it's a fair thing to print — rounded, and never presented
 * as exact.
 */
const ROAD_CIRCUITY = 1.2;
const EARTH_RADIUS_MILES = 3958.8;

export function routeMiles(trip: Trip): number {
  const stops = allStops(trip);
  if (stops.length < 2) return 0;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const between = (a: Coordinates, b: Coordinates) => {
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
  };

  let miles = 0;
  for (let i = 1; i < stops.length; i += 1) {
    miles += between(stops[i - 1].location, stops[i].location);
  }
  miles += between(stops.at(-1)!.location, stops[0].location);

  return Math.round((miles * ROAD_CIRCUITY) / 100) * 100;
}

export function packingList(trip: Trip): PackingEntry[] {
  const entries = new Map<string, PackingEntry & { regionSet: Set<string> }>();

  for (const region of trip.regions) {
    for (const item of allItems(region)) {
      for (const gear of item.gear ?? []) {
        const key = gear.trim().toLowerCase();
        if (!key) continue;
        const entry = entries.get(key) ?? { gear: gear.trim(), count: 0, regions: [], regionSet: new Set() };
        entry.count += 1;
        entry.regionSet.add(region.name);
        entries.set(key, entry);
      }
    }
  }

  // Region order is trip order because trip.regions is already sorted.
  const regionOrder = new Map(trip.regions.map((region, index) => [region.name, index]));

  return [...entries.values()]
    .map(({ regionSet, ...entry }) => ({
      ...entry,
      regions: [...regionSet].sort((a, b) => (regionOrder.get(a) ?? 0) - (regionOrder.get(b) ?? 0)),
    }))
    .sort((a, b) => b.count - a.count || a.gear.localeCompare(b.gear));
}

/** Categories actually used in a scope, with counts — powers legends and filters. */
export function categoryUsage(scope: Trip | Region): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of allItems(scope)) {
    counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
  }
  return counts;
}
