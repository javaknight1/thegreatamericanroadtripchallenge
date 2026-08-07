import type { CSSProperties } from "react";

/**
 * Every region keeps the same printed-roadbook bones and shifts palette to
 * match the leg it covers — New England runs rust and foliage gold, Florida
 * runs turquoise and coral, the Desert Southwest runs terracotta. Enough of a
 * shift that landing on a new region reads as a new chapter, not a new site.
 *
 * These override the global tokens on a wrapper element, so every Tailwind
 * utility built on `--color-*` follows without a single conditional class.
 */
export type RegionTheme = {
  /** Headline / link / route color. */
  accent: string;
  /** Tinted panels (season note, timing callouts). */
  accentSoft: string;
  /** Page and card stock — a nudge, never a different material. */
  canvas: string;
  surface: string;
  raised: string;
  hairline: string;
  /** Map: land fill, land stroke, backdrop. */
  land: string;
  landStroke: string;
  water: string;
  /** Short line naming the palette, shown on the region page. */
  mood: string;
};

const DEFAULT_THEME: RegionTheme = {
  accent: "#C2521C",
  accentSoft: "#EBCFBA",
  canvas: "#ECE3D2",
  surface: "#F5EFE1",
  raised: "#E2D6BE",
  hairline: "#CBBFA3",
  land: "#20242a",
  landStroke: "#3a4250",
  water: "#161719",
  mood: "Trail orange on warm paper",
};

const THEMES: Record<string, RegionTheme> = {
  "new-england": {
    accent: "#C13B26",
    accentSoft: "#EBCABC",
    canvas: "#EFE4CE",
    surface: "#F8F0DF",
    raised: "#E4D5B8",
    hairline: "#CBB998",
    land: "#232a26",
    landStroke: "#404d43",
    water: "#14181a",
    mood: "Foliage rust and maple gold",
  },
  "mid-atlantic": {
    accent: "#7D5BA6",
    accentSoft: "#DDD1D5",
    canvas: "#EAE2D5",
    surface: "#F4EEE3",
    raised: "#DED3C2",
    hairline: "#C4B7A3",
    land: "#242832",
    landStroke: "#414a5c",
    water: "#15171d",
    mood: "Slate violet and late-fall haze",
  },
  "coastal-southeast": {
    accent: "#2E8B63",
    accentSoft: "#CDDAC8",
    canvas: "#E9E7D9",
    surface: "#F4F2E6",
    raised: "#DCDAC8",
    hairline: "#BEBDA8",
    land: "#1e2a2a",
    landStroke: "#3a5250",
    water: "#121b1c",
    mood: "Live oak and Lowcountry green",
  },
  florida: {
    accent: "#EF7B2C",
    accentSoft: "#F4D7BD",
    canvas: "#EFEAD9",
    surface: "#FAF6E8",
    raised: "#E2DCC6",
    hairline: "#C7C0A8",
    land: "#16303a",
    landStroke: "#2f5f6d",
    water: "#0e2029",
    mood: "Turquoise water and coral sun",
  },
  "deep-south": {
    accent: "#B03A6B",
    accentSoft: "#E7CAC9",
    canvas: "#EDE4D6",
    surface: "#F7F0E4",
    raised: "#E0D4C1",
    hairline: "#C6B7A2",
    land: "#2a2028",
    landStroke: "#4d3c46",
    water: "#191318",
    mood: "Mardi Gras plum and river brass",
  },
  "texas-south-plains": {
    accent: "#D2A24F",
    accentSoft: "#EEDFC4",
    canvas: "#F0E6D2",
    surface: "#FAF2E2",
    raised: "#E5D8BE",
    hairline: "#CDBB9C",
    land: "#2c2620",
    landStroke: "#544736",
    water: "#1b1712",
    mood: "Sun-bleached ranch tan",
  },
  "desert-southwest": {
    accent: "#8A3A1F",
    accentSoft: "#E0CABA",
    canvas: "#F2E5D6",
    surface: "#FBF1E4",
    raised: "#E8D6C2",
    hairline: "#D0B9A1",
    land: "#33241f",
    landStroke: "#5f4133",
    water: "#1f1512",
    mood: "Red rock and adobe",
  },
  california: {
    accent: "#E2BB33",
    accentSoft: "#F1E4BE",
    canvas: "#F1EADA",
    surface: "#FBF5E8",
    raised: "#E6DDC7",
    hairline: "#CCC0A4",
    land: "#26302a",
    landStroke: "#47594a",
    water: "#151d1c",
    mood: "Golden hills and Pacific fog",
  },
  "pacific-northwest": {
    accent: "#1C716E",
    accentSoft: "#CAD5CA",
    canvas: "#E7E9E0",
    surface: "#F2F4EC",
    raised: "#D9DCCF",
    hairline: "#B7BDAD",
    land: "#1b2926",
    landStroke: "#345048",
    water: "#101a1a",
    mood: "Evergreen and rain-grey",
  },
  "northern-rockies": {
    accent: "#4E93C6",
    accentSoft: "#D4DCDC",
    canvas: "#E8E8E2",
    surface: "#F3F3EE",
    raised: "#D9DAD2",
    hairline: "#B6B9B0",
    land: "#1f2833",
    landStroke: "#3b4d5f",
    water: "#121820",
    mood: "Alpine blue and glacier grey",
  },
  "colorado-rockies": {
    accent: "#6E7F8C",
    accentSoft: "#DAD8D0",
    canvas: "#EEE7DA",
    surface: "#F8F2E7",
    raised: "#E1D8C6",
    hairline: "#C8BAA4",
    land: "#2a2822",
    landStroke: "#4f4a3a",
    water: "#191811",
    mood: "Granite grey and high-country haze",
  },
  "great-plains": {
    accent: "#8F6526",
    accentSoft: "#E1D3BC",
    canvas: "#F0E9D5",
    surface: "#FAF4E4",
    raised: "#E5DCC1",
    hairline: "#CCC09E",
    land: "#2b2b1f",
    landStroke: "#524f34",
    water: "#1a1a12",
    mood: "Prairie wheat and big sky",
  },
  "upper-midwest-great-lakes": {
    accent: "#27548A",
    accentSoft: "#CCCFD0",
    canvas: "#E8E9E4",
    surface: "#F3F4F0",
    raised: "#D9DBD3",
    hairline: "#B5BAB2",
    land: "#1e2733",
    landStroke: "#38495e",
    water: "#111820",
    mood: "Great Lakes blue and birch",
  },
  "appalachia-return": {
    accent: "#5C7A3C",
    accentSoft: "#D6D7C0",
    canvas: "#ECE5D6",
    surface: "#F6F0E3",
    raised: "#DFD5C1",
    hairline: "#C5B7A0",
    land: "#232a22",
    landStroke: "#3f4c3c",
    water: "#151a14",
    mood: "Ridge-and-valley moss",
  },
};

export function regionTheme(regionId: string): RegionTheme {
  return THEMES[regionId] ?? DEFAULT_THEME;
}

/** Token overrides to spread onto a region page wrapper. */
export function regionThemeStyle(theme: RegionTheme): CSSProperties {
  return {
    "--color-accent": theme.accent,
    "--color-accent-soft": theme.accentSoft,
    "--color-canvas": theme.canvas,
    "--color-surface": theme.surface,
    "--color-raised": theme.raised,
    "--color-hairline": theme.hairline,
    backgroundColor: theme.canvas,
  } as CSSProperties;
}
