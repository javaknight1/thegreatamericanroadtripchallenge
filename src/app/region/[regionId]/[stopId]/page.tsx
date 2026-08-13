import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryDot } from "@/components/category-badge";
import { getStop, getTrip, itemsOf } from "@/lib/content";
import { dayRange } from "@/lib/derive";
import { regionTheme, regionThemeStyle } from "@/lib/region-theme";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, stopSchema } from "@/lib/schema-org";
import { canonical, stopDescription, shareImage } from "@/lib/seo";
import { formatDuration, formatPlace, mapUrl } from "@/lib/format";

type Params = { regionId: string; stopId: string };

export function generateStaticParams(): Params[] {
  return getTrip().regions.flatMap((region) =>
    region.stops.map((stop) => ({ regionId: region.id, stopId: stop.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { regionId, stopId } = await params;
  const found = getStop(regionId, stopId);
  if (!found) return {};
  const path = `region/${found.region.id}/${found.stop.id}`;
  const description = stopDescription(found.stop, found.region);
  return {
    title: `${found.stop.name}, ${found.stop.state}`,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: {
      title: `${found.stop.name}, ${found.stop.state}`,
      description,
      url: canonical(path),
      type: "article",
      images: [shareImage(`Map of ${found.region.name}`, found.region.id)],
    },
    twitter: {
      card: "summary_large_image",
      images: [shareImage(`Map of ${found.region.name}`, found.region.id)],
    },
  };
}

const typeLabels = {
  active: "Full day",
  free: "Free day",
  commute: "Drive day",
} as const;

/**
 * A stop's briefing: where to sleep, what to eat, and an index into its days.
 * The days themselves live on the region page, which is the one place the
 * hour-by-hour view is rendered.
 */
export default async function StopPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { regionId, stopId } = await params;
  const found = getStop(regionId, stopId);
  if (!found) notFound();

  const { region, stop } = found;
  const trip = getTrip();

  const present = new Set(
    stop.days.flatMap(itemsOf).map((item) => item.categoryId),
  );
  const usedCategories = trip.categories.filter((category) =>
    present.has(category.id),
  );

  const index = region.stops.findIndex((candidate) => candidate.id === stop.id);
  const previous = region.stops[index - 1];
  const next = region.stops[index + 1];

  const theme = regionTheme(region.id);

  return (
    <div style={regionThemeStyle(theme)}>
      <JsonLd data={stopSchema(stop, region)} />
      <JsonLd
        data={breadcrumbs([
          { name: "The Great American Road Trip Challenge", path: "/" },
          { name: region.name, path: `region/${region.id}` },
          { name: stop.name, path: `region/${region.id}/${stop.id}` },
        ])}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={`/region/${region.id}/`}
          className="font-mono text-[11px] tracking-wide text-muted uppercase"
        >
          ← {region.name}
        </Link>

        <header className="mt-4">
          <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
            Stop {stop.order} · {dayRange(stop) ?? "Days TBD"}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-none tracking-wide uppercase sm:text-6xl">
            {stop.name}
          </h1>
          <a
            href={mapUrl({ ...stop.location, name: formatPlace(stop) })}
            target="_blank"
            rel="noopener noreferrer"
            className="pin-link mt-2 inline-flex items-center gap-1.5 border-b border-dashed border-accent pb-0.5 font-mono text-[11px] text-accent"
          >
            {formatPlace(stop)}
          </a>
          <p className="mt-3 text-base text-ink-soft">{stop.summary}</p>
        </header>

        {stop.seasonalTip && (
          <p className="mt-5 rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm">
            <span className="font-cond font-bold tracking-wide text-accent uppercase">
              Timing:{" "}
            </span>
            {stop.seasonalTip}
          </p>
        )}

        {(stop.lodging.length > 0 || stop.foodMustTry.length > 0) && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            {stop.lodging.length > 0 && (
              <div className="rounded-xl border border-hairline bg-surface p-5">
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                  Where to stay
                </h2>
                <ul className="mt-3 space-y-3">
                  {stop.lodging.map((place) => (
                    <li key={place.name}>
                      <p className="font-cond text-[15.5px] font-bold uppercase">
                        {place.name}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-soft">
                        {place.blurb}
                      </p>
                      {place.mapLink && (
                        <a
                          href={place.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pin-link mt-1.5 inline-flex items-center gap-1.5 border-b border-dashed border-accent pb-0.5 font-mono text-[10.5px] text-accent"
                        >
                          Open in Maps
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stop.foodMustTry.length > 0 && (
              <div className="rounded-xl border border-hairline bg-surface p-5">
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                  You gotta eat this
                </h2>
                <ul className="mt-3 space-y-3">
                  {stop.foodMustTry.map((food) => (
                    <li key={food.name}>
                      <p className="font-cond text-[15.5px] font-bold uppercase">
                        {food.name}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-soft">
                        {food.blurb}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-display text-xl tracking-wide uppercase">
            The days here
          </h2>
          <p className="mt-1 font-mono text-[10.5px] tracking-wide text-muted">
            Each day opens its own hour-by-hour page
          </p>
          <ol className="mt-4 divide-y divide-hairline border-y border-hairline">
            {stop.days.map((day) => {
              const minutes = (day.blocks ?? []).reduce(
                (total, block) =>
                  total +
                  (block.item?.durationMins ?? block.drive?.driveTimeMins ?? 0),
                0,
              );
              return (
                <li key={day.dayNumber}>
                  <Link
                    href={`/region/${region.id}/day/${day.dayNumber}/`}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink font-display text-base text-canvas">
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
                        {minutes ? ` · ${formatDuration(minutes)} planned` : ""}
                      </span>
                    </span>
                    <span aria-hidden className="ml-auto text-muted">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {usedCategories.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
              What this stop is made of
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {usedCategories.map((category) => (
                <li key={category.id}>
                  <CategoryDot category={category} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="mt-10 flex flex-wrap justify-between gap-3 border-t border-hairline pt-6 font-cond text-sm font-bold tracking-wide uppercase">
          {previous ? (
            <Link
              href={`/region/${region.id}/${previous.id}/`}
              className="text-accent"
            >
              ← {previous.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/region/${region.id}/${next.id}/`}
              className="ml-auto text-accent"
            >
              {next.name} →
            </Link>
          ) : (
            <Link
              href={`/region/${region.id}/`}
              className="ml-auto text-accent"
            >
              Back to {region.name} →
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
