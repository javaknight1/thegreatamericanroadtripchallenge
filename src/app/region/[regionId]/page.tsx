import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatTile } from "@/components/stat-tile";
import { getRegion, getTrip } from "@/lib/content";
import { dayRange, regionStats } from "@/lib/derive";
import { formatPlace } from "@/lib/format";

type Params = { regionId: string };

export function generateStaticParams(): Params[] {
  return getTrip().regions.map((region) => ({ regionId: region.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { regionId } = await params;
  const region = getRegion(regionId);
  if (!region) return {};
  return { title: region.name, description: region.summary };
}

export default async function RegionPage({ params }: { params: Promise<Params> }) {
  const { regionId } = await params;
  const region = getRegion(regionId);
  if (!region) notFound();

  const stats = regionStats(region);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/#regions" className="text-sm text-muted underline decoration-dotted underline-offset-4">
        ← All regions
      </Link>

      <header className="mt-4">
        <p className="font-mono text-xs text-muted">Leg {region.order}</p>
        <h1 className="mt-1 font-display text-4xl leading-tight font-semibold sm:text-5xl">{region.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{region.summary}</p>
      </header>

      <div className="mt-6 rounded-xl border border-accent/30 bg-accent-soft p-4 sm:p-5">
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">Time it right — {region.season}</p>
        <p className="mt-2 text-sm leading-relaxed">{region.seasonNote}</p>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={stats.stops} label="Stops" />
        <StatTile value={stats.days} label="Days" />
        <StatTile value={stats.items} label="Things to do" />
        <StatTile value={stats.states.length} label="States" />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Stops, in order</h2>
        <ol className="mt-5 space-y-4">
          {region.stops.map((stop) => (
            <li key={stop.id}>
              <Link
                href={`/region/${region.id}/${stop.id}/`}
                className="block rounded-xl border border-hairline bg-surface p-5 transition-colors hover:border-accent/50"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-muted">{dayRange(stop) ?? "Days TBD"}</span>
                  <h3 className="font-display text-xl font-semibold">{stop.name}</h3>
                  <span className="text-sm text-muted">{formatPlace(stop)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{stop.summary}</p>
                {stop.seasonalTip && (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Timing: </span>
                    <span className="text-muted">{stop.seasonalTip}</span>
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
