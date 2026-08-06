import Link from "next/link";
import { CategoryDot } from "@/components/category-badge";
import { StatTile } from "@/components/stat-tile";
import { getTrip } from "@/lib/content";
import { categoryUsage, regionStats, tripStats } from "@/lib/derive";
import { formatDuration } from "@/lib/format";

export default function HomePage() {
  const trip = getTrip();
  const stats = tripStats(trip);
  const usage = categoryUsage(trip);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section>
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {stats.states.length} states · {trip.durationEstimate} · one continuous loop
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl">
          {trip.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{trip.mission}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {trip.regions[0]?.stops[0] && (
            <Link
              href={`/region/${trip.regions[0].id}/${trip.regions[0].stops[0].id}/`}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              Start at Day 1 — {trip.regions[0].stops[0].name}
            </Link>
          )}
          <Link
            href="/packing-list/"
            className="rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-raised"
          >
            What to pack
          </Link>
        </div>

        <p className="mt-6 max-w-2xl rounded-xl border border-hairline bg-surface p-4 text-sm leading-relaxed">
          <span className="font-semibold">Where to begin: </span>
          <span className="text-muted">{trip.recommendedStart}</span>
        </p>
      </section>

      <section className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={stats.days} label="Days mapped" />
        <StatTile value={stats.stops} label="Stops" />
        <StatTile value={stats.items} label="Things to do" />
        <StatTile value={stats.freeDays} label="Free days" />
      </section>

      <section id="regions" className="mt-16 scroll-mt-20">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">The route, region by region</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          The loop runs clockwise and chases the seasons — each leg is timed for the weather that makes it worth
          being there.
        </p>

        <ol className="mt-6 space-y-4">
          {trip.regions.map((region) => {
            const regionInfo = regionStats(region);
            return (
              <li key={region.id}>
                <Link
                  href={`/region/${region.id}/`}
                  className="block rounded-xl border border-hairline bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-xs text-muted">Leg {region.order}</span>
                    <h3 className="font-display text-xl font-semibold">{region.name}</h3>
                    <span className="rounded-full border border-hairline bg-raised px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
                      {region.season}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{region.summary}</p>
                  <p className="mt-3 text-xs text-muted">
                    {regionInfo.stops} stops · {regionInfo.days} days · {regionInfo.states.join(", ")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>

        {trip.regions.length < 8 && (
          <p className="mt-4 rounded-xl border border-dashed border-hairline p-4 text-sm text-muted">
            More legs are being written region by region, clockwise around the country. Everything published here is
            final — it just isn&apos;t finished yet.
          </p>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Everything is color-coded</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Every activity belongs to one of {trip.categories.length} categories. Counts show what&apos;s published so
          far.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {trip.categories.map((category) => {
            const count = usage.get(category.id) ?? 0;
            return (
              <li key={category.id} className={`flex items-center justify-between gap-3 ${count ? "" : "opacity-45"}`}>
                <CategoryDot category={category} />
                <span className="font-mono text-xs text-muted">{count}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16 rounded-xl border border-hairline bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">How to read the itinerary</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold">Full days</dt>
            <dd className="mt-1 text-sm text-muted">Planned hour by hour, from morning through the evening.</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Free days</dt>
            <dd className="mt-1 text-sm text-muted">
              Empty on purpose. {stats.freeDays} of the {stats.days} days so far are yours.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold">Drive days</dt>
            <dd className="mt-1 text-sm text-muted">
              {formatDuration(stats.driveTimeMins)} of driving mapped so far, with the stops worth pulling over for.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
