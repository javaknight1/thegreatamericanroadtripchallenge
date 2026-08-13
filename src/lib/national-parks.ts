import { allItems, allStops } from "@/lib/derive";
import type { Trip } from "@/types/trip";

/**
 * How many of the drivable national parks the loop actually reaches.
 *
 * This is the one number on the site that needs a fact from outside the
 * content: the National Park Service's own list. There are 63 national parks;
 * eight are in Alaska, two in Hawaii, and one each in American Samoa and the US
 * Virgin Islands, which leaves the 51 below in the contiguous 48. The list is a
 * fixed external fact and changes about once a decade (New River Gorge was the
 * last, in 2020) — it is not content, and nothing else in the site depends on it.
 *
 * The *count*, though, is still derived: a park only counts if the itinerary
 * names it. So this can under-report if a park is written up loosely, and it
 * cannot over-report, which is the right way round for a claim on a home page.
 */
export const NATIONAL_PARKS_IN_THE_LOWER_48 = [
  "Acadia", "Arches", "Badlands", "Big Bend", "Biscayne", "Black Canyon of the Gunnison",
  "Bryce Canyon", "Canyonlands", "Capitol Reef", "Carlsbad Caverns", "Channel Islands",
  "Congaree", "Crater Lake", "Cuyahoga Valley", "Death Valley", "Dry Tortugas", "Everglades",
  "Gateway Arch", "Glacier", "Grand Canyon", "Grand Teton", "Great Basin", "Great Sand Dunes",
  "Great Smoky Mountains", "Guadalupe Mountains", "Hot Springs", "Indiana Dunes", "Isle Royale",
  "Joshua Tree", "Kings Canyon", "Lassen Volcanic", "Mammoth Cave", "Mesa Verde", "Mount Rainier",
  "New River Gorge", "North Cascades", "Olympic", "Petrified Forest", "Pinnacles", "Redwood",
  "Rocky Mountain", "Saguaro", "Sequoia", "Shenandoah", "Theodore Roosevelt", "Voyageurs",
  "White Sands", "Wind Cave", "Yellowstone", "Yosemite", "Zion",
] as const;

export type ParkCoverage = {
  visited: string[];
  missed: string[];
  total: number;
};

/**
 * A park counts as visited when the itinerary calls it a national park, or when
 * a *stop* is named after it. Matching loosely on the bare name would count
 * Biscayne National Park because Miami has a Biscayne Boulevard in it, which is
 * exactly the kind of thing a headline number must not do.
 */
export function parkCoverage(trip: Trip): ParkCoverage {
  const stopNames = allStops(trip).map((stop) => stop.name);
  const named = [
    ...stopNames,
    ...allStops(trip).map((stop) => stop.summary),
    ...allItems(trip).flatMap((item) => [item.title, item.location.name, item.blurb]),
  ].join(" | ");

  const visited: string[] = [];
  const missed: string[] = [];
  for (const park of NATIONAL_PARKS_IN_THE_LOWER_48) {
    const claimed =
      named.includes(`${park} National Park`) ||
      stopNames.some((name) => name.includes(park));
    (claimed ? visited : missed).push(park);
  }
  return { visited, missed, total: NATIONAL_PARKS_IN_THE_LOWER_48.length };
}
