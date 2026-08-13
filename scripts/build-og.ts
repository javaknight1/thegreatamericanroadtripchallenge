import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getTrip } from "../src/lib/content";
import { regionStats, routeMiles, tripStats } from "../src/lib/derive";
import { nationalMapData, regionMapData } from "../src/lib/geo";
import { parkCoverage } from "../src/lib/national-parks";
import { regionTheme } from "../src/lib/region-theme";
import type { Region } from "../src/types/trip";

/**
 * Writes the Open Graph share cards to `public/og/`.
 *
 * A link to this site used to render as bare text in iMessage, Slack and
 * Instagram, which is a poor showing for a site whose stated job is to be
 * screenshot-worthy. Static export rules out Next's `ImageResponse` — there is
 * no server to run it — so the cards are drawn as SVG from the same projection
 * code the site uses and rasterised with sharp.
 *
 * **Generated on demand (`npm run og`) and committed, not built.** The rest of
 * the site derives everything at build time, so this deserves its reason:
 * sharp rasterises SVG text with whatever fonts the *machine* has, and the
 * build machine is Cloudflare's, not ours. Generating in CI would make the
 * typography of the site's most public image depend on a build image nobody
 * can see. Committing the PNGs makes them reviewable and impossible to break in
 * a deploy. `npm run validate` warns when the numbers on them have gone stale.
 */

const OUT = path.join(process.cwd(), "public/og");
const WIDTH = 1200;
const HEIGHT = 630;

/** Matches `--color-*` in globals.css; SVG can't read CSS custom properties. */
const INK = "#161719";
const CANVAS = "#ECE3D2";
const MUTED = "#6A6252";
const HAIRLINE = "#CBBFA3";
const ACCENT = "#C2521C";

/** Whatever the rendering machine has, most-wanted first. */
const DISPLAY = "Anton, Haettenschweiler, Impact, 'Arial Black', sans-serif";
const COND = "'Barlow Condensed', 'Helvetica Neue Condensed', 'Arial Narrow', sans-serif";
const MONO = "'JetBrains Mono', Menlo, Consolas, monospace";

/**
 * Average glyph advance as a fraction of font size, measured by rendering a
 * string and trimming the result (see the `_m` probe in git history). Guessing
 * these is how the first draft put the headline through the middle of the map.
 */
const EM = { display: 0.672, cond: 0.508, mono: 0.599 };

const widthOf = (text: string, size: number, em: number, tracking = 0) =>
  text.length * (size * em + tracking);

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");

/** Greedy word wrap against a measured width. */
function wrap(text: string, maxWidth: number, size: number, em: number, tracking = 0): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && widthOf(candidate, size, em, tracking) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

/** The largest size from `sizes` whose wrap fits in `maxLines`. */
function autoFit(text: string, maxWidth: number, maxLines: number, sizes: number[]) {
  for (const size of sizes) {
    const lines = wrap(text, maxWidth, size, EM.display, 1);
    if (lines.length <= maxLines) return { size, lines };
  }
  const size = sizes[sizes.length - 1];
  return { size, lines: wrap(text, maxWidth, size, EM.display, 1).slice(0, maxLines) };
}

/**
 * Map content scaled and centred into a box on the card.
 *
 * `content` is a function of the scale, because strokes and pins have to be
 * drawn *inversely* to it — a 3px route line in a map that gets scaled to 0.55
 * comes out at 1.6px and disappears, which is what the first region cards did.
 */
function fit(
  size: { width: number; height: number },
  box: { x: number; y: number; w: number; h: number },
  content: (scale: number) => string,
): string {
  const scale = Math.min(box.w / size.width, box.h / size.height);
  const dx = box.x + (box.w - size.width * scale) / 2;
  const dy = box.y + (box.h - size.height * scale) / 2;
  return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${scale.toFixed(4)})">${content(scale)}</g>`;
}

/**
 * The figures along the bottom, laid out from their measured widths so a long
 * label ("NATIONAL PARKS") pushes the next column along instead of sitting
 * underneath it.
 */
function figureStrip(
  figures: Array<[value: string, label: string]>,
  colour: string,
): string {
  const GAP = 46;
  let x = 64;
  const parts: string[] = [];
  for (const [value, label] of figures) {
    const valueSize = value.length > 10 ? 30 : value.length > 6 ? 40 : 52;
    const font = valueSize > 40 ? DISPLAY : COND;
    const em = valueSize > 40 ? EM.display : EM.cond;
    parts.push(`
    <text x="${x}" y="548" font-family="${font}" font-weight="700" font-size="${valueSize}" fill="${colour}">${esc(value)}</text>
    <text x="${x}" y="576" font-family="${COND}" font-size="20" font-weight="700" fill="${MUTED}" letter-spacing="2.6">${esc(label.toUpperCase())}</text>`);
    x += Math.max(widthOf(value, valueSize, em), widthOf(label, 20, EM.cond, 2.6)) + GAP;
  }
  return parts.join("");
}

const trip = getTrip();
const stats = tripStats(trip);
const parks = parkCoverage(trip);

/** Text lives left of this; the map panel starts at 648. */
const TEXT_WIDTH = 556;

function nationCard(): string {
  const map = nationalMapData(trip.regions);
  if (!map) throw new Error("no national map");
  const theme = regionTheme("");

  const paint = (scale: number) => {
    const land = map.states
      .map(
        (state) =>
          `<path d="${state.d}" fill="${theme.landStroke}" fill-opacity="0.5" stroke="${theme.landStroke}" stroke-width="${(0.7 / scale).toFixed(2)}"/>`,
      )
      .join("");
    const routes = map.legs
      .map((leg) => {
        const colour = regionTheme(leg.id).accent;
        const pins = leg.stops
          .map(
            (stop) =>
              `<circle cx="${stop.x}" cy="${stop.y}" r="${(2.8 / scale).toFixed(2)}" fill="${colour}"/>`,
          )
          .join("");
        return `<path d="${leg.routeD}" fill="none" stroke="${colour}" stroke-width="${(2.6 / scale).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>${pins}`;
      })
      .join("");
    return land + routes;
  };

  const { size, lines } = autoFit(
    "THE WHOLE COUNTRY, IN THE ORDER IT'S BEST DRIVEN.",
    TEXT_WIDTH,
    4,
    [64, 58, 54, 50, 46],
  );
  // The turn onto the accent lands on the clause that carries the idea.
  const turn = lines.findIndex((line) => /ORDER/.test(line));
  const headline = lines
    .map(
      (line, index) =>
        `<text x="64" y="${196 + index * (size + 8)}" font-family="${DISPLAY}" font-size="${size}" letter-spacing="1" fill="${index >= turn ? ACCENT : INK}">${esc(line)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CANVAS}"/>
  <rect x="0" y="0" width="${WIDTH}" height="14" fill="${INK}"/>
  <rect x="648" y="76" width="488" height="380" rx="14" fill="${theme.water}"/>
  ${fit(map, { x: 660, y: 88, w: 464, h: 356 }, paint)}

  <text x="64" y="118" font-family="${COND}" font-size="20" font-weight="700" fill="${MUTED}" letter-spacing="4">THE GREAT AMERICAN ROAD TRIP CHALLENGE</text>
  ${headline}

  <line x1="64" y1="496" x2="1136" y2="496" stroke="${HAIRLINE}" stroke-width="2"/>
  ${figureStrip(
    [
      [String(stats.days), "days"],
      [String(stats.usStates.length), "states"],
      [String(parks.visited.length), "national parks"],
      [routeMiles(trip).toLocaleString("en-US"), "miles"],
    ],
    INK,
  )}
  <text x="1136" y="610" text-anchor="end" font-family="${MONO}" font-size="18" fill="${MUTED}">thegreatamericanroadtripchallenge.com</text>
</svg>`;
}

function regionCard(region: Region): string {
  const map = regionMapData(region);
  const theme = regionTheme(region.id);
  const info = regionStats(region);
  const days = region.stops.flatMap((stop) => stop.days.map((day) => day.dayNumber));
  const span = days.length ? `DAYS ${Math.min(...days)}–${Math.max(...days)}` : "";

  const art = map
    ? `<rect x="648" y="76" width="488" height="380" rx="14" fill="${theme.water}"/>` +
      fit(map, { x: 660, y: 88, w: 464, h: 356 }, (scale) =>
        map.states
          .map(
            (state) =>
              `<path d="${state.d}" fill="${theme.land}" stroke="${theme.landStroke}" stroke-width="${(0.9 / scale).toFixed(2)}"/>`,
          )
          .join("") +
        `<path d="${map.routeD}" fill="none" stroke="${theme.accent}" stroke-width="${(3.2 / scale).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
        map.stops
          .map(
            (stop) =>
              `<circle cx="${stop.x}" cy="${stop.y}" r="${(4.2 / scale).toFixed(2)}" fill="${theme.accent}" stroke="${theme.water}" stroke-width="${(1.5 / scale).toFixed(2)}"/>`,
          )
          .join(""),
      )
    : "";

  const { size, lines } = autoFit(region.name.toUpperCase(), TEXT_WIDTH, 3, [72, 64, 58, 52, 46]);
  const headline = lines
    .map(
      (line, index) =>
        `<text x="64" y="${212 + index * (size + 8)}" font-family="${DISPLAY}" font-size="${size}" letter-spacing="1" fill="${index === lines.length - 1 ? theme.accent : INK}">${esc(line)}</text>`,
    )
    .join("");
  const seasonY = 212 + lines.length * (size + 8) + 34;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${theme.canvas}"/>
  <rect x="0" y="0" width="${WIDTH}" height="14" fill="${theme.accent}"/>
  ${art}
  <text x="64" y="118" font-family="${COND}" font-size="20" font-weight="700" fill="${MUTED}" letter-spacing="4">LEG ${region.order} OF ${trip.regions.length} · ${esc(span)}</text>
  ${headline}
  <text x="64" y="${Math.min(seasonY, 468)}" font-family="${COND}" font-size="26" font-weight="600" fill="${MUTED}">Best in ${esc(region.season.toLowerCase())}</text>
  <line x1="64" y1="496" x2="1136" y2="496" stroke="${theme.hairline}" stroke-width="2"/>
  ${figureStrip(
    [
      [String(info.days), "days"],
      [String(info.stops), "stops"],
      [String(info.items), "things to do"],
    ],
    INK,
  )}
  <text x="1136" y="610" text-anchor="end" font-family="${MONO}" font-size="18" fill="${MUTED}">thegreatamericanroadtripchallenge.com</text>
</svg>`;
}

/** What the committed cards were drawn from, so `validate` can spot drift. */
export function ogManifest() {
  return {
    days: stats.days,
    stops: stats.stops,
    usStates: stats.usStates.length,
    parks: parks.visited.length,
    miles: routeMiles(trip),
    legs: trip.regions.filter((region) => region.stops.length).map((region) => region.id),
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let count = 0;
  const write = async (name: string, svg: string) => {
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`));
    count += 1;
  };

  await write("default", nationCard());
  for (const region of trip.regions) {
    if (!region.stops.length) continue;
    await write(`region-${region.id}`, regionCard(region));
  }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(ogManifest(), null, 2) + "\n");
  console.log(`${count} share cards written to public/og/`);
}

main();
