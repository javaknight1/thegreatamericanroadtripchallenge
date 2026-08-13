/**
 * Validates everything in content/ against the Zod schemas and the cross-file
 * rules in src/lib/content.ts. Runs as part of `npm run build`, so bad content
 * fails the build instead of shipping.
 *
 *   npm run validate
 */
import { ContentError, loadTripFresh } from "../src/lib/content";
import { allDays, allItems, packingList, tripStats } from "../src/lib/derive";

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
