"use client";

import { useState } from "react";
import { DayCard } from "@/components/day-card";
import { contrastText } from "@/lib/format";
import type { Category, Day } from "@/types/trip";

/**
 * The stop's day list plus a category filter. This is the only interactive
 * piece on the site — no state leaves the page, nothing is persisted.
 */
export function StopDays({
  days,
  categories,
  usedCategoryIds,
}: {
  days: Day[];
  categories: Record<string, Category>;
  /** Categories that actually appear at this stop, in trip order. */
  usedCategoryIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const visibleCategoryIds = selected.length ? selected : undefined;

  const toggle = (categoryId: string) =>
    setSelected((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );

  return (
    <>
      {usedCategoryIds.length > 1 && (
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">Filter</span>
            {usedCategoryIds.map((categoryId) => {
              const category = categories[categoryId];
              if (!category) return null;
              const on = selected.includes(categoryId);
              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => toggle(categoryId)}
                  aria-pressed={on}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    on ? "border-transparent" : "border-hairline bg-surface text-muted hover:text-ink"
                  }`}
                  style={on ? { backgroundColor: category.color, color: contrastText(category.color) } : undefined}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: on ? contrastText(category.color) : category.color }}
                  />
                  {category.label}
                </button>
              );
            })}
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-full px-2.5 py-1 text-xs font-medium text-accent underline underline-offset-4"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-12">
        {days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            categories={categories}
            visibleCategoryIds={visibleCategoryIds}
          />
        ))}
      </div>
    </>
  );
}
