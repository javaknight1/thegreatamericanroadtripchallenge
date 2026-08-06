import { geoAlbers, geoPath } from "d3-geo";
import { getRegion } from "../../src/lib/content";

const region = getRegion("northeast")!;
const lngs = region.stops.map((s) => s.location.lng);
const lats = region.stops.map((s) => s.location.lat);
const win = {
  lngMin: Math.min(...lngs) - 1.2, lngMax: Math.max(...lngs) + 1.2,
  latMin: Math.min(...lats) - 1.2, latMax: Math.max(...lats) + 1.2,
};
console.log("window", win);

const windowFeature: GeoJSON.Feature = {
  type: "Feature", properties: {},
  geometry: { type: "Polygon", coordinates: [[
    [win.lngMin, win.latMin], [win.lngMax, win.latMin],
    [win.lngMax, win.latMax], [win.lngMin, win.latMax], [win.lngMin, win.latMin],
  ]] },
};

function report(label: string, p: ReturnType<typeof geoAlbers>) {
  const pts = region.stops.map((s) => p([s.location.lng, s.location.lat]));
  console.log(label, "scale:", Math.round(p.scale()), "bounds:", geoPath(p).bounds(windowFeature).map((b) => b.map(Math.round)));
  console.log("   pts:", pts.map((pt) => pt && pt.map(Math.round)).slice(0, 4));
}

const a = geoAlbers()
  .rotate([(win.lngMin + win.lngMax) / -2, 0])
  .center([0, (win.latMin + win.latMax) / 2])
  .parallels([win.latMin, win.latMax]);
a.fitExtent([[56, 56], [744, 464]], windowFeature);
report("current", a);

const b = geoAlbers()
  .rotate([-(win.lngMin + win.lngMax) / 2, 0])
  .center([0, (win.latMin + win.latMax) / 2])
  .parallels([win.latMin, win.latMax]);
b.fitExtent([[56, 56], [744, 464]], windowFeature);
report("rotate-sign-fixed", b);

import { geoArea } from "d3-geo";
console.log("polygon geoArea (4π = whole sphere):", geoArea(windowFeature).toFixed(3), "of", (4 * Math.PI).toFixed(3));

const corners: GeoJSON.Feature = {
  type: "Feature", properties: {},
  geometry: { type: "MultiPoint", coordinates: [
    [win.lngMin, win.latMin], [win.lngMax, win.latMin], [win.lngMax, win.latMax], [win.lngMin, win.latMax],
  ] },
};
const c = geoAlbers()
  .rotate([(win.lngMin + win.lngMax) / -2, 0])
  .center([0, (win.latMin + win.latMax) / 2])
  .parallels([win.latMin, win.latMax]);
c.fitExtent([[56, 56], [744, 464]], corners);
report("multipoint-fit", c);
