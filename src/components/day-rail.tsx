import Link from "next/link";
import type { DayType } from "@/types/trip";

export type DayRef = {
  dayNumber: number;
  label: string;
  shortLabel: string;
  type: DayType;
  stopId: string;
  stopName: string;
};

/**
 * The horizontal strip of every day in the region. Each chip is a link to that
 * day's page and carries its stop's color, which is the same color the stop
 * wears on the map — that is the whole correlation mechanism.
 */
export function DayRail({
  days,
  regionId,
  colors,
  currentDay,
}: {
  days: DayRef[];
  regionId: string;
  colors: Record<string, string>;
  currentDay?: number;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border border-hairline bg-raised p-1.5">
      {days.map((day) => {
        const on = day.dayNumber === currentDay;
        return (
          <Link
            key={day.dayNumber}
            href={`/region/${regionId}/day/${day.dayNumber}/`}
            aria-current={on ? "page" : undefined}
            title={day.label}
            className={`w-[76px] shrink-0 rounded-lg px-1.5 py-2 text-center transition-opacity ${
              on ? "opacity-100 ring-2 ring-ink" : "opacity-65 hover:opacity-100"
            }`}
            style={{ backgroundColor: colors[day.stopId] ?? "var(--color-accent)" }}
          >
            <span className="block font-display text-base leading-none text-white">{day.dayNumber}</span>
            <span className="mt-1 block truncate font-mono text-[9px] tracking-wide text-white/90 uppercase">
              {day.shortLabel}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
