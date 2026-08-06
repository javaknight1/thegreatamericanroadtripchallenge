import { geoAlbers, geoBounds, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import statesTopo from "us-atlas/states-10m.json";
import { dayRange } from "@/lib/derive";
import type { Region } from "@/types/trip";

/**
 * Projects a region's stops into a flat SVG geometry at build time.
 *
 * Everything here — d3-geo, the TopoJSON, the projection math — runs on the
 * build machine and stays out of the bundle. The browser receives path strings
 * and pixel coordinates, so the map is a static SVG with no tiles, no map
 * library, and no network calls. That keeps the "no services in the request
 * path" rule intact and makes the map work offline.
 */

export type MapStop = {
  id: string;
  name: string;
  state: string;
  order: number;
  x: number;
  y: number;
  /** Which side of the pin its label sits on, after collision avoidance. */
  labelSide: "above" | "below";
  dayRange?: string;
  firstDay?: number;
};

export type RegionMapData = {
  width: number;
  height: number;
  states: Array<{ id: string; name: string; d: string }>;
  /** The drive between consecutive stops, in trip order. */
  routeD: string;
  stops: MapStop[];
};

type StateFeature = GeoJSON.Feature<GeoJSON.Geometry, { name: string }> & { id: string };

const WIDTH = 800;
/** The frame grows to the region's own shape, between these bounds. */
const MIN_HEIGHT = 300;
const MAX_HEIGHT = 620;
/** Keeps pins and their labels clear of the edges. */
const PADDING = 56;
/** Points closer together than this (in px) add bytes, not shape. */
const MIN_POINT_GAP = 0.6;

const topology = statesTopo as unknown as Topology;
const stateFeatures = (
  feature(topology, topology.objects.states) as unknown as { features: StateFeature[] }
).features;

/** Geographic bbox per state, computed once — used to skip far-away geometry. */
const stateBounds = new Map<string, [[number, number], [number, number]]>(
  stateFeatures.map((state) => [String(state.id), geoBounds(state)]),
);

/**
 * An SVG path sink that rounds to whole pixels and drops points too close
 * together to matter at this size. Cheaper and more predictable than
 * post-processing the path string, and it runs during projection.
 */
class DecimatingPath {
  private parts: string[] = [];
  private lastX = Number.NaN;
  private lastY = Number.NaN;

  /** Bigger tolerance for maps drawn at national scale, where a pixel of
   *  coastline is noise but forty-nine states of it is most of the page. */
  constructor(private readonly gap: number = MIN_POINT_GAP) {}

  /** Part of d3's canvas-shaped context contract; each path starts empty here. */
  beginPath() {
    this.parts = [];
    this.lastX = Number.NaN;
    this.lastY = Number.NaN;
  }

  moveTo(x: number, y: number) {
    this.lastX = Math.round(x);
    this.lastY = Math.round(y);
    this.parts.push(`M${this.lastX},${this.lastY}`);
  }

  lineTo(x: number, y: number) {
    const nextX = Math.round(x);
    const nextY = Math.round(y);
    if (Math.abs(nextX - this.lastX) < this.gap && Math.abs(nextY - this.lastY) < this.gap) return;
    this.lastX = nextX;
    this.lastY = nextY;
    this.parts.push(`L${nextX},${nextY}`);
  }

  closePath() {
    this.parts.push("Z");
  }

  /** geoPath calls this for point geometry; the map draws its own pins. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {}

  result(): string {
    const d = this.parts.join("");
    this.parts = [];
    this.lastX = Number.NaN;
    this.lastY = Number.NaN;
    return d;
  }
}

type Window = { lngMin: number; lngMax: number; latMin: number; latMax: number };

function windowFor(region: Region): Window {
  const lngs = region.stops.map((stop) => stop.location.lng);
  const lats = region.stops.map((stop) => stop.location.lat);
  const spanLng = Math.max(...lngs) - Math.min(...lngs);
  const spanLat = Math.max(...lats) - Math.min(...lats);
  const marginLng = Math.max(spanLng * 0.35, 1.2);
  const marginLat = Math.max(spanLat * 0.35, 1.2);

  return {
    lngMin: Math.min(...lngs) - marginLng,
    lngMax: Math.max(...lngs) + marginLng,
    latMin: Math.min(...lats) - marginLat,
    latMax: Math.max(...lats) + marginLat,
  };
}

/**
 * The corners as a MultiPoint, not a Polygon. d3 treats a polygon ring's
 * winding as meaningful on a sphere, and the "wrong" winding describes
 * everything *outside* the box — which makes fitExtent fit the whole globe and
 * collapses the region to a handful of pixels. Points have no winding.
 */
function windowCorners(window: Window): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "MultiPoint",
      coordinates: [
        [window.lngMin, window.latMin],
        [window.lngMax, window.latMin],
        [window.lngMax, window.latMax],
        [window.lngMin, window.latMax],
      ],
    },
  };
}

/**
 * Albers is a conic projection: geometry far outside the region folds back into
 * view instead of disappearing, so states are filtered geographically before
 * they are ever projected. (Clipping in pixel space does not remove them — it
 * happily renders a folded-over Alaska across the Northeast.)
 */
function intersects(bounds: [[number, number], [number, number]], window: Window): boolean {
  const [[west, south], [east, north]] = bounds;
  // A bbox that crosses the antimeridian (Alaska) has west > east.
  const crossesAntimeridian = west > east;
  const lngOverlap = crossesAntimeridian
    ? window.lngMax >= west || window.lngMin <= east
    : west <= window.lngMax && east >= window.lngMin;
  return lngOverlap && south <= window.latMax && north >= window.latMin;
}

/**
 * Fits the region to the full width, then sizes the frame to whatever height
 * that leaves. Fitting into a fixed box instead would letterbox every region
 * that isn't 800×520-shaped — New England would sit in a sea of empty chrome.
 */
function projectionFor(
  window: Window,
  options: { parallels?: [number, number]; fitTo?: GeoJSON.GeoJSON } = {},
): { projection: GeoProjection; height: number } {
  // A lat/lng box is the right frame for a region — it leaves margin around the
  // stops. It is the wrong frame for the whole country, which isn't a rectangle:
  // the box's western corners sit in the Pacific and the eastern ones in the
  // Atlantic, stranding the land in 150px of empty ocean. So the caller can hand
  // in what should actually fill the frame.
  const corners = options.fitTo ?? windowCorners(window);
  const projection = geoAlbers()
    .rotate([(window.lngMin + window.lngMax) / -2, 0])
    .center([0, (window.latMin + window.latMax) / 2])
    .parallels(options.parallels ?? [window.latMin, window.latMax]);

  projection.fitWidth(WIDTH - PADDING * 2, corners);

  const [[, y0], [, y1]] = geoPath(projection).bounds(corners);
  const naturalHeight = Math.round(y1 - y0 + PADDING * 2);
  const height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, naturalHeight));

  if (naturalHeight > MAX_HEIGHT) {
    // Tall, narrow regions (California) fit by height instead and center.
    projection.fitExtent(
      [
        [PADDING, PADDING],
        [WIDTH - PADDING, height - PADDING],
      ],
      corners,
    );
  } else {
    const [tx, ty] = projection.translate();
    projection.translate([tx + PADDING, ty + PADDING + (height - naturalHeight) / 2]);
  }

  projection.clipExtent([
    [0, 0],
    [WIDTH, height],
  ]);

  return { projection, height };
}

/**
 * Stops cluster (four New England stops sit within a thumb's width), so labels
 * collide. Greedy placement: label above unless that box is already taken, in
 * which case drop it below the pin.
 */
function placeLabels(stops: MapStop[]): MapStop[] {
  const halfWidth = (name: string) => Math.max(34, name.length * 4.6);
  const placed: Array<{ x: number; y: number; half: number }> = [];

  return stops.map((stop) => {
    const half = halfWidth(stop.name);
    const candidates: Array<MapStop["labelSide"]> = ["above", "below"];

    for (const side of candidates) {
      const y = side === "above" ? stop.y - 15 : stop.y + 22;
      const clash = placed.some(
        (box) => Math.abs(box.y - y) < 17 && Math.abs(box.x - stop.x) < box.half + half,
      );
      if (!clash) {
        placed.push({ x: stop.x, y, half });
        return { ...stop, labelSide: side };
      }
    }

    // Everything collides — keep it below, where the route line rarely runs.
    placed.push({ x: stop.x, y: stop.y + 22, half });
    return { ...stop, labelSide: "below" as const };
  });
}

export function regionMapData(region: Region): RegionMapData | undefined {
  if (!region.stops.length) return undefined;

  const window = windowFor(region);
  const { projection, height } = projectionFor(window);
  const context = new DecimatingPath();
  const path = geoPath(projection, context);

  const states = stateFeatures
    .filter((state) => {
      const bounds = stateBounds.get(String(state.id));
      return bounds ? intersects(bounds, window) : false;
    })
    .map((state) => {
      path(state);
      return { id: String(state.id), name: state.properties.name, d: context.result() };
    })
    .filter((state) => state.d.length > 0);

  const stops: MapStop[] = placeLabels(
    region.stops.flatMap((stop) => {
      const point = projection([stop.location.lng, stop.location.lat]);
      if (!point) return [];
      return [
        {
          id: stop.id,
          name: stop.name,
          state: stop.state,
          order: stop.order,
          x: Math.round(point[0]),
          y: Math.round(point[1]),
          labelSide: "above" as const,
          dayRange: dayRange(stop),
          firstDay: stop.days[0]?.dayNumber,
        },
      ];
    }),
  );

  const routeD = stops.map((stop, index) => `${index ? "L" : "M"}${stop.x},${stop.y}`).join("");

  return { width: WIDTH, height, states, routeD, stops };
}

/* ---------------------------------------------------------------- the nation */

export type NationalStop = {
  id: string;
  name: string;
  state: string;
  x: number;
  y: number;
  firstDay?: number;
  dayRange?: string;
};

export type NationalLeg = {
  id: string;
  name: string;
  order: number;
  /** This leg's drive, opening with the hop from the previous leg's last stop. */
  routeD: string;
  stops: NationalStop[];
  /** Where the leg's number sits — its first stop. */
  badge?: { x: number; y: number };
};

export type NationalMapData = {
  width: number;
  height: number;
  states: Array<{ id: string; name: string; d: string; visited: boolean }>;
  legs: NationalLeg[];
};

/**
 * The contiguous 48, fixed. Cropping to the written stops instead would redraw
 * the country every time a leg lands — and the point of this map is the part
 * that isn't filled in yet.
 */
const NATION: Window = { lngMin: -125.4, lngMax: -66.6, latMin: 24.3, latMax: 49.6 };
/** Whole coastlines at this scale: a pixel of wiggle isn't visible, but keeping
 *  it across 49 states is most of the home page's bytes. */
const NATION_POINT_GAP = 1.6;
/** Albers' usual conic parallels for the US — less bowing than the frame's own. */
const NATION_PARALLELS: [number, number] = [29.5, 45.5];

/** Postal code → the name us-atlas uses, so `stop.state` can shade its state. */
const STATE_BY_POSTAL: Record<string, string> = {
  AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California", CO: "Colorado",
  CT: "Connecticut", DC: "District of Columbia", DE: "Delaware", FL: "Florida",
  GA: "Georgia", IA: "Iowa", ID: "Idaho", IL: "Illinois", IN: "Indiana",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", MA: "Massachusetts",
  MD: "Maryland", ME: "Maine", MI: "Michigan", MN: "Minnesota", MO: "Missouri",
  MS: "Mississippi", MT: "Montana", NC: "North Carolina", ND: "North Dakota",
  NE: "Nebraska", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NV: "Nevada", NY: "New York", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VA: "Virginia", VT: "Vermont",
  WA: "Washington", WI: "Wisconsin", WV: "West Virginia", WY: "Wyoming",
};

/**
 * Every written region's stops on one map of the country — the region maps
 * merged. One projection, so the legs line up into the single continuous loop
 * they actually are, and the states still to come stay visibly empty.
 *
 * At a hundred-plus stops nothing is labelled: pins are dots, each leg carries
 * one number, and the legend beside the map does the naming.
 */
export function nationalMapData(regions: Region[]): NationalMapData | undefined {
  const written = regions.filter((region) => region.stops.length > 0);
  if (!written.length) return undefined;

  const contiguous = stateFeatures.filter((state) => {
    const bounds = stateBounds.get(String(state.id));
    return bounds ? intersects(bounds, NATION) : false;
  });

  const { projection, height } = projectionFor(NATION, {
    parallels: NATION_PARALLELS,
    fitTo: { type: "FeatureCollection", features: contiguous },
  });
  const context = new DecimatingPath(NATION_POINT_GAP);
  const path = geoPath(projection, context);

  const visitedNames = new Set(
    written.flatMap((region) => region.stops.map((stop) => STATE_BY_POSTAL[stop.state] ?? "")),
  );

  const states = contiguous
    .map((state) => {
      path(state);
      return {
        id: String(state.id),
        name: state.properties.name,
        d: context.result(),
        visited: visitedNames.has(state.properties.name),
      };
    })
    .filter((state) => state.d.length > 0);

  let previous: NationalStop | undefined;

  const legs = written.map((region) => {
    const stops: NationalStop[] = region.stops.flatMap((stop) => {
      const point = projection([stop.location.lng, stop.location.lat]);
      if (!point) return [];
      return [
        {
          id: stop.id,
          name: stop.name,
          state: stop.state,
          x: Math.round(point[0]),
          y: Math.round(point[1]),
          firstDay: stop.days[0]?.dayNumber,
          dayRange: dayRange(stop),
        },
      ];
    });

    // Opening from the previous leg's last stop keeps the loop unbroken across
    // the seam — the drive between legs is a drive like any other.
    const line = previous ? [previous, ...stops] : stops;
    const routeD = line.map((stop, index) => `${index ? "L" : "M"}${stop.x},${stop.y}`).join("");
    previous = stops.at(-1) ?? previous;

    return {
      id: region.id,
      name: region.name,
      order: region.order,
      routeD,
      stops,
      badge: stops[0] ? { x: stops[0].x, y: stops[0].y } : undefined,
    };
  });

  return { width: WIDTH, height, states, legs };
}
