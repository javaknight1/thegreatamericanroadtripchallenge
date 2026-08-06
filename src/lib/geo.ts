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
const HEIGHT = 520;
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
    if (Math.abs(nextX - this.lastX) < MIN_POINT_GAP && Math.abs(nextY - this.lastY) < MIN_POINT_GAP) return;
    this.lastX = nextX;
    this.lastY = nextY;
    this.parts.push(`L${nextX},${nextY}`);
  }

  closePath() {
    this.parts.push("Z");
  }

  /** geoPath calls this for point geometry; the map draws its own pins. */
  arc(_x: number, _y: number, _radius: number, _startAngle: number, _endAngle: number) {}

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

function projectionFor(window: Window): GeoProjection {
  const projection = geoAlbers()
    .rotate([(window.lngMin + window.lngMax) / -2, 0])
    .center([0, (window.latMin + window.latMax) / 2])
    .parallels([window.latMin, window.latMax]);

  projection.fitExtent(
    [
      [PADDING, PADDING],
      [WIDTH - PADDING, HEIGHT - PADDING],
    ],
    windowCorners(window),
  );
  projection.clipExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ]);

  return projection;
}

/**
 * Stops cluster (four New England stops sit within a thumb's width), so labels
 * collide. Greedy placement: label above unless that box is already taken, in
 * which case drop it below the pin.
 */
function placeLabels(stops: MapStop[]): MapStop[] {
  const halfWidth = (name: string) => Math.max(30, name.length * 3.6);
  const placed: Array<{ x: number; y: number; half: number }> = [];

  return stops.map((stop) => {
    const half = halfWidth(stop.name);
    const candidates: Array<MapStop["labelSide"]> = ["above", "below"];

    for (const side of candidates) {
      const y = side === "above" ? stop.y - 15 : stop.y + 22;
      const clash = placed.some(
        (box) => Math.abs(box.y - y) < 13 && Math.abs(box.x - stop.x) < box.half + half,
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
  const projection = projectionFor(window);
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

  return { width: WIDTH, height: HEIGHT, states, routeD, stops };
}
