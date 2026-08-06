import Link from "next/link";
import { getTrip } from "@/lib/content";

export function SiteHeader() {
  const trip = getTrip();

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-accent text-[10px] font-bold tracking-tight text-accent"
          >
            US
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base leading-tight font-semibold sm:text-lg">
              {trip.title}
            </span>
            <span className="hidden text-xs text-muted sm:block">{trip.durationEstimate} · one continuous loop</span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 text-sm">
          <Link
            href="/#regions"
            className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            Regions
          </Link>
          <Link
            href="/packing-list/"
            className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            Packing
          </Link>
        </nav>
      </div>
    </header>
  );
}
