import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StopDays } from "@/components/stop-days";
import { getStop, getTrip, itemsOf } from "@/lib/content";
import { dayRange } from "@/lib/derive";
import { formatPlace, mapUrl } from "@/lib/format";
import type { Category } from "@/types/trip";

type Params = { regionId: string; stopId: string };

export function generateStaticParams(): Params[] {
  return getTrip().regions.flatMap((region) =>
    region.stops.map((stop) => ({ regionId: region.id, stopId: stop.id })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { regionId, stopId } = await params;
  const found = getStop(regionId, stopId);
  if (!found) return {};
  return {
    title: `${found.stop.name}, ${found.stop.state}`,
    description: found.stop.summary,
  };
}

export default async function StopPage({ params }: { params: Promise<Params> }) {
  const { regionId, stopId } = await params;
  const found = getStop(regionId, stopId);
  if (!found) notFound();

  const { region, stop } = found;
  const trip = getTrip();

  // Passed to the client filter as a plain object, in trip-defined order.
  const categories: Record<string, Category> = Object.fromEntries(
    trip.categories.map((category) => [category.id, category]),
  );
  const present = new Set(stop.days.flatMap((day) => itemsOf(day)).map((item) => item.categoryId));
  const usedCategoryIds = trip.categories.filter((category) => present.has(category.id)).map((c) => c.id);

  const index = region.stops.findIndex((candidate) => candidate.id === stop.id);
  const previous = region.stops[index - 1];
  const next = region.stops[index + 1];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href={`/region/${region.id}/`} className="text-sm text-muted underline decoration-dotted underline-offset-4">
        ← {region.name}
      </Link>

      <header className="mt-4">
        <p className="font-mono text-xs text-muted">{dayRange(stop) ?? "Days TBD"}</p>
        <h1 className="mt-1 font-display text-4xl leading-tight font-semibold sm:text-5xl">{stop.name}</h1>
        <a
          href={mapUrl({ ...stop.location, name: formatPlace(stop) })}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-highway underline decoration-dotted underline-offset-4"
        >
          {formatPlace(stop)} <span aria-hidden>↗</span>
        </a>
        <p className="mt-3 text-base leading-relaxed text-muted">{stop.summary}</p>
      </header>

      {stop.seasonalTip && (
        <p className="mt-5 rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm leading-relaxed">
          <span className="font-semibold text-accent">Timing: </span>
          {stop.seasonalTip}
        </p>
      )}

      {(stop.lodging.length > 0 || stop.foodMustTry.length > 0) && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {stop.lodging.length > 0 && (
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">Where to stay</h2>
              <ul className="mt-3 space-y-3">
                {stop.lodging.map((place) => (
                  <li key={place.name}>
                    {place.mapLink ? (
                      <a
                        href={place.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-highway underline decoration-dotted underline-offset-4"
                      >
                        {place.name} <span aria-hidden>↗</span>
                      </a>
                    ) : (
                      <p className="text-sm font-semibold">{place.name}</p>
                    )}
                    <p className="mt-0.5 text-sm text-muted">{place.blurb}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stop.foodMustTry.length > 0 && (
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">You gotta eat this</h2>
              <ul className="mt-3 space-y-3">
                {stop.foodMustTry.map((food) => (
                  <li key={food.name}>
                    <p className="text-sm font-semibold">{food.name}</p>
                    <p className="mt-0.5 text-sm text-muted">{food.blurb}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-semibold">Day by day</h2>
        <StopDays days={stop.days} categories={categories} usedCategoryIds={usedCategoryIds} />
      </section>

      <nav className="mt-16 flex flex-wrap justify-between gap-3 border-t border-hairline pt-6 text-sm">
        {previous ? (
          <Link href={`/region/${region.id}/${previous.id}/`} className="text-highway underline underline-offset-4">
            ← {previous.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/region/${region.id}/${next.id}/`} className="ml-auto text-highway underline underline-offset-4">
            {next.name} →
          </Link>
        ) : (
          <Link href={`/region/${region.id}/`} className="ml-auto text-highway underline underline-offset-4">
            Back to {region.name} →
          </Link>
        )}
      </nav>
    </div>
  );
}
