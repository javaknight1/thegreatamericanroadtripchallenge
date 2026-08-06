/**
 * A stop's color ties its map pin to its day chips in the rail. Deliberately
 * distinct from the 18 category colors, which belong to individual activities.
 */
const PALETTE = [
  "#C2521C",
  "#1E7C8C",
  "#5E6B45",
  "#7B4E86",
  "#9A3B2C",
  "#2F6DA3",
  "#B07A16",
  "#4B6C4E",
];

export function stopColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

/** Stop id → color, in the region's own stop order. */
export function stopColorMap(stopIds: string[]): Record<string, string> {
  return Object.fromEntries(stopIds.map((id, index) => [id, stopColor(index)]));
}
