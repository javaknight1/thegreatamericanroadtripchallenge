import { contrastText } from "@/lib/format";
import type { Category } from "@/types/trip";

/**
 * The visual backbone of the site: every item wears its category color.
 * Colors come from content/trip.json so one edit restyles the whole trip.
 */
export function CategoryBadge({
  category,
  count,
}: {
  category: Category;
  count?: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: category.color,
        color: contrastText(category.color),
      }}
    >
      {category.label}
      {count != null && <span className="opacity-75">{count}</span>}
    </span>
  );
}

/** Quieter variant for dense lists — a color dot plus the label. */
export function CategoryDot({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      {category.label}
    </span>
  );
}
