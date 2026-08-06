import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTrip } from "@/lib/content";
import "./globals.css";

const SITE_URL = "https://thegreatamericanroadtripchallenge.com";

export function generateMetadata(): Metadata {
  const trip = getTrip();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: trip.title,
      template: `%s — ${trip.title}`,
    },
    description: trip.tagline,
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: trip.title,
      title: trip.title,
      description: trip.tagline,
    },
    twitter: {
      card: "summary_large_image",
      title: trip.title,
      description: trip.tagline,
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
