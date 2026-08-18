/**
 * Validates everything in content/ against the Zod schemas and the cross-file
 * rules in src/lib/content.ts. Runs as part of `npm run build`, so bad content
 * fails the build instead of shipping.
 *
 *   npm run validate
 */
import fs from "node:fs";
import path from "node:path";
import { ContentError, loadTripFresh } from "../src/lib/content";
import { allDays, allItems, packingList, routeMiles, tripStats } from "../src/lib/derive";
import { parkCoverage } from "../src/lib/national-parks";

try {
  const trip = loadTripFresh();
  const stats = tripStats(trip);
  const gear = packingList(trip);

  console.log(`✓ ${trip.title}`);
  console.log(`  ${stats.regions} regions · ${stats.stops} stops · ${stats.days} days · ${stats.items} items`);
  console.log(
    `  days: ${stats.activeDays} active, ${stats.freeDays} free, ${stats.commuteDays} commute` +
      ` · ${stats.anchors} anchors · ${gear.length} distinct gear entries`,
  );
  console.log(
    `  ${stats.usStates.length} US states + ${stats.states.length - stats.usStates.length} other` +
      ` (${stats.countries.join(", ")}): ${stats.states.join(", ") || "none"}`,
  );

  // Cheap authoring smells that aren't schema violations.
  const warnings: string[] = [];
  for (const day of allDays(trip)) {
    const minutes = (day.blocks ?? []).reduce(
      (total, block) => total + (block.item?.durationMins ?? block.drive?.driveTimeMins ?? 0),
      0,
    );
    if (minutes > 14 * 60) warnings.push(`day ${day.dayNumber} schedules ${Math.round(minutes / 60)}h of activities`);
  }
  const numbers = allDays(trip).map((day) => day.dayNumber);
  for (let i = 1; i < numbers.length; i += 1) {
    if (numbers[i] !== numbers[i - 1] + 1) {
      warnings.push(`day numbers jump from ${numbers[i - 1]} to ${numbers[i]}`);
    }
  }
  const noMapLink = allItems(trip).filter((item) => !item.location.mapLink && item.location.lat == null);
  if (noMapLink.length) warnings.push(`${noMapLink.length} items have neither a mapLink nor coordinates`);

  // Prose that names a day number is the one thing a resequence can silently
  // falsify — inserting one stop moved 391 days and left "Day 365. A year ago
  // today" sitting on day 367. Anything that says "day N" has to be on day N.
  const DAY_REFERENCE = /\bday (\d{1,3})\b/gi;
  for (const region of trip.regions) {
    for (const stop of region.stops) {
      for (const day of stop.days) {
        const prose = [
          day.summary,
          ...(day.blocks ?? []).flatMap((block) => [
            block.item?.blurb,
            block.rest?.note,
            block.drive?.scenicNote,
          ]),
        ]
          .filter(Boolean)
          .join(" ");
        for (const [, number] of prose.matchAll(DAY_REFERENCE)) {
          const n = Number(number);
          // A cross-reference to another day is fine as long as that day
          // exists; a claim about *this* day has to match this day.
          const isSelfClaim = Math.abs(n - day.dayNumber) < 6;
          if (isSelfClaim && n !== day.dayNumber) {
            warnings.push(`day ${day.dayNumber} says "day ${n}" about itself`);
          } else if (!isSelfClaim && !numbers.includes(n)) {
            warnings.push(`day ${day.dayNumber} references day ${n}, which doesn't exist`);
          }
        }
      }
    }
  }

  // The share cards are committed PNGs, so unlike everything else on the site
  // they can fall out of date with the content. A card that says 735 days when
  // the trip has 747 is worse than no card at all.
  const manifestPath = path.join(process.cwd(), "public/og/manifest.json");
  if (!fs.existsSync(manifestPath)) {
    warnings.push("no share cards have been generated — run `npm run og`");
  } else {
    const drawn = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const now = {
      days: stats.days,
      stops: stats.stops,
      usStates: stats.usStates.length,
      parks: parkCoverage(trip).visited.length,
      miles: routeMiles(trip),
      legs: trip.regions.filter((region) => region.stops.length).map((region) => region.id),
    };
    const stale = Object.keys(now).filter(
      (key) => JSON.stringify(drawn[key]) !== JSON.stringify(now[key as keyof typeof now]),
    );
    if (stale.length) {
      warnings.push(`share cards are stale (${stale.join(", ")} changed) — run \`npm run og\``);
    }
  }

  if (warnings.length) {
    console.warn("\n⚠ warnings (not fatal):");
    for (const warning of warnings) console.warn(`  • ${warning}`);
  }
} catch (error) {
  if (error instanceof ContentError) {
    console.error(`\n✗ ${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
