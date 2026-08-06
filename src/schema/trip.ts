import { z } from "zod";

/**
 * Zod schemas are the single source of truth for content shape.
 * `src/types/trip.ts` infers its TypeScript types from these — change the
 * schema first, and the types follow. See docs/road-trip-schema.md.
 */

const nonEmpty = z.string().min(1);
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "must be a 6-digit hex color, e.g. #2E7D32");
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

export const categorySchema = z.object({
  id: slug,
  label: nonEmpty,
  color: hexColor,
});

export const tierSchema = z.enum(["anchor", "mid", "low"]);
export const dayTypeSchema = z.enum(["active", "free", "commute"]);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const itemLocationSchema = z.object({
  name: nonEmpty,
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  mapLink: z.string().url().optional(),
});

export const itemSchema = z.object({
  /** Stable and unique trip-wide. Never derive this from array position. */
  id: slug,
  title: nonEmpty,
  categoryId: slug,
  tier: tierSchema,
  durationMins: z.number().int().positive(),
  location: itemLocationSchema,
  blurb: nonEmpty,
  /** Aggregated into the master packing list — never authored as a list. */
  gear: z.array(nonEmpty).optional(),
});

export const blockSchema = z
  .object({
    start: z.string().optional(),
    end: z.string().optional(),
    /** Looser alternative to start/end, e.g. "Morning". */
    slot: z.string().optional(),
    item: itemSchema,
  })
  .refine((block) => Boolean(block.slot) || Boolean(block.start), {
    message: "a block needs either `start` (with optional `end`) or a `slot` label",
  });

export const commuteStopSchema = z.object({
  title: nonEmpty,
  blurb: nonEmpty,
  mapLink: z.string().url().optional(),
});

export const commuteSchema = z.object({
  from: nonEmpty,
  to: nonEmpty,
  driveTimeMins: z.number().int().positive(),
  scenicNote: z.string().optional(),
  stopsAlongWay: z.array(commuteStopSchema).optional(),
});

export const daySchema = z
  .object({
    /** Global running count across the whole trip — not a calendar date. */
    dayNumber: z.number().int().positive(),
    label: nonEmpty,
    type: dayTypeSchema,
    summary: nonEmpty,
    blocks: z.array(blockSchema).optional(),
    freeMenu: z.array(itemSchema).optional(),
    commute: commuteSchema.optional(),
  })
  .superRefine((day, ctx) => {
    const fail = (message: string, path: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });

    if (day.type === "active") {
      if (!day.blocks?.length) fail("active days need at least one block", "blocks");
      if (day.commute) fail("active days must not have a `commute`", "commute");
      if (day.freeMenu) fail("active days must not have a `freeMenu`", "freeMenu");
    }
    if (day.type === "free") {
      if (day.blocks) fail("free days must not have `blocks`", "blocks");
      if (day.commute) fail("free days must not have a `commute`", "commute");
    }
    if (day.type === "commute") {
      if (!day.commute) fail("commute days need a `commute` object", "commute");
      if (day.blocks) fail("commute days must not have `blocks`", "blocks");
      if (day.freeMenu) fail("commute days must not have a `freeMenu`", "freeMenu");
    }
  });

export const lodgingSchema = z.object({
  name: nonEmpty,
  blurb: nonEmpty,
  mapLink: z.string().url().optional(),
});

export const foodMustTrySchema = z.object({
  name: nonEmpty,
  blurb: nonEmpty,
});

export const stopSchema = z.object({
  id: slug,
  name: nonEmpty,
  /** State / province / equivalent subdivision. Not US-specific. */
  state: nonEmpty,
  /** ISO country code; defaults to US, "CA" for the Canada detours. */
  country: z.string().length(2).default("US"),
  order: z.number().int().positive(),
  location: coordinatesSchema,
  summary: nonEmpty,
  seasonalTip: z.string().optional(),
  lodging: z.array(lodgingSchema).default([]),
  foodMustTry: z.array(foodMustTrySchema).default([]),
  days: z.array(daySchema).default([]),
});

/** A region's own file — stops live in sibling files and are merged in. */
export const regionMetaSchema = z.object({
  id: slug,
  name: nonEmpty,
  /** 1 = first leg of the loop. Unique across regions. */
  order: z.number().int().positive(),
  season: nonEmpty,
  seasonNote: nonEmpty,
  summary: nonEmpty,
});

/** trip.json — the header. Regions live in content/regions/ and are merged in. */
export const tripMetaSchema = z.object({
  id: slug,
  title: nonEmpty,
  tagline: nonEmpty,
  mission: nonEmpty,
  durationEstimate: nonEmpty,
  recommendedStart: nonEmpty,
  categories: z.array(categorySchema).min(1),
});

/**
 * content/plan.json — the id contract for the whole loop, including legs whose
 * days aren't written yet. Kept separate from the itinerary so an unwritten
 * region can still show what's coming without faking day content.
 */
export const plannedStopSchema = z.object({
  id: slug,
  order: z.number().int().positive(),
  name: nonEmpty,
  state: nonEmpty,
  plannedDays: z.number().int().positive(),
});

export const planSchema = z.object({
  note: z.string().optional(),
  regions: z.array(
    z.object({
      id: slug,
      stops: z.array(plannedStopSchema),
    }),
  ),
});
