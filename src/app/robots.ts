import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Everything is public and everything is welcome, including the AI crawlers.
 *
 * That is a deliberate call, not an oversight. This is a free, view-only guide
 * whose goal is to be found; an answer engine citing a day of the itinerary is
 * a win, not a leak. The named agents below are listed explicitly rather than
 * left to the wildcard so the intent is unmistakable to anyone reading the
 * file — and so that flipping one to `disallow` later is a one-line change.
 */
export const dynamic = "force-static";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
