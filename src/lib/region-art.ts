import type { RegionTheme } from "@/lib/region-theme";

/**
 * A wide banner scene per region, drawn as SVG at build time.
 *
 * Each leg gets its own silhouette — a lighthouse for New England, saguaro and
 * mesas for the Desert Southwest, the Golden Gate for California — over its own
 * sky. Same drawing language everywhere, different subject every time, so the
 * headers read as one series while telling you at a glance which chapter you
 * are in. Nothing is fetched and nothing is generated at runtime.
 */

export type Scene = {
  sky: [string, string];
  /** Back-to-front silhouettes, each an SVG path in the 100 × 36 banner box. */
  layers: Array<{ d: string; fill: string; opacity?: number }>;
  disc?: { cx: number; cy: number; r: number; fill: string };
  caption: string;
};

const H = 36;

/* ---------- shape helpers (all inside a 100 × 36 box) ---------- */

/** Jagged ridgeline from a fixed set of peak heights. */
function ridge(peaks: number[], baseline: number): string {
  const step = 100 / (peaks.length - 1);
  const points = peaks.map((peak, index) => `L${(index * step).toFixed(1)},${peak.toFixed(1)}`);
  return `M0,${H} L0,${baseline} ${points.join(" ")} L100,${baseline} L100,${H} Z`;
}

/** Rolling hills using quadratic bumps. */
function hills(baseline: number, bump: number, count: number): string {
  const width = 100 / count;
  const curves = Array.from({ length: count }, (_, index) => {
    const x = index * width;
    return `Q${(x + width / 2).toFixed(1)},${(baseline - bump).toFixed(1)} ${(x + width).toFixed(1)},${baseline.toFixed(1)}`;
  });
  return `M0,${H} L0,${baseline} ${curves.join(" ")} L100,${H} Z`;
}

/** Flat-topped mesas. */
function mesas(baseline: number): string {
  return (
    `M0,${H} L0,${baseline} L8,${baseline} L10,${baseline - 7} L22,${baseline - 7} L24,${baseline} ` +
    `L40,${baseline} L43,${baseline - 10} L58,${baseline - 10} L61,${baseline} ` +
    `L74,${baseline} L77,${baseline - 5} L88,${baseline - 5} L90,${baseline} L100,${baseline} L100,${H} Z`
  );
}

/** Blocky skyline with a taller spire near the middle. */
function skyline(baseline: number, heights: number[]): string {
  const width = 100 / heights.length;
  let d = `M0,${H} L0,${baseline}`;
  heights.forEach((height, index) => {
    const x = index * width;
    d += ` L${x.toFixed(1)},${(baseline - height).toFixed(1)} L${(x + width).toFixed(1)},${(baseline - height).toFixed(1)}`;
  });
  return `${d} L100,${baseline} L100,${H} Z`;
}

/** Conifer stand along the baseline. */
function pines(baseline: number, xs: number[], height: number): string {
  return xs
    .map((x) => `M${x - 2.6},${baseline} L${x},${baseline - height} L${x + 2.6},${baseline} Z`)
    .join(" ");
}

function lighthouse(x: number, baseline: number): string {
  return (
    `M${x - 2.4},${baseline} L${x - 1.6},${baseline - 11} L${x + 1.6},${baseline - 11} L${x + 2.4},${baseline} Z ` +
    `M${x - 2.6},${baseline - 11} L${x + 2.6},${baseline - 11} L${x + 2},${baseline - 13.5} L${x - 2},${baseline - 13.5} Z ` +
    `M${x - 1},${baseline - 13.5} L${x + 1},${baseline - 13.5} L${x},${baseline - 16} Z`
  );
}

function saguaro(x: number, baseline: number, scale = 1): string {
  const h = 12 * scale;
  return (
    `M${x - 1},${baseline} L${x - 1},${baseline - h} Q${x},${baseline - h - 1.6} ${x + 1},${baseline - h} L${x + 1},${baseline} Z ` +
    `M${x - 4},${baseline - h * 0.45} Q${x - 4.6},${baseline - h * 0.8} ${x - 3},${baseline - h * 0.8} L${x - 3},${baseline - h * 0.5} L${x - 1},${baseline - h * 0.5} L${x - 1},${baseline - h * 0.3} L${x - 4},${baseline - h * 0.3} Z ` +
    `M${x + 4},${baseline - h * 0.6} Q${x + 4.6},${baseline - h * 0.95} ${x + 3},${baseline - h * 0.95} L${x + 3},${baseline - h * 0.65} L${x + 1},${baseline - h * 0.65} L${x + 1},${baseline - h * 0.45} L${x + 4},${baseline - h * 0.45} Z`
  );
}

function palm(x: number, baseline: number): string {
  return (
    `M${x - 0.6},${baseline} Q${x - 1.4},${baseline - 7} ${x - 0.2},${baseline - 12} L${x + 0.8},${baseline - 12} Q${x + 0.4},${baseline - 7} ${x + 1},${baseline} Z ` +
    `M${x},${baseline - 12} Q${x - 6},${baseline - 15} ${x - 8},${baseline - 11} Q${x - 5},${baseline - 13} ${x},${baseline - 11.4} Z ` +
    `M${x},${baseline - 12} Q${x + 6},${baseline - 15} ${x + 8},${baseline - 11} Q${x + 5},${baseline - 13} ${x},${baseline - 11.4} Z ` +
    `M${x},${baseline - 12} Q${x - 3},${baseline - 18} ${x + 1},${baseline - 19} Q${x + 0.5},${baseline - 15} ${x + 0.6},${baseline - 12} Z`
  );
}

/** Suspension-bridge towers with a slung cable. */
function suspensionBridge(baseline: number): string {
  const deck = baseline - 4;
  return (
    `M20,${deck} L20,${deck - 14} L22,${deck - 14} L22,${deck} Z ` +
    `M74,${deck} L74,${deck - 14} L76,${deck - 14} L76,${deck} Z ` +
    `M0,${deck - 1} L100,${deck - 1} L100,${deck + 1.4} L0,${deck + 1.4} Z ` +
    `M21,${deck - 13} Q48,${deck + 3} 75,${deck - 13} L75,${deck - 11} Q48,${deck + 5} 21,${deck - 11} Z`
  );
}

/** Prairie windmill. */
function windmill(x: number, baseline: number): string {
  return (
    `M${x - 1.6},${baseline} L${x - 0.5},${baseline - 12} L${x + 0.5},${baseline - 12} L${x + 1.6},${baseline} Z ` +
    `M${x},${baseline - 12} m-3.4,0 a3.4,3.4 0 1,0 6.8,0 a3.4,3.4 0 1,0 -6.8,0 Z`
  );
}

/** Grain elevator. */
function silo(x: number, baseline: number): string {
  return (
    `M${x - 3},${baseline} L${x - 3},${baseline - 9} Q${x},${baseline - 12} ${x + 3},${baseline - 9} L${x + 3},${baseline} Z ` +
    `M${x + 4},${baseline} L${x + 4},${baseline - 6} L${x + 8},${baseline - 6} L${x + 8},${baseline} Z`
  );
}

/** Paddlewheel riverboat. */
function riverboat(x: number, baseline: number): string {
  return (
    `M${x - 12},${baseline} L${x - 10},${baseline - 4} L${x + 10},${baseline - 4} L${x + 12},${baseline} Z ` +
    `M${x - 7},${baseline - 4} L${x - 7},${baseline - 8} L${x + 7},${baseline - 8} L${x + 7},${baseline - 4} Z ` +
    `M${x - 3},${baseline - 8} L${x - 3},${baseline - 12} L${x - 1.6},${baseline - 12} L${x - 1.6},${baseline - 8} Z ` +
    `M${x + 1.6},${baseline - 8} L${x + 1.6},${baseline - 12} L${x + 3},${baseline - 12} L${x + 3},${baseline - 8} Z ` +
    `M${x + 11},${baseline - 6} m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z`
  );
}

/** Broad live oak with hanging moss. */
function liveOak(x: number, baseline: number): string {
  return (
    `M${x - 1.4},${baseline} L${x - 1},${baseline - 8} L${x + 1},${baseline - 8} L${x + 1.4},${baseline} Z ` +
    `M${x},${baseline - 8} Q${x - 11},${baseline - 10} ${x - 12},${baseline - 14} Q${x - 6},${baseline - 19} ${x},${baseline - 17} Q${x + 6},${baseline - 19} ${x + 12},${baseline - 14} Q${x + 11},${baseline - 10} ${x},${baseline - 8} Z ` +
    `M${x - 9},${baseline - 12} L${x - 8.4},${baseline - 6} L${x - 9.6},${baseline - 6} Z ` +
    `M${x + 8},${baseline - 12} L${x + 8.6},${baseline - 5} L${x + 7.4},${baseline - 5} Z`
  );
}

/** Erupting geyser plume. */
function geyser(x: number, baseline: number): string {
  return (
    `M${x - 2},${baseline} Q${x - 3},${baseline - 10} ${x - 1},${baseline - 18} Q${x},${baseline - 21} ${x + 1},${baseline - 18} ` +
    `Q${x + 3},${baseline - 10} ${x + 2},${baseline} Z`
  );
}

/** Aspen trunks. */
function aspens(baseline: number, xs: number[]): string {
  return xs
    .map((x) => `M${x - 0.5},${baseline} L${x - 0.5},${baseline - 13} L${x + 0.5},${baseline - 13} L${x + 0.5},${baseline} Z`)
    .join(" ");
}

/** Steel truss arch (the New River Gorge silhouette). */
function archBridge(baseline: number): string {
  const deck = baseline - 6;
  return (
    `M8,${deck} L92,${deck} L92,${deck + 1.6} L8,${deck + 1.6} Z ` +
    `M10,${deck} Q50,${deck - 16} 90,${deck} L86,${deck} Q50,${deck - 12} 14,${deck} Z`
  );
}

/* ---------- the scenes ---------- */

type Builder = (theme: RegionTheme) => Omit<Scene, "caption">;

const SCENES: Record<string, { caption: string; build: Builder }> = {
  "new-england": {
    caption: "Foliage coast, lighthouse to ledge",
    build: (t) => ({
      sky: ["#2E3D4F", "#C9743A"],
      disc: { cx: 78, cy: 11, r: 4.5, fill: "#F3C57C" },
      layers: [
        { d: ridge([22, 16, 20, 14, 19, 15, 21], 24), fill: shade(t.land, 0.55) },
        { d: hills(27, 4, 5), fill: shade(t.land, 0.75) },
        { d: lighthouse(20, 30), fill: t.land },
        { d: pines(30, [44, 50, 57, 63], 7), fill: t.land },
        { d: `M0,30 L100,30 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.15) },
      ],
    }),
  },
  "mid-atlantic": {
    caption: "Skyline, bridge, and brick",
    build: (t) => ({
      sky: ["#26303F", "#B4653F"],
      disc: { cx: 22, cy: 12, r: 4, fill: "#EFC073" },
      layers: [
        { d: skyline(28, [6, 14, 9, 20, 12, 26, 11, 17, 8, 13]), fill: shade(t.land, 0.6) },
        { d: skyline(31, [4, 9, 6, 12, 7, 10, 5, 8, 11, 6]), fill: shade(t.land, 0.85) },
        { d: suspensionBridge(34), fill: t.land },
      ],
    }),
  },
  "coastal-southeast": {
    caption: "Live oaks and Lowcountry marsh",
    build: (t) => ({
      sky: ["#27423F", "#B98A55"],
      disc: { cx: 70, cy: 12, r: 4.2, fill: "#EFD79B" },
      layers: [
        { d: hills(24, 5, 3), fill: shade(t.land, 0.55) },
        { d: liveOak(30, 32), fill: shade(t.land, 0.9) },
        { d: liveOak(72, 33), fill: t.land },
        { d: `M0,32 L100,32 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.2) },
      ],
    }),
  },
  florida: {
    caption: "Palms, causeway, coral sunset",
    build: (t) => ({
      sky: ["#1E4A63", "#E9895C"],
      disc: { cx: 50, cy: 14, r: 6, fill: "#FBD08A" },
      layers: [
        { d: `M0,26 L100,26 L100,30 L0,30 Z`, fill: shade(t.land, 1.1), opacity: 0.85 },
        { d: palm(16, 30), fill: t.land },
        { d: palm(84, 31), fill: t.land },
        { d: `M0,30 L100,30 L100,${H} L0,${H} Z`, fill: shade(t.land, 0.9) },
      ],
    }),
  },
  "deep-south": {
    caption: "River, riverboat, brass night",
    build: (t) => ({
      sky: ["#2A2233", "#B0653F"],
      disc: { cx: 26, cy: 10, r: 4, fill: "#F0CE8E" },
      layers: [
        { d: hills(23, 3, 4), fill: shade(t.land, 0.6) },
        { d: riverboat(62, 30), fill: t.land },
        { d: `M0,30 L100,30 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.2) },
      ],
    }),
  },
  "texas-south-plains": {
    caption: "Windmill, fence line, big sky",
    build: (t) => ({
      sky: ["#39445A", "#C98A4A"],
      disc: { cx: 66, cy: 13, r: 5, fill: "#F6D191" },
      layers: [
        { d: hills(26, 2.5, 6), fill: shade(t.land, 0.6) },
        { d: windmill(24, 31), fill: t.land },
        { d: saguaro(80, 31, 0.7), fill: shade(t.land, 0.9) },
        { d: `M0,31 L100,31 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.15) },
      ],
    }),
  },
  "desert-southwest": {
    caption: "Mesas, saguaro, red rock",
    build: (t) => ({
      sky: ["#3A2740", "#D2733F"],
      disc: { cx: 30, cy: 12, r: 5, fill: "#F6C27C" },
      layers: [
        { d: mesas(27), fill: shade(t.land, 0.6) },
        { d: mesas(31), fill: shade(t.land, 0.85), opacity: 0.9 },
        { d: saguaro(18, 33), fill: t.land },
        { d: saguaro(86, 33, 0.8), fill: t.land },
        { d: `M0,33 L100,33 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.2) },
      ],
    }),
  },
  california: {
    caption: "Golden Gate through the fog",
    build: (t) => ({
      sky: ["#33405A", "#DB8B4A"],
      disc: { cx: 50, cy: 12, r: 5.5, fill: "#F8D08C" },
      layers: [
        { d: ridge([20, 14, 18, 12, 17, 13, 19], 23), fill: shade(t.land, 0.55) },
        { d: suspensionBridge(33), fill: t.land },
        { d: `M0,33 L100,33 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.1) },
      ],
    }),
  },
  "pacific-northwest": {
    caption: "Volcano, evergreens, rain",
    build: (t) => ({
      sky: ["#2B3A40", "#8FA1A0"],
      layers: [
        { d: `M0,${H} L0,28 L34,10 L48,28 L100,28 L100,${H} Z`, fill: shade(t.land, 0.55) },
        { d: `M28,15 L34,10 L40,15 L36,16 L32,14 Z`, fill: "#E8EDF0", opacity: 0.85 },
        { d: pines(30, [12, 18, 24, 62, 70, 78, 88], 9), fill: shade(t.land, 0.9) },
        { d: `M0,30 L100,30 L100,${H} L0,${H} Z`, fill: t.land },
      ],
    }),
  },
  "northern-rockies": {
    caption: "Geyser basin under the peaks",
    build: (t) => ({
      sky: ["#2C3B4E", "#9DB0C0"],
      layers: [
        { d: ridge([16, 8, 14, 6, 13, 9, 15], 22), fill: shade(t.land, 0.55) },
        { d: `M0,22 L14,12 L22,22 Z M30,22 L44,7 L56,22 Z M64,22 L76,13 L86,22 Z`, fill: "#DCE6EE", opacity: 0.35 },
        { d: geyser(70, 30), fill: "#E6EDF2", opacity: 0.55 },
        { d: pines(30, [10, 16, 22, 88, 94], 8), fill: shade(t.land, 0.95) },
        { d: `M0,30 L100,30 L100,${H} L0,${H} Z`, fill: t.land },
      ],
    }),
  },
  "colorado-rockies": {
    caption: "Aspens turning under the divide",
    build: (t) => ({
      sky: ["#33405C", "#C58A4C"],
      disc: { cx: 82, cy: 11, r: 4, fill: "#F4CE8B" },
      layers: [
        { d: ridge([18, 8, 15, 5, 14, 10, 17], 24), fill: shade(t.land, 0.55) },
        { d: `M6,24 L14,10 L22,24 Z M40,24 L50,6 L60,24 Z`, fill: "#E9EFF4", opacity: 0.4 },
        { d: aspens(31, [12, 17, 22, 27, 76, 81, 86, 91]), fill: shade(t.land, 1.05) },
        { d: `M0,31 L100,31 L100,${H} L0,${H} Z`, fill: t.land },
      ],
    }),
  },
  "great-plains": {
    caption: "Grain elevator, wheat, horizon",
    build: (t) => ({
      sky: ["#3C4560", "#C99B4C"],
      disc: { cx: 40, cy: 13, r: 5.5, fill: "#F7D999" },
      layers: [
        { d: hills(27, 1.6, 8), fill: shade(t.land, 0.6) },
        { d: silo(70, 31), fill: t.land },
        { d: windmill(18, 31), fill: shade(t.land, 0.9) },
        { d: `M0,31 L100,31 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.15) },
      ],
    }),
  },
  "upper-midwest-great-lakes": {
    caption: "Lake water and a working skyline",
    build: (t) => ({
      sky: ["#2B3A50", "#8C7C6A"],
      disc: { cx: 20, cy: 12, r: 4.2, fill: "#EBD5A6" },
      layers: [
        { d: skyline(26, [5, 12, 8, 22, 14, 18, 9, 13, 6, 10]), fill: shade(t.land, 0.6) },
        { d: `M0,26 L100,26 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.25) },
        { d: `M0,29 Q25,27.6 50,29 Q75,30.4 100,29 L100,30.6 Q75,32 50,30.6 Q25,29.2 0,30.6 Z`, fill: "#D9E4EC", opacity: 0.25 },
      ],
    }),
  },
  "appalachia-return": {
    caption: "Ridge, gorge, and the road home",
    build: (t) => ({
      sky: ["#2F3A34", "#B58248"],
      disc: { cx: 60, cy: 12, r: 4.4, fill: "#EDCB8C" },
      layers: [
        { d: ridge([21, 17, 20, 16, 19, 17, 21], 25), fill: shade(t.land, 0.5) },
        { d: ridge([26, 22, 25, 21, 24, 22, 26], 29), fill: shade(t.land, 0.75) },
        { d: archBridge(34), fill: t.land },
        { d: `M0,34 L100,34 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.2) },
      ],
    }),
  },
};

/** Lightens (>1) or darkens (<1) a hex color — keeps layers related but distinct. */
function shade(hex: string, factor: number): string {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  const shifted = channels.map((channel) => Math.max(0, Math.min(255, Math.round(channel * factor))));
  return `#${shifted.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

const FALLBACK: { caption: string; build: Builder } = {
  caption: "Open road",
  build: (t) => ({
    sky: ["#33405A", "#C58A4C"],
    disc: { cx: 50, cy: 12, r: 5, fill: "#F4CE8B" },
    layers: [
      { d: hills(26, 3, 5), fill: shade(t.land, 0.6) },
      { d: `M42,${H} L48,28 L52,28 L58,${H} Z`, fill: t.land },
      { d: `M0,30 L100,30 L100,${H} L0,${H} Z`, fill: shade(t.land, 1.15) },
    ],
  }),
};

export function regionScene(regionId: string, theme: RegionTheme): Scene {
  const entry = SCENES[regionId] ?? FALLBACK;
  return { ...entry.build(theme), caption: entry.caption };
}
