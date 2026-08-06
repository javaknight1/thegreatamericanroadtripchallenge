import type { Coordinates, ItemLocation, Tier } from "@/types/trip";

/** "3h 15m", "45m", "2h" */
export function formatDuration(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** "9:00 AM – 12:00 PM", "9:00 AM", or the loose slot label. */
export function formatTimeSpan(block: { start?: string; end?: string; slot?: string }): string {
  if (block.start && block.end) return `${block.start} – ${block.end}`;
  return block.start ?? block.slot ?? "";
}

export const tierLabels: Record<Tier, string> = {
  anchor: "Anchor",
  mid: "Worth it",
  low: "Bonus",
};

export const tierDescriptions: Record<Tier, string> = {
  anchor: "Always do — the reason this stop is on the map",
  mid: "Do most of these",
  low: "Quirky bonus, if it's happening while you're here",
};

/**
 * A map link for a location, falling back to coordinates then to a name search
 * when the content doesn't author one.
 */
export function mapUrl(location: ItemLocation | (Coordinates & { name?: string })): string {
  if ("mapLink" in location && location.mapLink) return location.mapLink;
  if (location.lat != null && location.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  }
  const query = "name" in location && location.name ? location.name : "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "Boston, MA" — and "Toronto, ON, CA" once the trip leaves the US. */
export function formatPlace(place: { name: string; state: string; country: string }): string {
  return place.country === "US"
    ? `${place.name}, ${place.state}`
    : `${place.name}, ${place.state}, ${place.country}`;
}

/** Readable relative luminance check so text on a category color stays legible. */
export function contrastText(hex: string): "#0B1220" | "#FFFFFF" {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.45 ? "#0B1220" : "#FFFFFF";
}

/** A translucent wash of a hex colour, for banding a row without shouting. */
export function tint(hex: string, alpha: number): string | undefined {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return undefined;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
