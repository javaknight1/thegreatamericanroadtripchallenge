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

/**
 * The promise is to visit every state capital *city* — not to tour every
 * capitol building. This checks the cities.
 */
const CAPITALS: Array<[string, string]> = [
  ["AL", "Montgomery"], ["AZ", "Phoenix"], ["AR", "Little Rock"], ["CA", "Sacramento"], ["CO", "Denver"],
  ["CT", "Hartford"], ["DE", "Dover"], ["FL", "Tallahassee"], ["GA", "Atlanta"], ["ID", "Boise"],
  ["IL", "Springfield"], ["IN", "Indianapolis"], ["IA", "Des Moines"], ["KS", "Topeka"], ["KY", "Frankfort"],
  ["LA", "Baton Rouge"], ["ME", "Augusta"], ["MD", "Annapolis"], ["MA", "Boston"], ["MI", "Lansing"],
  ["MN", "St. Paul"], ["MS", "Jackson"], ["MO", "Jefferson City"], ["MT", "Helena"], ["NE", "Lincoln"],
  ["NV", "Carson City"], ["NH", "Concord"], ["NJ", "Trenton"], ["NM", "Santa Fe"], ["NY", "Albany"],
  ["NC", "Raleigh"], ["ND", "Bismarck"], ["OH", "Columbus"], ["OK", "Oklahoma City"], ["OR", "Salem"],
  ["PA", "Harrisburg"], ["RI", "Providence"], ["SC", "Columbia"], ["SD", "Pierre"], ["TN", "Nashville"],
  ["TX", "Austin"], ["UT", "Salt Lake City"], ["VT", "Montpelier"], ["VA", "Richmond"], ["WA", "Olympia"],
  ["WV", "Charleston"], ["WI", "Madison"], ["WY", "Cheyenne"],
];

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

}

const everywhere = new Set(written.flatMap((r) => r.stops.flatMap((s) => s.days.flatMap(itemsOf))).map((i) => i.categoryId));
console.log("\ncategories with no items in any written region:", trip.categories.filter((c) => !everywhere.has(c.id)).map((c) => c.id).join(", "));

// Capital cities: authored stops first, then the plan for legs not yet written.
const authoredNames = written.flatMap((region) => region.stops.map((stop) => stop.name.toLowerCase()));
const plannedNames = plan.regions.flatMap((region) => region.stops.map((stop) => stop.name.toLowerCase()));
const covers = (names: string[], city: string) => names.some((name) => name.includes(city.toLowerCase()));

const authored = CAPITALS.filter(([, city]) => covers(authoredNames, city));
const missing = CAPITALS.filter(([, city]) => !covers(plannedNames, city));
console.log(`\ncapital cities: ${authored.length}/48 written, ${48 - missing.length}/48 in the plan`);
console.log("capitals missing from the plan entirely:", missing.map(([state, city]) => `${city}, ${state}`).join(" · ") || "none");
