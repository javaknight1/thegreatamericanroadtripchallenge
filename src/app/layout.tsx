import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTrip } from "@/lib/content";
import { canonical, tripDescription } from "@/lib/seo";
import "./globals.css";

export function generateMetadata(): Metadata {
  const trip = getTrip();
  // The description leads with what the thing *is* and how big it is. "See all
  // of America" is a good tagline and a bad search result — it says nothing a
  // reader can act on, and nothing a model can quote.
  const description = tripDescription(trip);
  return {
    metadataBase: new URL(canonical()),
    title: {
      default: `${trip.title} — ${trip.tagline}`,
      template: `%s — ${trip.title}`,
    },
    description,
    alternates: { canonical: canonical() },
    keywords: [
      "road trip itinerary",
      "USA road trip",
      "all 48 states road trip",
      "cross country road trip planner",
      "national parks road trip",
      "day by day road trip itinerary",
    ],
    openGraph: {
      type: "website",
      url: canonical(),
      siteName: trip.title,
      title: trip.title,
      description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: trip.title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1218" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
