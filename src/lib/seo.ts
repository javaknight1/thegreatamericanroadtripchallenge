import { dayRange, regionStats, tripStats } from "@/lib/derive";
import { itemsOf } from "@/lib/content";
import type { Day, Region, Stop, Trip } from "@/types/trip";

/**
 * Search and answer-engine surface.
 *
 * Two audiences read these pages and neither of them is a browser. Classic
 * crawlers want a canonical URL, a sitemap, and one honest <h1> per page.
 * Answer engines want *facts they can lift* — which day, which town, which
 * state, how long the drive — without inferring them from prose. Both are
 * served the same way: say the concrete thing in the title, the description,
 * and again in JSON-LD, and never say something the page doesn't show.
 *
 * Everything here is derived from the content at build time. Nothing is
 * hand-maintained, so it cannot drift from the itinerary.
 */

export const SITE_URL = "https://thegreatamericanroadtripchallenge.com";

/** Absolute URL for a route. Paths are trailing-slashed, matching the export. */
export function canonical(path = "/"): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;
  return `${SITE_URL}${clean}`;
}

/** Descriptions get truncated around 155–160 chars in results; land under it. */
function clamp(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : cut.length)}…`;
}

export function tripDescription(trip: Trip): string {
  const stats = tripStats(trip);
  return clamp(
    `A free, hour-by-hour road trip itinerary through all 48 contiguous states. ${stats.days} days and ${stats.stops} stops mapped so far across ${stats.usStates.length} states.`,
  );
}

export function regionDescription(region: Region): string {
  const info = regionStats(region);
  if (!info.days) return clamp(region.summary);
  return clamp(
    `${info.stops} stops and ${info.days} days through ${info.states.join(", ")}. ${region.summary}`,
  );
}

export function stopDescription(stop: Stop, region: Region): string {
  const range = dayRange(stop);
  const where = `${stop.name}, ${stop.state}`;
  return clamp(
    `${where} — ${range ? `${range} of ` : ""}the Great American Road Trip Challenge, in ${region.name}. ${stop.summary}`,
  );
}

/**
 * Day descriptions name the places, because that is what someone actually
 * searches for. A day's own `summary` is often four words ("The old heart of
 * the city."), which is fine on the page and useless in a result.
 */
export function dayDescription(day: Day, stop: Stop, region: Region): string {
  const titles = itemsOf(day).map((item) => item.title);
  const named = titles.slice(0, 3).join(", ");
  const lead = `Day ${day.dayNumber} of the Great American Road Trip Challenge — ${stop.name}, ${stop.state}.`;

  if (day.type === "commute" && day.blocks?.length === undefined && day.commute) {
    return clamp(`${lead} Driving ${day.commute.from} to ${day.commute.to}. ${day.summary ?? ""}`);
  }
  if (named) return clamp(`${lead} ${named}.`);
  return clamp(`${lead} ${day.summary ?? region.name}`);
}
