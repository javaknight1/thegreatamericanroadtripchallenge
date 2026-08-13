import { dayRange, regionStats, tripStats } from "@/lib/derive";
import { itemsOf } from "@/lib/content";
import { parkCoverage } from "@/lib/national-parks";
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

/**
 * The share card for a page, as an Open Graph image descriptor.
 *
 * The cards are committed PNGs under `public/og/` (see `scripts/build-og.ts`
 * for why they aren't built). Every page that declares `openGraph` has to name
 * one explicitly: Next replaces a parent's `openGraph` object wholesale when a
 * child defines its own, so an image set only in the root layout silently
 * vanishes from all 900-odd inner pages — which is the failure this whole
 * exercise was meant to fix.
 */
export function shareImage(alt: string, regionId?: string) {
  return {
    url: `${SITE_URL}/og/${regionId ? `region-${regionId}` : "default"}.png`,
    width: 1200,
    height: 630,
    alt,
    type: "image/png",
  };
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
  const parks = parkCoverage(trip);
  // "mapped so far" was true while the legs were being written and isn't any
  // more. The parks number is the fact most likely to be quoted back.
  return clamp(
    `A free, hour-by-hour itinerary for driving all ${stats.usStates.length} contiguous states: ${stats.days} days, ${stats.stops} stops, ${parks.visited.length} national parks, one continuous loop.`,
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
