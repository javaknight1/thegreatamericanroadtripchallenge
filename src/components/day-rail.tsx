"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
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
 *
 * Each day is a separate page, so the rail is rebuilt on every navigation and
 * would otherwise snap back to day 1 the moment you clicked day 40. It keeps
 * its scroll offset per leg in sessionStorage and restores it before paint, so
 * clicking a chip leaves the bar exactly where you left it. The only time it
 * moves itself is when the day you landed on is off-screen — then it scrolls
 * the minimum needed to reveal that chip.
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
  const railRef = useRef<HTMLDivElement>(null);
  const storageKey = `day-rail:${regionId}`;

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const saved = sessionStorage.getItem(storageKey);
    if (saved !== null) rail.scrollLeft = Number(saved);

    const chip = currentDay
      ? rail.querySelector<HTMLElement>(`[data-day="${currentDay}"]`)
      : null;

    if (chip) {
      const left = chip.offsetLeft - rail.offsetLeft;
      const right = left + chip.offsetWidth;
      const firstVisit = saved === null;

      if (firstVisit) {
        // Nothing to preserve yet — center the day you arrived on.
        rail.scrollLeft = left - rail.clientWidth / 2 + chip.offsetWidth / 2;
      } else if (left < rail.scrollLeft) {
        rail.scrollLeft = left - 8;
      } else if (right > rail.scrollLeft + rail.clientWidth) {
        rail.scrollLeft = right - rail.clientWidth + 8;
      }
    }

    const remember = () =>
      sessionStorage.setItem(storageKey, String(rail.scrollLeft));
    remember();
    rail.addEventListener("scroll", remember, { passive: true });
    return () => rail.removeEventListener("scroll", remember);
  }, [storageKey, currentDay]);

  return (
    <div
      ref={railRef}
      className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border border-hairline bg-raised p-1.5"
    >
      {days.map((day) => {
        const on = day.dayNumber === currentDay;
        return (
          <Link
            key={day.dayNumber}
            href={`/region/${regionId}/day/${day.dayNumber}/`}
            data-day={day.dayNumber}
            aria-current={on ? "page" : undefined}
            title={day.label}
            className={`w-[76px] shrink-0 rounded-lg px-1.5 py-2 text-center transition-opacity ${
              on
                ? "opacity-100 ring-2 ring-ink"
                : "opacity-65 hover:opacity-100"
            }`}
            style={{
              backgroundColor: colors[day.stopId] ?? "var(--color-accent)",
            }}
          >
            <span className="block font-display text-base leading-none text-white">
              {day.dayNumber}
            </span>
            <span className="mt-1 block truncate font-mono text-[9px] tracking-wide text-white/90 uppercase">
              {day.shortLabel}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
