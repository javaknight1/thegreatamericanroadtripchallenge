import { getRegion } from "../../src/lib/content";
import { regionMapData } from "../../src/lib/geo";
const region = getRegion(process.argv[2] ?? "northeast")!;
const map = regionMapData(region)!;
const sizes = map.states.map((s) => [s.name, s.d.length] as const).sort((a, b) => b[1] - a[1]);
console.log("states:", map.states.length, "total d bytes:", sizes.reduce((t, [, n]) => t + n, 0));
console.log(sizes.slice(0, 10).map(([n, s]) => `${n}:${s}`).join("  "));
console.log("offscreen-ish (<300b):", sizes.filter(([, s]) => s < 300).length);
