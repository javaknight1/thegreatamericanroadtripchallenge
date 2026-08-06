import Link from "next/link";
import { getTrip } from "@/lib/content";

export function SiteHeader() {
  const trip = getTrip();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-accent bg-chrome text-canvas">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="min-w-0 flex-1">
          <span className="block truncate font-display text-[15px] leading-none tracking-wider uppercase sm:text-[17px]">
            {trip.title}
          </span>
          <span className="mt-1 block truncate font-mono text-[9px] tracking-[0.2em] text-gold uppercase sm:text-[10px]">
            {trip.durationEstimate} · 48 states · one loop
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 rounded-full bg-chrome-2 p-1">
          <Link
            href="/#regions"
            className="rounded-full px-3 py-1.5 font-cond text-[13px] font-semibold tracking-wider text-canvas/70 uppercase transition-colors hover:text-canvas"
          >
            Regions
          </Link>
          <Link
            href="/packing-list/"
            className="rounded-full px-3 py-1.5 font-cond text-[13px] font-semibold tracking-wider text-canvas/70 uppercase transition-colors hover:text-canvas"
          >
            Packing
          </Link>
        </nav>
      </div>
    </header>
  );
}
