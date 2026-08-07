import { itemsOf } from "@/lib/content";
import { dayRange, regionStats, tripStats } from "@/lib/derive";
import { canonical, tripDescription } from "@/lib/seo";
import type { Day, Region, Stop, Trip } from "@/types/trip";

/**
 * JSON-LD, the part of the page written for machines.
 *
 * This is the highest-leverage thing on the site for answer engines: a model
 * asked "what should I do on a road trip through Montana?" can lift a typed
 * `TouristAttraction` with real coordinates far more reliably than it can
 * parse a timeline out of styled divs. Schema.org's travel vocabulary fits the
 * content almost exactly — `TouristTrip` has an `itinerary`, and each stop is
 * genuinely a `TouristDestination`.
 *
 * Rule: only assert what the page displays. No invented ratings, no prices, no
 * dates. Structured data that oversells gets the site penalised, and it would
 * also be a lie about a hand-curated itinerary.
 */

type Json = Record<string, unknown>;

function place(stop: Stop, regionId: string): Json {
  return {
    "@type": "TouristDestination",
    name: stop.name,
    description: stop.summary,
    url: canonical(`region/${regionId}/${stop.id}`),
    address: {
      "@type": "PostalAddress",
      addressRegion: stop.state,
      addressCountry: stop.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: stop.location.lat,
      longitude: stop.location.lng,
    },
  };
}

/** The whole loop, for the home page. */
export function tripSchema(trip: Trip): Json {
  const stats = tripStats(trip);
  const written = trip.regions.filter((region) => region.stops.length > 0);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${canonical()}#website`,
        url: canonical(),
        name: trip.title,
        description: tripDescription(trip),
        inLanguage: "en-US",
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonical()}#trip`,
        name: trip.title,
        description: trip.mission,
        url: canonical(),
        touristType: "Road trip",
        subjectOf: { "@id": `${canonical()}#website` },
        itinerary: {
          "@type": "ItemList",
          numberOfItems: written.length,
          itemListElement: written.map((region, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "TouristTrip",
              name: region.name,
              description: region.summary,
              url: canonical(`region/${region.id}`),
            },
          })),
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Days mapped", value: stats.days },
          { "@type": "PropertyValue", name: "Stops", value: stats.stops },
          { "@type": "PropertyValue", name: "States covered", value: stats.states.length },
        ],
      },
    ],
  };
}

export function breadcrumbs(trail: Array<{ name: string; path: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonical(crumb.path),
    })),
  };
}

/** One leg: a sub-trip whose itinerary is its stops, in driving order. */
export function regionSchema(region: Region): Json {
  const info = regionStats(region);
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: region.name,
    description: region.summary,
    url: canonical(`region/${region.id}`),
    partOfTrip: { "@type": "TouristTrip", name: "The Great American Road Trip Challenge", url: canonical() },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: region.stops.length,
      itemListElement: region.stops.map((stop, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: place(stop, region.id),
      })),
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Days", value: info.days },
      { "@type": "PropertyValue", name: "Best season", value: region.season },
    ],
  };
}

/** One town: a destination, plus the attractions the itinerary visits there. */
export function stopSchema(stop: Stop, region: Region): Json {
  const attractions = stop.days.flatMap((day) =>
    itemsOf(day)
      .filter((item) => item.location)
      .map((item) => ({
        "@type": "TouristAttraction",
        name: item.title,
        description: item.blurb,
        ...(item.location?.lat != null && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: item.location.lat,
            longitude: item.location.lng,
          },
        }),
        ...(item.location?.address && {
          address: { "@type": "PostalAddress", streetAddress: item.location.address },
        }),
      })),
  );

  return {
    "@context": "https://schema.org",
    ...place(stop, region.id),
    ...(dayRange(stop) && {
      additionalProperty: [
        { "@type": "PropertyValue", name: "Itinerary days", value: dayRange(stop) },
      ],
    }),
    ...(attractions.length && {
      containsPlace: attractions,
    }),
  };
}

/**
 * One day as an ordered list of attractions. The order is the point — this is
 * the structure that lets an answer engine say "start at the museum, then the
 * park" instead of listing a town's sights at random.
 */
export function daySchema(day: Day, stop: Stop, region: Region): Json {
  const items = itemsOf(day);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: day.label,
    description: day.summary,
    url: canonical(`region/${region.id}/day/${day.dayNumber}`),
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TouristAttraction",
        name: item.title,
        description: item.blurb,
        ...(item.location?.lat != null && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: item.location.lat,
            longitude: item.location.lng,
          },
        }),
        ...(item.location?.address && {
          address: { "@type": "PostalAddress", streetAddress: item.location.address },
        }),
      },
    })),
  };
}
