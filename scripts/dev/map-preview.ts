import fs from "node:fs";
import { getRegion } from "../../src/lib/content";
import { regionMapData } from "../../src/lib/geo";
import { stopColorMap } from "../../src/lib/stop-colors";

const region = getRegion(process.argv[2] ?? "northeast")!;
const map = regionMapData(region)!;
const colors = stopColorMap(region.stops.map((s) => s.id));
const active = map.stops[2]?.id;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${map.width} ${map.height}" width="${map.width}" height="${map.height}">
<rect width="${map.width}" height="${map.height}" fill="#161719"/>
${map.states.map((s) => `<path d="${s.d}" fill="#20242a" stroke="#3a4250" stroke-width="0.8"/>`).join("\n")}
<path d="${map.routeD}" fill="none" stroke="#C2521C" stroke-width="2.5" stroke-dasharray="7 5"/>
${map.stops
  .map((s) => {
    const on = s.id === active;
    return `<g>${on ? `<circle cx="${s.x}" cy="${s.y}" r="16" fill="${colors[s.id]}" opacity="0.25"/>` : ""}
<circle cx="${s.x}" cy="${s.y}" r="${on ? 10 : 7}" fill="${colors[s.id]}" stroke="${on ? "#F5EFE1" : "#161719"}" stroke-width="${on ? 3 : 2}"/>
<text x="${s.x}" y="${s.y + 3.5}" text-anchor="middle" fill="#fff" font-size="${on ? 11 : 9}" font-weight="700" font-family="monospace">${s.order}</text>
<text x="${s.x}" y="${s.y - (on ? 17 : 13)}" text-anchor="middle" fill="${on ? "#F5EFE1" : "#9aa2ad"}" font-size="13" font-weight="${on ? 700 : 500}" font-family="sans-serif">${s.name.toUpperCase().replace(/&/g, "&amp;")}</text></g>`;
  })
  .join("\n")}
</svg>`;

fs.writeFileSync(process.argv[3] ?? "/tmp/map.svg", svg);
console.log("states:", map.states.length, "svg bytes:", svg.length);
