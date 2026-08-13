import Link from "next/link";
import { CategoryDot } from "@/components/category-badge";
import { JsonLd } from "@/components/json-ld";
import { NationalMap } from "@/components/national-map";
import { StatTile } from "@/components/stat-tile";
import { getTrip } from "@/lib/content";
import { categoryUsage, pacing, regionStats, routeMiles, tripStats } from "@/lib/derive";
import { nationalMapData } from "@/lib/geo";
import { parkCoverage } from "@/lib/national-parks";
import { regionTheme } from "@/lib/region-theme";
import { tripSchema } from "@/lib/schema-org";

/**
 * The home page answers one question — what is this? — and then gets out of the
 * way. Headline, map, numbers, the route, and two links.
 *
 * The map sits directly under the headline because it *is* the pitch: a reader
 * understands "one continuous loop through all 48 states" from the picture in
 * about a second, faster than any paragraph could tell them. Everything below
 * it is supporting evidence, ordered by how much a first-time visitor cares.
 */
export default function HomePage() {
  const trip = getTrip();
  const stats = tripStats(trip);
  const usage = categoryUsage(trip);
  const parks = parkCoverage(trip);
  const { restDays, breathers, longestPush } = pacing(trip);
  const countryCount = stats.countries.length;

  // `commuting` and `free-rest` are assigned by the renderer to drive and rest
  // blocks — no authored item can carry them, so they'd always read "0" here
  // and look like holes in the coverage. They're explained in the copy instead.
  const activityCategories = trip.categories.filter(
    (category) => category.id !== "commuting" && category.id !== "free-rest",
  );
  const nation = nationalMapData(trip.regions);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-5 pb-10 sm:px-6 sm:pt-8 sm:pb-16">
      <JsonLd data={tripSchema(trip)} />

      <section>
        <h1 className="font-display text-[2.1rem] leading-[1.02] tracking-wide text-balance uppercase sm:text-[3.25rem] sm:leading-[0.98]">
          The whole country,
          <br />
          <span className="text-accent">in the order it&apos;s best driven.</span>
        </h1>
      </section>

      {nation && (
        <section className="mt-10">
          <NationalMap map={nation} />
        </section>
      )}

      <section className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile value={stats.days} label="Days planned" />
        <StatTile value={stats.stops} label="Cities & towns" />
        <StatTile value={stats.items} label="Things to do" />
        {/* `usStates`, not `states` — DC and the Canada detour are in the data
            and neither is one of the 48 on the tin. */}
        <StatTile value={stats.usStates.length} label="States" />
        <StatTile value={parks.visited.length} label="National parks" />
        <StatTile value={stats.anchors} label="Must-dos" />
        {/* "557h 55m" is precise and unreadable at a glance; hours is the unit
            anyone actually thinks in for a number this size. */}
        <StatTile value={`${Math.round(stats.driveTimeMins / 60)} hrs`} label="Behind the wheel" />
        <StatTile value={routeMiles(trip).toLocaleString("en-US")} label="Miles driven" />
      </section>

      {/*
        The two claims worth backing up, because both sound too good: the parks
        number is the whole point of a trip like this, and "48 states" invites
        the question of whether it leaves the country. It does, once.
      */}
      <p className="mt-4 text-sm leading-relaxed text-muted">
        That&apos;s {parks.visited.length} of the {parks.total} national parks in
        the lower 48. The only {parks.missed.length} it leaves out —{" "}
        {parks.missed.join(", ")} — can&apos;t be driven to at all. It also
        covers the District of Columbia and crosses into{" "}
        {countryCount === 2 ? "a second country" : `${countryCount} countries`}{" "}
        once, for two days in British Columbia.
      </p>

      <p className="mt-3 text-sm text-muted">
        <span className="font-cond font-bold tracking-wide text-ink uppercase">
          Best time to start:{" "}
        </span>
        {trip.recommendedStart}
      </p>

      <section id="regions" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
          The route
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          The loop runs clockwise and chases the seasons — each leg is timed for
          the weather that makes it worth being there.
        </p>

        {/*
          One line per leg. The summaries live on the region pages; repeating
          fourteen of them here was the single busiest thing on this page.
        */}
        <ol className="mt-5 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
          {trip.regions.map((region) => {
            const info = regionStats(region);
            return (
              <li key={region.id}>
                <Link
                  href={`/region/${region.id}/`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-raised sm:gap-4 sm:px-5"
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: regionTheme(region.id).accent }}
                  />
                  <span className="font-mono text-[10px] text-muted tabular-nums">
                    {String(region.order).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-cond text-[17px] font-bold tracking-wide uppercase">
                      {region.name}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-muted">
                      {info.states.join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-[10.5px] text-muted tabular-nums">
                    {info.stops} stops
                    <span className="block">{info.days} days</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
          Color-coded, end to end
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Every activity belongs to one of {activityCategories.length}{" "}
          categories and carries a duration, a map link, and a priority. Drives
          and rest get their own shades on the day&apos;s timeline.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {activityCategories.map((category) => (
            <li key={category.id} className="flex items-center gap-1.5">
              <CategoryDot category={category} />
              <span className="font-mono text-[10px] text-muted tabular-nums">
                {usage.get(category.id) ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
          Paced to be lived, not survived
        </h2>
        <div className="mt-5 grid gap-4 rounded-xl border border-hairline bg-surface p-5 sm:grid-cols-4 sm:p-6">
          <div>
            <p className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Full days
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {stats.activeDays} days planned hour by hour, morning to evening.
            </p>
          </div>
          <div>
            <p className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Free days
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {stats.freeDays} days left open on purpose, with suggestions if you
              want them.
            </p>
          </div>
          <div>
            <p className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Time off
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {restDays} more days that stop early — an afternoon, an evening,
              nothing booked.
            </p>
          </div>
          <div>
            <p className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Drive days
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {stats.commuteDays} days on the road, with the stops worth pulling
              over for.
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          You are never more than {longestPush} days from one of those{" "}
          {breathers} breathers, anywhere in the loop.
        </p>
      </section>
    </div>
  );
}
