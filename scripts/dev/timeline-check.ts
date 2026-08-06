/**
 * Exercises the day model: a day that mixes a drive, activities, and a
 * scheduled rest, plus the legacy day-level shapes, all through the same
 * schema and timeline builder.
 *
 *   npx tsx scripts/dev/timeline-check.ts
 */
import { getTrip } from "../../src/lib/content";
import { dayExtras, dayTimeline } from "../../src/lib/day-timeline";
import { daySchema } from "../../src/schema/trip";
import { categoryIndex } from "../../src/lib/region-view";

const categories = categoryIndex(getTrip());

const mixed = {
  dayNumber: 9001,
  label: "Day X — Drive up, an afternoon in town, and an evening off",
  type: "active",
  summary: "A morning on the road, one thing to see, and the evening to yourself.",
  blocks: [
    {
      start: "8:00 AM",
      drive: {
        from: "Camden, ME",
        to: "Bar Harbor, ME",
        driveTimeMins: 95,
        scenicNote: "Coastal Route 1 the whole way.",
        stopsAlongWay: [
          { title: "Red's Eats, Wiscasset", blurb: "The lobster-roll line." },
        ],
      },
    },
    {
      start: "11:00 AM",
      item: {
        id: "demo-jordan-pond",
        title: "Popovers at Jordan Pond",
        categoryId: "food-drink",
        tier: "mid",
        durationMins: 90,
        location: { name: "Jordan Pond House" },
        blurb: "Tea and popovers on the lawn.",
      },
    },
    { rest: { durationMins: 240, label: "Afternoon off", note: "Nap, swim, read on the rocks." } },
    {
      start: "7:00 PM",
      item: {
        id: "demo-dinner",
        title: "Dinner in Bar Harbor",
        categoryId: "food-drink",
        tier: "low",
        durationMins: 120,
        location: { name: "Bar Harbor" },
        blurb: "Whatever's got a table.",
      },
    },
  ],
};

const parsed = daySchema.safeParse(mixed);
console.log("mixed day parses:", parsed.success ? "yes" : parsed.error.issues);
if (!parsed.success) process.exit(1);

console.log("\ntimeline:");
for (const entry of dayTimeline(parsed.data, categories)) {
  const when = entry.timing.label ?? `${entry.timing.start} – ${entry.timing.end}`;
  console.log(`  ${when.padEnd(22)} [${entry.kind}] ${entry.title}`);
}
const extras = dayExtras(parsed.data);
console.log("  extras:", extras.roadStops.map((s) => s.title).join(", ") || "none");

// The legacy shapes still normalise into the same list.
const trip = getTrip();
const days = trip.regions.flatMap((r) => r.stops.flatMap((s) => s.days));
for (const type of ["commute", "free"] as const) {
  const day = days.find((d) => d.type === type)!;
  const [first] = dayTimeline(day, categories);
  const when = first.timing.label ?? `${first.timing.start} – ${first.timing.end}`;
  console.log(`\nlegacy ${type} day ${day.dayNumber}: ${when} [${first.kind}] ${first.title}`);
}
