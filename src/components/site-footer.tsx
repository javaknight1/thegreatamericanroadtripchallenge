import Link from "next/link";
import { getTrip } from "@/lib/content";

export function SiteFooter() {
  const trip = getTrip();

  return (
    <footer className="mt-16 border-t border-hairline bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="font-display text-lg font-semibold">{trip.title}</p>
        <p className="mt-1 max-w-2xl text-sm text-muted">{trip.tagline}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/" className="text-muted transition-colors hover:text-ink">
            The trip
          </Link>
          <Link href="/#regions" className="text-muted transition-colors hover:text-ink">
            Regions
          </Link>
          <Link href="/packing-list/" className="text-muted transition-colors hover:text-ink">
            Packing list
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">
          Hand-curated. No accounts, no tracking, no algorithm — just the itinerary.
        </p>
      </div>
    </footer>
  );
}
