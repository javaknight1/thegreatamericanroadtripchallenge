import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getTrip } from "@/lib/content";
import { tripStats } from "@/lib/derive";
import { regionTheme } from "@/lib/region-theme";
import { breadcrumbs } from "@/lib/schema-org";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "All 735 days of the Great American Road Trip Challenge on one page — every day of every leg, colour-coded, laid out week by week.",
  alternates: { canonical: canonical("calendar") },
};

/**
 * The whole trip as a grid of days.
 *
 * Deliberately *not* dated. The itinerary numbers its days rather than fixing
 * them to a calendar, because the reader picks their own start — so this shows
 * weeks (rows of seven) inside each leg rather than inventing a September the
 * 22nd that nobody promised. That keeps it honest and still answers the
 * question a calendar is for: where am I in this thing, and what's coming.
 */
const typeStyles = {
  active: { label: "Full day", opacity: 1 },
  commute: { label: "Drive day", opacity: 0.4 },
  free: { label: "Free day", opacity: 1 },
} as const;

export default function CalendarPage() {
  const trip = getTrip();
  const stats = tripStats(trip);

  const legs = trip.regions
    .filter((region) => region.stops.length > 0)
    .map((region) => {
      const days = region.stops.flatMap((stop) =>
        stop.days.map((day) => ({
          dayNumber: day.dayNumber,
          type: day.type,
          label: day.label,
          stop: stop.name,
        })),
      );
      return {
        id: region.id,
        name: region.name,
        order: region.order,
        season: region.season,
        accent: regionTheme(region.id).accent,
        days,
      };
    });

  return (
    <div className="mx-auto max-w-4xl px-4 pt-5 pb-10 sm:px-6 sm:pt-8 sm:pb-16">
      <JsonLd
        data={breadcrumbs([
          { name: "The Great American Road Trip Challenge", path: "/" },
          { name: "Calendar", path: "calendar" },
        ])}
      />

      <h1 className="font-display text-[2.1rem] leading-[1.02] tracking-wide uppercase sm:text-5xl">
        The calendar
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
        Every one of the {stats.days} days, in order. Each square is a day, and
        the colour is the leg it belongs to — tap one to open it. Days are
        numbered rather than dated, because you choose the start.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        <span className="font-cond font-bold tracking-wide text-ink uppercase">
          Best time to start:{" "}
        </span>
        {trip.recommendedStart}
      </p>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-hairline bg-surface p-4">
        {(["active", "free", "commute"] as const).map((type) => (
          <span key={type} className="flex items-center gap-2 text-xs text-muted">
            <span
              aria-hidden
              className={`size-3.5 rounded-[3px] bg-ink ${
                type === "free" ? "ring-2 ring-ink ring-offset-1 ring-offset-surface" : ""
              }`}
              style={{ opacity: typeStyles[type].opacity }}
            />
            {typeStyles[type].label}
          </span>
        ))}
        <span className="text-xs text-muted">
          {stats.activeDays} full · {stats.freeDays} free · {stats.commuteDays} driving
        </span>
      </div>

      <div className="mt-8 space-y-8">
        {legs.map((leg) => (
          <section key={leg.id}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                aria-hidden
                className="size-3 shrink-0 translate-y-px rounded-full"
                style={{ backgroundColor: leg.accent }}
              />
              <h2 className="font-cond text-lg font-bold tracking-wide uppercase">
                <Link href={`/region/${leg.id}/`}>{leg.name}</Link>
              </h2>
              <span className="font-mono text-[10px] text-muted tabular-nums">
                Days {leg.days[0]?.dayNumber}–{leg.days.at(-1)?.dayNumber} ·{" "}
                {leg.days.length} days · {leg.season}
              </span>
            </div>

            {/* Seven across on a phone, fourteen on a wider screen — the run
                stays readable either way without the squares turning huge. */}
            <ol className="mt-2.5 grid grid-cols-7 gap-1 sm:grid-cols-14">
              {leg.days.map((day) => (
                <li key={day.dayNumber}>
                  <Link
                    href={`/region/${leg.id}/day/${day.dayNumber}/`}
                    title={`${day.label} — ${day.stop}`}
                    className={`flex aspect-square items-center justify-center rounded-[3px] font-mono text-[9px] leading-none text-white/90 tabular-nums transition-transform hover:scale-110 ${
                      day.type === "free"
                        ? "ring-2 ring-ink ring-offset-1 ring-offset-canvas"
                        : ""
                    }`}
                    style={{
                      backgroundColor: leg.accent,
                      opacity: typeStyles[day.type].opacity,
                    }}
                  >
                    {day.dayNumber}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
