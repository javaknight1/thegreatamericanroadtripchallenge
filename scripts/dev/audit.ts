/**
 * Content audit for the written regions — the questions validate() can't answer
 * because they're editorial, not structural: is every state capital actually
 * captured as a capitol visit, how long can you go without a day off, which of
 * the 18 categories are going unused.
 *
 *   npx tsx scripts/dev/audit.ts
 */
import { getPlan, getTrip, itemsOf } from "../../src/lib/content";

const trip = getTrip();
const plan = getPlan();
const written = trip.regions.filter((region) => region.stops.length > 0);

/** State → its capital city, for checking the "every state capital" promise. */
const CAPITAL_CITY: Record<string, string> = {
  MA: "Boston", ME: "Augusta", NH: "Concord", VT: "Montpelier", CT: "Hartford", RI: "Providence",
  NY: "Albany", NJ: "Trenton", PA: "Harrisburg", DE: "Dover", MD: "Annapolis",
};

for (const region of written) {
  const planned = plan.regions.find((entry) => entry.id === region.id)!;
  const days = region.stops.flatMap((stop) => stop.days);
  const items = days.flatMap(itemsOf);

  console.log(`\n=== ${region.name} — ${region.stops.length}/${planned.stops.length} stops · days ${days[0].dayNumber}-${days.at(-1)!.dayNumber} ===`);

  const short = region.stops
    .map((stop) => [stop, planned.stops.find((p) => p.id === stop.id)!.plannedDays] as const)
    .filter(([stop, want]) => stop.days.length < want)
    .map(([stop, want]) => `${stop.name} ${stop.days.length}/${want}d`);
  console.log("under planned length:", short.join(" · ") || "none");

  const count = (type: string) => days.filter((day) => day.type === type).length;
  console.log(`day mix: ${count("active")} active · ${count("free")} free (${Math.round((count("free") / days.length) * 100)}%) · ${count("commute")} drive`);

  let run = 0;
  let worst = 0;
  let worstEnd = 0;
  for (const day of days) {
    if (day.type === "free") { run = 0; continue; }
    run += 1;
    if (run > worst) { worst = run; worstEnd = day.dayNumber; }
  }
  console.log(`longest stretch with no free day: ${worst} days (through day ${worstEnd})`);

  const noRest = region.stops.filter((stop) => stop.days.length >= 4 && !stop.days.some((day) => day.type === "free"));
  console.log("4+ day stops with no free day:", noRest.map((stop) => `${stop.name} (${stop.days.length}d)`).join(" · ") || "none");

  const used = new Set(items.map((item) => item.categoryId));
  console.log("categories unused here:", trip.categories.filter((c) => !used.has(c.id)).map((c) => c.id).join(", ") || "none");

  for (const stop of region.stops) {
    const capital = CAPITAL_CITY[stop.state];
    if (!capital || !stop.name.toLowerCase().includes(capital.toLowerCase())) continue;
    const hasItem = stop.days.flatMap(itemsOf).some((item) => item.categoryId === "capitols");
    if (!hasItem) console.log(`  ⚠ ${stop.state}: ${stop.name} has no "capitols" item — the state capitol isn't a visit here`);
  }
}

const everywhere = new Set(written.flatMap((r) => r.stops.flatMap((s) => s.days.flatMap(itemsOf))).map((i) => i.categoryId));
console.log("\ncategories with no items in any written region:", trip.categories.filter((c) => !everywhere.has(c.id)).map((c) => c.id).join(", "));
