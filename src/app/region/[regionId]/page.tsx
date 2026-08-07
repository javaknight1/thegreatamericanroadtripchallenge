import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DayRail } from "@/components/day-rail";
import { RegionHero } from "@/components/region-hero";
import { RegionMap } from "@/components/region-map";
import { StatTile } from "@/components/stat-tile";
import { getRegion, getRegionPlan, getTrip } from "@/lib/content";
import { dayRange, regionStats } from "@/lib/derive";
import { formatDuration, formatPlace } from "@/lib/format";
import { regionMapData } from "@/lib/geo";
import { regionTheme, regionThemeStyle } from "@/lib/region-theme";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, regionSchema } from "@/lib/schema-org";
import { canonical, regionDescription } from "@/lib/seo";
import { regionDays } from "@/lib/region-view";
import { stopColorMap } from "@/lib/stop-colors";

type Params = { regionId: string };

export function generateStaticParams(): Params[] {
  return getTrip().regions.map((region) => ({ regionId: region.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { regionId } = await params;
  const region = getRegion(regionId);
  if (!region) return {};
  const description = regionDescription(region);
  return {
    title: region.name,
    description,
    alternates: { canonical: canonical(`region/${region.id}`) },
    openGraph: {
      title: region.name,
      description,
      url: canonical(`region/${region.id}`),
      type: "article",
    },
  };
}

const typeLabels = {
  active: "Full day",
  free: "Free day",
  commute: "Drive day",
} as const;

export default async function RegionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { regionId } = await params;
  const region = getRegion(regionId);
  if (!region) notFound();

  const theme = regionTheme(region.id);
  const stats = regionStats(region);
  const map = regionMapData(region);
  const colors = stopColorMap(region.stops.map((stop) => stop.id));
  const days = regionDays(region);
  const plan = getRegionPlan(region.id);

  return (
    <div style={regionThemeStyle(theme)}>
      <JsonLd data={regionSchema(region)} />
      <JsonLd
        data={breadcrumbs([
          { name: "The Great American Road Trip Challenge", path: "/" },
          { name: region.name, path: `region/${region.id}` },
        ])}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/#regions"
          className="font-mono text-[11px] tracking-wide text-muted uppercase"
        >
          ← All regions
        </Link>

        {/*
          Phone: stacked in reading order. Desktop: the leg's identity — banner,
          map, season, totals — holds still on the left while its days and stops
          scroll on the right.
        */}
        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
          <div className="no-scrollbar min-w-0 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto">
            <header>
              <RegionHero
                regionId={region.id}
                theme={theme}
                order={region.order}
                name={region.name}
                season={region.season}
              />
              <h1 className="sr-only">{region.name}</h1>
            </header>

            {map ? (
              <section className="mt-4">
                <RegionMap
                  map={map}
                  theme={theme}
                  regionId={region.id}
                  colors={colors}
                />
                <p className="mt-2 font-mono text-[10.5px] tracking-wide text-muted">
                  Tap a pin to open that stop&apos;s first day · numbers follow
                  the driving order
                </p>
              </section>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-hairline p-5 text-sm text-muted">
                This leg is planned but not yet written — the stops below are
                the route it will follow.
              </p>
            )}

            <p className="mt-4 text-base text-ink-soft">{region.summary}</p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
              {theme.mood}
            </p>

            <div className="mt-4 rounded-xl border border-accent/30 bg-accent-soft p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                Time it right
              </p>
              <p className="mt-2 text-sm">{region.seasonNote}</p>
            </div>

            <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {region.stops.length > 0 ? (
                <>
                  <StatTile value={stats.stops} label="Stops" />
                  <StatTile value={stats.days} label="Days" />
                  <StatTile value={stats.items} label="Things to do" />
                  <StatTile value={stats.states.length} label="States" />
                </>
              ) : (
                <>
                  <StatTile
                    value={plan?.plannedStops ?? 0}
                    label="Stops planned"
                  />
                  <StatTile
                    value={`~${plan?.plannedDays ?? 0}`}
                    label="Days planned"
                  />
                  <StatTile
                    value={new Set(plan?.stops.map((stop) => stop.state)).size}
                    label="States"
                  />
                  <StatTile value="—" label="Days written" />
                </>
              )}
            </section>
          </div>

          <div className="min-w-0">
            {days.length > 0 && (
              <section>
                <h2 className="font-display text-xl tracking-wide uppercase">
                  Jump to a day
                </h2>
                <div className="mt-3">
                  <DayRail days={days} regionId={region.id} colors={colors} />
                </div>
              </section>
            )}

            {plan &&
              (() => {
                const remaining = plan.stops.filter(
                  (stop) => !plan.authored.has(stop.id),
                );
                if (remaining.length === 0) return null;
                const written = region.stops.length > 0;
                return (
                  <section className="mt-8">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h2 className="font-display text-xl tracking-wide uppercase">
                        {written ? "Still to come" : "Planned stops"}
                      </h2>
                      <p className="font-mono text-[10.5px] text-muted">
                        {remaining.length} of {plan.plannedStops} stops · ~
                        {remaining.reduce(
                          (total, stop) => total + stop.plannedDays,
                          0,
                        )}{" "}
                        days
                      </p>
                    </div>
                    <ol className="mt-4 divide-y divide-hairline border-y border-hairline">
                      {remaining.map((stop) => (
                        <li
                          key={stop.id}
                          className="flex items-center gap-3 py-2.5"
                        >
                          <span className="w-6 shrink-0 font-mono text-[10px] text-muted">
                            {stop.order}
                          </span>
                          <span className="font-cond text-[15px] font-bold tracking-wide uppercase">
                            {stop.name}
                          </span>
                          <span className="font-mono text-[10px] text-muted">
                            {stop.state}
                          </span>
                          <span className="ml-auto font-mono text-[10px] whitespace-nowrap text-muted">
                            ~{stop.plannedDays}d
                          </span>
                        </li>
                      ))}
                    </ol>
                  </section>
                );
              })()}

            {region.stops.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl tracking-wide uppercase">
                  Stops, in order
                </h2>
                <ol className="mt-4 space-y-5">
                  {region.stops.map((stop) => (
                    <li
                      key={stop.id}
                      className="overflow-hidden rounded-xl border border-hairline bg-surface"
                    >
                      <div className="flex">
                        <div
                          aria-hidden
                          className="w-2 shrink-0"
                          style={{ backgroundColor: colors[stop.id] }}
                        />
                        <div className="min-w-0 flex-1 p-4">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                              Stop {stop.order}
                            </span>
                            <Link
                              href={`/region/${region.id}/${stop.id}/`}
                              className="font-display text-xl tracking-wide uppercase"
                            >
                              {stop.name}
                            </Link>
                            <span className="font-mono text-[10px] text-muted">
                              {formatPlace(stop)}
                            </span>
                            <span className="ml-auto font-mono text-[10px] whitespace-nowrap text-muted">
                              {dayRange(stop) ?? "Days TBD"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-ink-soft">
                            {stop.summary}
                          </p>

                          <ul className="mt-3 divide-y divide-hairline border-t border-hairline">
                            {stop.days.map((day) => {
                              const minutes = (day.blocks ?? []).reduce(
                                (total, block) =>
                                  total +
                                  (block.item?.durationMins ??
                                    block.drive?.driveTimeMins ??
                                    0),
                                0,
                              );
                              return (
                                <li key={day.dayNumber}>
                                  <Link
                                    href={`/region/${region.id}/day/${day.dayNumber}/`}
                                    className="flex items-center gap-3 py-2.5"
                                  >
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink font-display text-sm text-canvas">
                                      {day.dayNumber}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block font-cond text-[15px] font-bold tracking-wide uppercase">
                                        {day.label}
                                      </span>
                                      <span className="block font-mono text-[10px] text-muted">
                                        {typeLabels[day.type]}
                                        {day.commute
                                          ? ` · ${formatDuration(day.commute.driveTimeMins)} drive`
                                          : ""}
                                        {minutes
                                          ? ` · ${formatDuration(minutes)} planned`
                                          : ""}
                                      </span>
                                    </span>
                                    <span
                                      aria-hidden
                                      className="ml-auto text-muted"
                                    >
                                      →
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
