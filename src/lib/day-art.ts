import type { Day } from "@/types/trip";

/**
 * A deterministic SVG landscape for each day's header.
 *
 * The terrain is chosen from what the day actually contains — a park day gets
 * ridgelines, a city day gets a skyline, a drive day gets a road running to the
 * horizon — and the silhouette is seeded by dayNumber, so a given day always
 * draws the same picture. No images to ship, no fetches, and it scales to a
 * four-year itinerary without anyone commissioning artwork.
 */

export type Terrain = "mountains" | "coast" | "city" | "road" | "plains";

export type DayArt = {
  terrain: Terrain;
  /** Sky gradient stops, top to bottom. */
  sky: [string, string];
  /** Back-to-front silhouette layers. */
  layers: Array<{ d: string; fill: string }>;
  /** Sun/moon disc position, in the 0–100 × 0–60 art viewBox. */
  disc?: { cx: number; cy: number; r: number; fill: string };
};

const WIDTH = 100;
const HEIGHT = 60;

const palettes: Record<Terrain, { sky: [string, string]; ridge: string[]; disc: string }> = {
  mountains: { sky: ["#2c3e50", "#c2703f"], ridge: ["#3d4a52", "#2a343b", "#171d22"], disc: "#f2c078" },
  coast: { sky: ["#1f4f63", "#d8925a"], ridge: ["#2d6076", "#1b4152", "#12262f"], disc: "#f6d08a" },
  city: { sky: ["#22262e", "#7c4a3a"], ridge: ["#343a45", "#242932", "#14171d"], disc: "#e8b25e" },
  road: { sky: ["#3a4a5c", "#c58a4a"], ridge: ["#4a5462", "#333c46", "#1c2129"], disc: "#f4cf94" },
  plains: { sky: ["#33455a", "#cf9350"], ridge: ["#5e6b45", "#3f4a31", "#232a1d"], disc: "#f2c078" },
};

/** Small deterministic PRNG — same day number, same landscape, every build. */
function seeded(seed: number) {
  let state = (seed * 9301 + 49297) % 233280;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/** Categories that imply a landform, in priority order. */
const terrainByCategory: Array<[Terrain, string[]]> = [
  ["mountains", ["national-parks", "skiing"]],
  ["coast", ["outdoor-water"]],
  ["city", ["cities", "capitols", "museums-history", "concerts-venues", "sports", "shopping", "somber-sites"]],
  ["plains", ["festivals", "quirky", "food-drink", "guided-tours", "landmarks", "theme-parks"]],
];

export function terrainFor(day: Day): Terrain {
  if (day.type === "commute") return "road";

  const categoryIds = [
    ...(day.blocks ?? []).flatMap((block) => (block.item ? [block.item.categoryId] : [])),
    ...(day.freeMenu?.map((item) => item.categoryId) ?? []),
  ];

  for (const [terrain, ids] of terrainByCategory) {
    if (categoryIds.some((categoryId) => ids.includes(categoryId))) return terrain;
  }
  return "plains";
}

/** A jagged ridge across the full width, anchored to the bottom of the frame. */
function ridge(random: () => number, baseline: number, amplitude: number, steps: number): string {
  const points: string[] = [`M0,${HEIGHT}`, `L0,${baseline + random() * amplitude}`];
  for (let step = 1; step <= steps; step += 1) {
    const x = (WIDTH / steps) * step;
    const y = baseline + (random() - 0.5) * amplitude * 2;
    points.push(`L${x.toFixed(1)},${Math.max(4, Math.min(HEIGHT - 2, y)).toFixed(1)}`);
  }
  points.push(`L${WIDTH},${HEIGHT}`, "Z");
  return points.join(" ");
}

/** A blocky skyline: towers of varying height along the baseline. */
function skyline(random: () => number, baseline: number, maxHeight: number): string {
  const parts: string[] = [`M0,${HEIGHT}`, `L0,${baseline}`];
  let x = 0;
  while (x < WIDTH) {
    const w = 3 + random() * 7;
    const h = baseline - random() * maxHeight;
    parts.push(`L${x.toFixed(1)},${h.toFixed(1)}`, `L${Math.min(WIDTH, x + w).toFixed(1)},${h.toFixed(1)}`);
    x += w;
  }
  parts.push(`L${WIDTH},${baseline}`, `L${WIDTH},${HEIGHT}`, "Z");
  return parts.join(" ");
}

/** Gentle swells for water and open country. */
function swell(random: () => number, baseline: number, amplitude: number): string {
  const parts: string[] = [`M0,${HEIGHT}`, `L0,${baseline}`];
  for (let x = 0; x <= WIDTH; x += 10) {
    const control = baseline - amplitude * (random() - 0.3);
    parts.push(`Q${(x + 5).toFixed(1)},${control.toFixed(1)} ${Math.min(WIDTH, x + 10)},${baseline.toFixed(1)}`);
  }
  parts.push(`L${WIDTH},${HEIGHT}`, "Z");
  return parts.join(" ");
}

export function dayArt(day: Day): DayArt {
  const terrain = terrainFor(day);
  const palette = palettes[terrain];
  const random = seeded(day.dayNumber * 37 + terrain.length);

  const layers: DayArt["layers"] = [];

  if (terrain === "mountains") {
    layers.push(
      { d: ridge(random, 30, 9, 7), fill: palette.ridge[0] },
      { d: ridge(random, 38, 8, 6), fill: palette.ridge[1] },
      { d: ridge(random, 47, 6, 9), fill: palette.ridge[2] },
    );
  } else if (terrain === "city") {
    layers.push(
      { d: skyline(random, 42, 20), fill: palette.ridge[0] },
      { d: skyline(random, 50, 16), fill: palette.ridge[1] },
      { d: swell(random, 56, 2), fill: palette.ridge[2] },
    );
  } else if (terrain === "coast") {
    layers.push(
      { d: ridge(random, 34, 7, 5), fill: palette.ridge[0] },
      { d: swell(random, 46, 3), fill: palette.ridge[1] },
      { d: swell(random, 54, 2), fill: palette.ridge[2] },
    );
  } else if (terrain === "road") {
    layers.push(
      { d: ridge(random, 36, 6, 6), fill: palette.ridge[0] },
      { d: swell(random, 46, 2), fill: palette.ridge[1] },
      // The road itself: a wedge narrowing to the horizon.
      { d: `M38,${HEIGHT} L47,46 L53,46 L62,${HEIGHT} Z`, fill: palette.ridge[2] },
    );
  } else {
    layers.push(
      { d: swell(random, 40, 4), fill: palette.ridge[0] },
      { d: swell(random, 48, 3), fill: palette.ridge[1] },
      { d: swell(random, 55, 2), fill: palette.ridge[2] },
    );
  }

  return {
    terrain,
    sky: palette.sky,
    layers,
    disc: { cx: 18 + random() * 64, cy: 16 + random() * 8, r: 6, fill: palette.disc },
  };
}
