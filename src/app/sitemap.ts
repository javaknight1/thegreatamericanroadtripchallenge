import type { MetadataRoute } from "next";
import { getTrip } from "@/lib/content";
import { canonical } from "@/lib/seo";

/**
 * Every page, listed once. At ~700 day pages this is not optional — without a
 * sitemap the deep pages are only reachable by crawling the day rail link by
 * link, and the ones late in the trip would take a long time to be found.
 *
 * Next emits this to `out/sitemap.xml` during the static export.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const trip = getTrip();

  const entries: MetadataRoute.Sitemap = [
    { url: canonical(), changeFrequency: "weekly", priority: 1 },
    { url: canonical("calendar"), changeFrequency: "monthly", priority: 0.7 },
    { url: canonical("packing-list"), changeFrequency: "monthly", priority: 0.6 },
  ];

  for (const region of trip.regions) {
    // Unwritten legs still render a real page (their route from the manifest),
    // so they belong in the sitemap — just ranked below the written ones.
    const written = region.stops.length > 0;
    entries.push({
      url: canonical(`region/${region.id}`),
      changeFrequency: written ? "monthly" : "weekly",
      priority: written ? 0.9 : 0.4,
    });

    for (const stop of region.stops) {
      entries.push({
        url: canonical(`region/${region.id}/${stop.id}`),
        changeFrequency: "monthly",
        priority: 0.7,
      });

      for (const day of stop.days) {
        entries.push({
          url: canonical(`region/${region.id}/day/${day.dayNumber}`),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  return entries;
}
