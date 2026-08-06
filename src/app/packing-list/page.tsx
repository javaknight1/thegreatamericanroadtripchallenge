import type { Metadata } from "next";
import { getTrip } from "@/lib/content";
import { packingList } from "@/lib/derive";

export const metadata: Metadata = {
  title: "Packing list",
  description: "Every piece of gear the itinerary calls for, aggregated from the activities themselves.",
};

export default function PackingListPage() {
  const trip = getTrip();
  const entries = packingList(trip);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">Packing list</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        Nobody wrote this list. It&apos;s assembled from the gear every activity in the itinerary calls for — so it
        grows as the route does, and nothing on it is here without a reason.
      </p>

      {entries.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-hairline p-5 text-sm text-muted">
          No gear has been specified yet. As activities are published with their gear requirements, they show up here
          automatically.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
          {entries.map((entry) => (
            <li key={entry.gear} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-4">
              <span className="font-display text-lg font-semibold">{entry.gear}</span>
              <span className="text-xs text-muted">{entry.regions.join(" · ")}</span>
              <span className="ml-auto font-mono text-xs text-muted">
                {entry.count} {entry.count === 1 ? "activity" : "activities"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
