import fs from "node:fs";
import { getTrip } from "../../src/lib/content";
import { nationalMapData } from "../../src/lib/geo";
import { regionTheme } from "../../src/lib/region-theme";

/**
 * Renders the merged national map to a standalone SVG so it can be eyeballed.
 * Albers has two failure modes that only show up visually (see geo.ts), so look
 * at the output after touching the projection.
 */
const map = nationalMapData(getTrip().regions)!;
const base = regionTheme("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${map.width} ${map.height}" width="${map.width}" height="${map.height}">
<rect width="${map.width}" height="${map.height}" fill="${base.water}"/>
${map.states
  .map(
    (s) =>
      `<path d="${s.d}" fill="${s.visited ? base.landStroke : base.land}" fill-opacity="${s.visited ? 0.55 : 1}" stroke="${base.landStroke}" stroke-width="0.7"/>`,
  )
  .join("\n")}
${map.legs
  .map((leg) => {
    const color = regionTheme(leg.id).accent;
    return `<path d="${leg.routeD}" fill="none" stroke="${color}" stroke-width="2" opacity="0.9"/>
${leg.stops.map((s) => `<circle cx="${s.x}" cy="${s.y}" r="3.2" fill="${color}" stroke="${base.water}" stroke-width="1"/>`).join("")}`;
  })
  .join("\n")}
${map.legs
  .filter((leg) => leg.badge)
  .map(
    (leg) =>
      `<circle cx="${leg.badge!.x}" cy="${leg.badge!.y}" r="10" fill="${regionTheme(leg.id).accent}" stroke="${base.water}" stroke-width="2.5"/>
<text x="${leg.badge!.x}" y="${leg.badge!.y + 4}" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="monospace">${leg.order}</text>`,
  )
  .join("\n")}
</svg>`;

fs.writeFileSync(process.argv[2] ?? "/tmp/nation.svg", svg);
console.log(
  `${map.width}x${map.height} · ${map.states.length} states (${map.states.filter((s) => s.visited).length} visited) · ${map.legs.length} legs · ${map.legs.reduce((n, l) => n + l.stops.length, 0)} stops · ${svg.length} bytes`,
);
