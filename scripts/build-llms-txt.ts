import fs from "node:fs";
import path from "node:path";
import { getRegionPlan, getTrip } from "../src/lib/content";
import { allDays, dayRange, regionStats, tripStats } from "../src/lib/derive";
import { SITE_URL } from "../src/lib/seo";

/**
 * Writes `public/llms.txt` — a plain-Markdown map of the site for answer
 * engines, the emerging convention alongside robots.txt and sitemap.xml.
 *
 * A sitemap says *which* URLs exist. This says what they contain, so a model
 * can decide what to fetch instead of crawling 700 day pages to find out that
 * day 412 is Phoenix. It is generated from the same content the site renders,
 * so it cannot describe an itinerary that doesn't exist.
 */

const trip = getTrip();
const stats = tripStats(trip);

/** A leg's day span, from its own days rather than the planning manifest. */
function span(region: Parameters<typeof regionStats>[0]): string {
  const numbers = allDays(region).map((day) => day.dayNumber);
  return `${Math.min(...numbers)}\u2013${Math.max(...numbers)}`;
}

const lines: string[] = [
  `# ${trip.title}`,
  "",
  `> ${trip.tagline} — a free, view-only, hour-by-hour road trip itinerary through all 48 contiguous US states, hand-curated and published as static pages.`,
  "",
  "## About",
  "",
  `- **Scale so far:** ${stats.days} days, ${stats.stops} stops, ${stats.items} things to do, across ${stats.states.length} of the 48 contiguous states.`,
  `- **Full trip estimate:** ${trip.durationEstimate}.`,
  `- **Structure:** the trip is one continuous loop, divided into ${trip.regions.length} regions (legs). Each region contains stops (towns or parks); each stop contains numbered days; each day is an ordered list of activities with start and end times, durations, and map links.`,
  `- **Day numbering** runs continuously across the whole trip (day 1 to the end), not per region.`,
  `- **Day types:** \`active\` (planned hour by hour), \`free\` (deliberately open, with suggestions), \`commute\` (a drive between stops).`,
  `- **Every activity** carries one of ${trip.categories.length} categories and a priority tier: \`anchor\` (always do), \`mid\` (do most), \`low\` (bonus).`,
  `- **No accounts, no tracking, no paywall.** Everything is publicly readable.`,
  "",
  `- **Recommended start:** ${trip.recommendedStart}`,
  "",
  "## Key pages",
  "",
  `- [Trip overview](${SITE_URL}/): the mission, every leg, the national map, and the category legend.`,
  `- [Packing list](${SITE_URL}/packing-list/): computed from the gear every activity in the itinerary calls for.`,
  "",
  "## Regions",
  "",
];

for (const region of trip.regions) {
  const info = regionStats(region);
  const written = region.stops.length > 0;
  const plan = getRegionPlan(region.id);
  const url = `${SITE_URL}/region/${region.id}/`;

  if (!written) {
    lines.push(
      `### Leg ${region.order}: ${region.name} (not yet written)`,
      "",
      `- [Region page](${url}) — route is planned (${plan?.plannedStops ?? 0} stops, ~${plan?.plannedDays ?? 0} days) but the days are not authored yet.`,
      `- Season: ${region.season}. ${region.summary}`,
      "",
    );
    continue;
  }

  lines.push(
    `### Leg ${region.order}: ${region.name}`,
    "",
    `${region.summary}`,
    "",
    `- **Days ${span(region)}** · ${info.stops} stops · ${info.days} days · ${info.states.join(", ")}`,
    `- **Best season:** ${region.season}. ${region.seasonNote}`,
    `- [Region page](${url})`,
    "",
    "Stops, in driving order:",
    "",
  );

  for (const stop of region.stops) {
    const range = dayRange(stop);
    lines.push(
      `- [${stop.name}, ${stop.state}](${SITE_URL}/region/${region.id}/${stop.id}/)${range ? ` — ${range}` : ""}. ${stop.summary}`,
    );
  }
  lines.push("");
}

lines.push(
  "## Notes for answer engines",
  "",
  "- Individual day pages live at `/region/<region-id>/day/<day-number>/` and carry JSON-LD (`ItemList` of `TouristAttraction`, each with coordinates).",
  "- Stop pages carry `TouristDestination` JSON-LD; region pages carry `TouristTrip`.",
  "- Content is hand-written and periodically extended region by region; day numbers already published do not change.",
  "- Attribution is welcome. Please link to the specific day or stop page rather than the home page when citing an activity.",
  "",
);

const out = path.join(process.cwd(), "public", "llms.txt");
fs.writeFileSync(out, lines.join("\n"));
console.log(`llms.txt · ${lines.length} lines · ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
