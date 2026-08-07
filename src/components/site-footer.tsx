import Link from "next/link";
import { getTrip } from "@/lib/content";

export function SiteFooter() {
  const trip = getTrip();

  return (
    <footer className="mt-14 bg-chrome text-canvas/80">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="font-display text-lg tracking-wider uppercase">
          {trip.title}
        </p>
        <p className="mt-2 max-w-2xl font-mono text-[11px] leading-relaxed tracking-wide">
          {trip.tagline}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-cond text-sm font-semibold tracking-wider uppercase">
          <Link href="/" className="transition-colors hover:text-gold">
            The trip
          </Link>
          <Link href="/#regions" className="transition-colors hover:text-gold">
            Regions
          </Link>
          <Link href="/calendar/" className="transition-colors hover:text-gold">
            Calendar
          </Link>
          <Link
            href="/packing-list/"
            className="transition-colors hover:text-gold"
          >
            Packing list
          </Link>
        </div>

        <p className="mt-6 font-mono text-[10px] tracking-wide text-canvas/55">
          Hand-curated. No accounts, no tracking, no algorithm — just the
          itinerary.
        </p>
      </div>
    </footer>
  );
}
