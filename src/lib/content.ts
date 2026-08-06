import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { planSchema, regionMetaSchema, stopSchema, tripMetaSchema } from "@/schema/trip";
import type { Category, Day, Item, Plan, PlannedStop, Region, Stop, Trip } from "@/types/trip";

/**
 * Loads the curated JSON in `content/` and assembles it into one trip tree.
 *
 * Runs at build time only (static export), inside server components and the
 * `npm run validate` script — so the JSON never ships to the browser, only the
 * HTML rendered from it. Adding a region is adding a folder; adding a stop is
 * adding a file. Nothing needs registering.
 *
 *   content/trip.json                                trip header + categories
 *   content/regions/<regionId>/region.json           region metadata
 *   content/regions/<regionId>/stops/<stopId>.json   one stop, with its days
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const REGIONS_DIR = path.join(CONTENT_DIR, "regions");

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

const rel = (file: string) => path.relative(process.cwd(), file);

// Generic over the schema itself so the *output* type (post-defaults) is what
// callers get — inferring from z.ZodType<T> would hand back the input type.
function parseFile<S extends z.ZodTypeAny>(schema: S, file: string): z.infer<S> {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new ContentError(`${rel(file)}: not valid JSON — ${(error as Error).message}`);
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new ContentError(`${rel(file)} does not match the schema:\n${issues}`);
  }
  return result.data;
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listJson(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
}

function loadRegion(regionId: string): Region {
  const regionDir = path.join(REGIONS_DIR, regionId);
  const meta = parseFile(regionMetaSchema, path.join(regionDir, "region.json"));

  if (meta.id !== regionId) {
    throw new ContentError(
      `content/regions/${regionId}/region.json: id "${meta.id}" must match its folder name "${regionId}"`,
    );
  }

  const stopsDir = path.join(regionDir, "stops");
  const stops: Stop[] = listJson(stopsDir).map((filename) => {
    const file = path.join(stopsDir, filename);
    const stop = parseFile(stopSchema, file);
    const expectedId = filename.replace(/\.json$/, "");
    if (stop.id !== expectedId) {
      throw new ContentError(`${rel(file)}: id "${stop.id}" must match its filename "${expectedId}"`);
    }
    stop.days.sort((a, b) => a.dayNumber - b.dayNumber);
    return stop;
  });

  stops.sort((a, b) => a.order - b.order);
  return { ...meta, stops };
}

/** Cross-file rules the per-file schemas can't see. */
function checkReferentialIntegrity(trip: Trip): void {
  const problems: string[] = [];
  const categoryIds = new Set(trip.categories.map((category) => category.id));

  const seen = <T>(label: string, values: Array<[T, string]>) => {
    const first = new Map<T, string>();
    for (const [value, where] of values) {
      const previous = first.get(value);
      if (previous) problems.push(`duplicate ${label} "${String(value)}" — ${previous} and ${where}`);
      else first.set(value, where);
    }
  };

  seen(
    "region order",
    trip.regions.map((region) => [region.order, `region "${region.id}"`] as [number, string]),
  );
  seen(
    "region id",
    trip.regions.map((region) => [region.id, `region "${region.name}"`] as [string, string]),
  );

  const stopIds: Array<[string, string]> = [];
  const itemIds: Array<[string, string]> = [];
  const dayNumbers: Array<[number, string]> = [];

  for (const region of trip.regions) {
    seen(
      `stop order in "${region.id}"`,
      region.stops.map((stop) => [stop.order, `stop "${stop.id}"`] as [number, string]),
    );

    for (const stop of region.stops) {
      const where = `${region.id}/${stop.id}`;
      stopIds.push([stop.id, `region "${region.id}"`]);

      for (const day of stop.days) {
        dayNumbers.push([day.dayNumber, `${where} (${day.label})`]);

        for (const item of itemsOf(day)) {
          itemIds.push([item.id, `${where} day ${day.dayNumber}`]);
          if (!categoryIds.has(item.categoryId)) {
            problems.push(
              `${where} day ${day.dayNumber}: item "${item.id}" references unknown categoryId "${item.categoryId}"`,
            );
          }
        }
      }
    }
  }

  // Stop ids are URL keys, so they must be unique across the whole trip.
  seen("stop id", stopIds);
  seen("item id", itemIds);
  seen("dayNumber", dayNumbers);

  if (problems.length) {
    throw new ContentError(`content failed referential checks:\n${problems.map((p) => `  • ${p}`).join("\n")}`);
  }
}

function buildTrip(): Trip {
  const meta = parseFile(tripMetaSchema, path.join(CONTENT_DIR, "trip.json"));
  const regions = listDirs(REGIONS_DIR)
    .map(loadRegion)
    .sort((a, b) => a.order - b.order);

  const trip: Trip = { ...meta, regions };
  checkReferentialIntegrity(trip);
  return trip;
}

let cached: Trip | undefined;

/** The assembled trip. Cached per process — the content never changes at runtime. */
export function getTrip(): Trip {
  cached ??= buildTrip();
  return cached;
}

/** Re-read from disk, ignoring the cache. Used by `npm run validate`. */
export function loadTripFresh(): Trip {
  cached = undefined;
  return getTrip();
}

/** Every activity on a day — drive and rest blocks carry no item. */
export function itemsOf(day: Day): Item[] {
  const fromBlocks = (day.blocks ?? []).flatMap((block) => (block.item ? [block.item] : []));
  return [...fromBlocks, ...(day.freeMenu ?? [])];
}

export function getRegion(regionId: string): Region | undefined {
  return getTrip().regions.find((region) => region.id === regionId);
}

export function getStop(regionId: string, stopId: string): { region: Region; stop: Stop } | undefined {
  const region = getRegion(regionId);
  const stop = region?.stops.find((candidate) => candidate.id === stopId);
  return region && stop ? { region, stop } : undefined;
}

export function getCategoryMap(): Map<string, Category> {
  return new Map(getTrip().categories.map((category) => [category.id, category]));
}

let cachedPlan: Plan | undefined;

/**
 * The planned shape of the whole loop — every region and stop id, including the
 * legs nobody has written days for yet. Authored content always wins; this only
 * fills in what is still ahead.
 */
export function getPlan(): Plan {
  cachedPlan ??= parseFile(planSchema, path.join(CONTENT_DIR, "plan.json"));
  return cachedPlan;
}

export type RegionPlan = {
  stops: PlannedStop[];
  plannedStops: number;
  plannedDays: number;
  /** Stops that already have a content file. */
  authored: Set<string>;
};

export function getRegionPlan(regionId: string): RegionPlan | undefined {
  const planned = getPlan().regions.find((region) => region.id === regionId);
  if (!planned) return undefined;

  const authored = new Set(getRegion(regionId)?.stops.map((stop) => stop.id) ?? []);
  return {
    stops: [...planned.stops].sort((a, b) => a.order - b.order),
    plannedStops: planned.stops.length,
    plannedDays: planned.stops.reduce((total, stop) => total + stop.plannedDays, 0),
    authored,
  };
}
