import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DayPanel } from "@/components/day-panel";
import { DayRail } from "@/components/day-rail";
import { RegionMap } from "@/components/region-map";
import { getRegion, getTrip } from "@/lib/content";
import { regionMapData } from "@/lib/geo";
import { regionTheme, regionThemeStyle } from "@/lib/region-theme";
import { categoryIndex, findDay, regionDays } from "@/lib/region-view";
import { stopColorMap } from "@/lib/stop-colors";

type Params = { regionId: string; dayNumber: string };

export function generateStaticParams(): Params[] {
  return getTrip().regions.flatMap((region) =>
    region.stops.flatMap((stop) =>
      stop.days.map((day) => ({ regionId: region.id, dayNumber: String(day.dayNumber) })),
    ),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { regionId, dayNumber } = await params;
  const region = getRegion(regionId);
  const found = region && findDay(region, Number(dayNumber));
  if (!region || !found) return {};
  return {
    title: `${found.day.label} · ${found.stop.name}`,
    description: found.day.summary,
  };
}

/**
 * One day, on its own static page. Days are pages rather than client-side
 * state so each one is linkable, prerendered, and carries only its own
 * content — a 700-day itinerary never becomes a 700-day payload.
 */
export default async function DayPage({ params }: { params: Promise<Params> }) {
  const { regionId, dayNumber } = await params;
  const region = getRegion(regionId);
  if (!region) notFound();

  const found = findDay(region, Number(dayNumber));
  if (!found) notFound();

  const { stop, day } = found;
  const trip = getTrip();
  const theme = regionTheme(region.id);
  const map = regionMapData(region);
  const colors = stopColorMap(region.stops.map((candidate) => candidate.id));
  const days = regionDays(region);

  const index = days.findIndex((candidate) => candidate.dayNumber === day.dayNumber);
  const previous = days[index - 1];
  const next = days[index + 1];

  return (
    <div style={regionThemeStyle(theme)}>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-wide text-muted uppercase">
          <Link href={`/region/${region.id}/`}>← {region.name}</Link>
          <span aria-hidden>·</span>
          <Link href={`/region/${region.id}/${stop.id}/`}>{stop.name}</Link>
        </div>

        {map && (
          <section className="mt-4">
            <RegionMap map={map} theme={theme} regionId={region.id} colors={colors} activeStopId={stop.id} />
          </section>
        )}

        <section className="mt-4">
          <DayRail days={days} regionId={region.id} colors={colors} currentDay={day.dayNumber} />
        </section>

        <div className="mt-5">
          <DayPanel day={day} place={stop.name} categories={categoryIndex(trip)} />
        </div>

        <nav className="mt-4 flex gap-2.5">
          {previous ? (
            <Link
              href={`/region/${region.id}/day/${previous.dayNumber}/`}
              className="flex-1 rounded-lg border-[1.5px] border-ink bg-canvas px-3 py-3 text-center font-cond text-sm font-bold tracking-wider uppercase"
            >
              ← Day {previous.dayNumber}
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/region/${region.id}/day/${next.dayNumber}/`}
              className="flex-1 rounded-lg border-[1.5px] border-ink bg-ink px-3 py-3 text-center font-cond text-sm font-bold tracking-wider text-canvas uppercase"
            >
              Day {next.dayNumber} →
            </Link>
          ) : (
            <Link
              href={`/region/${region.id}/`}
              className="flex-1 rounded-lg border-[1.5px] border-ink bg-ink px-3 py-3 text-center font-cond text-sm font-bold tracking-wider text-canvas uppercase"
            >
              End of leg →
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
