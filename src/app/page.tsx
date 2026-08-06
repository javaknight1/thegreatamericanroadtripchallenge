import Link from "next/link";
import { CategoryDot } from "@/components/category-badge";
import { StatTile } from "@/components/stat-tile";
import { getRegionPlan, getTrip } from "@/lib/content";
import { categoryUsage, regionStats, tripStats } from "@/lib/derive";
import { formatDuration } from "@/lib/format";
import { regionTheme } from "@/lib/region-theme";

export default function HomePage() {
  const trip = getTrip();
  const stats = tripStats(trip);
  const usage = categoryUsage(trip);

  // The very first written day of the loop — where "Start at Day 1" points.
  const firstDay = trip.regions.flatMap((region) =>
    region.stops.flatMap((stop) =>
      stop.days.map((day) => ({ regionId: region.id, dayNumber: day.dayNumber })),
    ),
  )[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      <section>
        <p className="font-mono text-[10.5px] tracking-[0.22em] text-accent uppercase">
          {stats.states.length} states so far · {trip.durationEstimate} · one
          continuous loop
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-wide text-balance uppercase sm:text-6xl">
          {trip.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
          {trip.mission}
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {firstDay && (
            <Link
              href={`/region/${firstDay.regionId}/day/${firstDay.dayNumber}/`}
              className="rounded-lg bg-accent px-5 py-3 font-cond text-sm font-bold tracking-wider text-canvas uppercase"
            >
              Start at Day {firstDay.dayNumber}
            </Link>
          )}
          <Link
            href="/packing-list/"
            className="rounded-lg border-[1.5px] border-ink px-5 py-3 font-cond text-sm font-bold tracking-wider uppercase"
          >
            What to pack
          </Link>
        </div>

        <p className="mt-6 max-w-2xl rounded-xl border border-hairline bg-surface p-4 text-sm">
          <span className="font-cond font-bold tracking-wide uppercase">
            Where to begin:{" "}
          </span>
          <span className="text-ink-soft">{trip.recommendedStart}</span>
        </p>
      </section>

      <section className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile value={stats.days} label="Days mapped" />
        <StatTile value={stats.stops} label="Stops" />
        <StatTile value={stats.items} label="Things to do" />
        <StatTile value={stats.freeDays} label="Free days" />
      </section>

      <section id="regions" className="mt-14 scroll-mt-20">
        <h2 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
          The route, region by region
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          The loop runs clockwise and chases the seasons — each leg is timed for
          the weather that makes it worth being there.
        </p>

        <ol className="mt-5 space-y-3">
          {trip.regions.map((region) => {
            const info = regionStats(region);
            const plan = getRegionPlan(region.id);
            const written = region.stops.length > 0;
            return (
              <li key={region.id}>
                <Link
                  href={`/region/${region.id}/`}
                  className="block overflow-hidden rounded-xl border border-hairline bg-surface"
                >
                  <div className="flex">
                    <div
                      aria-hidden
                      className="w-2 shrink-0"
                      style={{ backgroundColor: regionTheme(region.id).accent }}
                    />
                    <div className="min-w-0 flex-1 p-4 sm:p-5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                          Leg {region.order}
                        </span>
                        <h3 className="font-display text-xl tracking-wide uppercase">
                          {region.name}
                        </h3>
                        <span className="rounded-full border border-hairline bg-raised px-2.5 py-0.5 font-cond text-[11px] font-bold tracking-wider uppercase">
                          {region.season}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-soft">
                        {region.summary}
                      </p>
                      <p className="mt-3 font-mono text-[10.5px] text-muted">
                        {written
                          ? `${info.stops} stops · ${info.days} days · ${info.states.join(", ")}`
                          : `${plan?.plannedStops ?? 0} stops planned · ~${plan?.plannedDays ?? 0} days · not yet written`}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 rounded-xl border border-dashed border-hairline p-4 text-sm text-muted">
          More legs are being written region by region, clockwise around the
          country. Everything published here is final — it just isn&apos;t
          finished yet.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
          Everything is color-coded
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Every activity belongs to one of {trip.categories.length} categories.
          Counts show what&apos;s published so far.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {trip.categories.map((category) => {
            const count = usage.get(category.id) ?? 0;
            return (
              <li
                key={category.id}
                className={`flex items-center justify-between gap-3 ${count ? "" : "opacity-45"}`}
              >
                <CategoryDot category={category} />
                <span className="font-mono text-[10.5px] text-muted">
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14 rounded-xl border border-hairline bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl tracking-wide uppercase">
          How to read the itinerary
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Full days
            </dt>
            <dd className="mt-1 text-sm text-ink-soft">
              Planned hour by hour, from morning through the evening.
            </dd>
          </div>
          <div>
            <dt className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Free days
            </dt>
            <dd className="mt-1 text-sm text-ink-soft">
              Empty on purpose. {stats.freeDays} of the {stats.days} days so far
              are yours.
            </dd>
          </div>
          <div>
            <dt className="font-cond text-[15px] font-bold tracking-wide uppercase">
              Drive days
            </dt>
            <dd className="mt-1 text-sm text-ink-soft">
              {formatDuration(stats.driveTimeMins)} of driving mapped so far,
              with the stops worth pulling over for.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
