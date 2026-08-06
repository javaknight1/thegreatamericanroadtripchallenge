import type { z } from "zod";
import type {
  blockSchema,
  categorySchema,
  commuteSchema,
  commuteStopSchema,
  coordinatesSchema,
  daySchema,
  dayTypeSchema,
  foodMustTrySchema,
  itemLocationSchema,
  itemSchema,
  lodgingSchema,
  regionMetaSchema,
  stopSchema,
  tierSchema,
  tripMetaSchema,
} from "@/schema/trip";

export type Category = z.infer<typeof categorySchema>;
export type Tier = z.infer<typeof tierSchema>;
export type DayType = z.infer<typeof dayTypeSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type ItemLocation = z.infer<typeof itemLocationSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Block = z.infer<typeof blockSchema>;
export type CommuteStop = z.infer<typeof commuteStopSchema>;
export type Commute = z.infer<typeof commuteSchema>;
export type Day = z.infer<typeof daySchema>;
export type Lodging = z.infer<typeof lodgingSchema>;
export type FoodMustTry = z.infer<typeof foodMustTrySchema>;
export type Stop = z.infer<typeof stopSchema>;
export type RegionMeta = z.infer<typeof regionMetaSchema>;
export type TripMeta = z.infer<typeof tripMetaSchema>;

/** A region with its stop files merged in — what the app actually renders. */
export type Region = RegionMeta & { stops: Stop[] };

/** The whole assembled tree: trip → region → stop → day → block → item. */
export type Trip = TripMeta & { regions: Region[] };
