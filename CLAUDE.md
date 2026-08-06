# CLAUDE.md — The Great American Road Trip Challenge

This is the context brief for building this project. Read it fully before scaffolding. It covers **what we're building now**, **what's deliberately deferred**, and the **long-term vision** — so choices made today don't have to be torn out tomorrow.

---

## The mission

> To map the single most complete road trip across the United States — one continuous, hour-by-hour guide through all 48 contiguous states that captures everything worth seeing, tasting, and doing: national parks and iconic cities, hidden small-town gems, festivals, food, and roadside oddities alike. So thorough that anyone who follows it experiences the full breadth of America, with nothing left for a "first time."

Tagline: **"See all of America — the definitive road trip, mapped hour by hour."**

Domain: **thegreatamericanroadtripchallenge.com**

---

## What we're building NOW (MVP)

A **view-only itinerary website** that renders one massive, hand-curated road trip as a browsable, color-coded, hour-by-hour guide.

- **Read-only.** No accounts, no login, no user data, no progress tracking. Users browse and follow.
- **Content-driven.** The entire itinerary is authored as **curated JSON content files**. The site reads them and renders. No database required for MVP.
- **No AI at runtime.** None. The content is hand-authored. (This is a core product principle — see "Why no runtime AI" below.)
- **Mobile-friendly web is required.** Most users will view on a phone. Responsive, fast, works well on small screens.
- **Navigable by region → stop → day.** Each day breaks into time blocks; each activity links out to Google Maps.

### Explicitly OUT of scope for now
- ❌ The trip *generator* (customized trips from user preferences) — that's a future product, not this build.
- ❌ Auth / user accounts (Clerk comes later, with the generator).
- ❌ Progress tracking, check-offs, badges, leaderboards — deferred.
- ❌ Any backend service, database, or AI calls. Static content site only.

Don't build these. But **do** leave clean seams for them (details below).

---

## Tech stack

- **Frontend:** Next.js (mobile-friendly, responsive).
- **Content:** curated JSON files in-repo. No DB.
- **Hosting:** start cheap/simple (static-friendly host or Rob's homelab); nothing that requires managed infra yet.
- **Scaffolding:** conform to **`rob-stack`** (Rob's canonical stack CLI for scaffolding + conformance across his apps) — use it to set up the project so this repo matches his other apps' conventions.

The heavier stack (Go backend, Postgres/Supabase, Clerk) belongs to the **future generator**, NOT this site. Don't pull it in now.

---

## Content schema (v1)

Full spec with an annotated example ships alongside this brief as [`docs/road-trip-schema.md`](docs/road-trip-schema.md) — treat that as the source of truth for shape. Summary:

```
trip → region → stop → day → block → item
```

- **trip** — header, mission, tagline, `durationEstimate` (~4.5 years), `recommendedStart`, and the `categories[]` list.
- **region** — e.g. "The Northeast"; has `order`, `season`, `seasonNote`, `summary`.
- **stop** — a city/area (Boston, Acadia…). Has `location`, `summary`, optional `seasonalTip`, `lodging[]`, `foodMustTry[]`, and `days[]`. Canada detours are just stops with `country: "CA"`.
- **day** — `dayNumber` (global running count, **not** a calendar date), `label`, and a `type`:
  - `active` → has `blocks[]` (hour-by-hour).
  - `free` → deliberately open; has an optional `freeMenu[]` of suggestions.
  - `commute` → has a `commute` object (from/to, drive time, stops along the way).
- **block** — a time slot (`start`/`end` clock times, or a looser `slot` label) holding one **item**.
- **item** — the activity: stable **`id`**, `title`, `categoryId`, `tier`, `durationMins`, `location` (with `mapLink`), `blurb`, optional `gear[]`.

### Rules to honor when rendering
- **18 color-coded categories** — every item maps to one; the UI colors by category. (Color hexes in the schema doc are a starting point; a design pass should confirm all 18 are visually distinct.)
- **Three priority tiers per item:** `anchor` (always do), `mid` (do most), `low` (quirky bonus / "if it's happening while you're here"). Surface these visually — anchors should stand out.
- **Master packing list is computed, not authored** — aggregate every `item.gear[]` across the trip (and per region) into a derived list.
- **`item.id` is stable** — never render-position-dependent. This is the seam that lets progress-tracking attach later without a schema change.

---

## Design / UX intent

- Clean, browsable, and genuinely nice to look at — this is also the marketing showcase (Rob will run Instagram ads off screenshots), so it should be screenshot-worthy.
- Color-coded categories are the visual backbone. A legend/filter by category would be valuable.
- Day view is the core screen: a day's time blocks laid out clearly, each activity with its blurb, category color, tier, duration, and a tap-to-open map link.
- Region and stop overview screens for zooming out; a map centering on each stop's `location`.
- Respect the trip's ethos: it's **unrushed** — free days and breathing room are a feature, render them as intentional, not empty.

---

## Content pipeline

- Content is authored **region by region**, clockwise, starting with the **Northeast** (the pilot/seed chapter: Boston → coastal Maine/Acadia → NH/VT mountains → NYC → Philadelphia → DC).
- The Northeast chapter will be delivered as the first JSON file — build the viewer against it.
- More regions get added as more JSON files over time; the site must render incrementally-added content gracefully. Expect the full dataset to grow very large (a ~4.5-year, hour-by-hour trip).

---

## The bigger picture (future — build with this in mind, don't build it yet)

This view-only site is **phase one** of a larger product family under Rob's **"Looper" LLC** (sibling: League Looper, which loops sports stadiums; this loops the country → **Land Looper**).

- **Phase two — the trip generator (Land Looper):** users answer questions (dates, region, big vs. small cities, interests, pace) and get a *personalized* itinerary generated from a curated, tagged place database via a **deterministic filter + geographic routing engine** (no runtime AI). This same content schema is designed to feed that engine — the curated items become its library.
- **Progress tracking / the "challenge" mechanic** likely arrives with phase two (check-offs, "X of 48 states," shareable scorecards) — which is why `item.id`s are already stable now.
- **Auth (Clerk), Postgres/Supabase, a Go backend** come online for the generator, not before.
- **Mobile app** is planned as a first-class client (alongside the mobile web).
- **Geographic expansion:** the same formula later extends to Europe, UK/Ireland, Australia/NZ, and Japan — so keep "US" from being hardcoded where a `region`/`country`-scoped design would generalize cleanly.
- **Monetization:** free to start; later gate high-value features (longer/multiple trips, offline export) behind a subscription. Nothing to build now, but avoid decisions that would make a paywall seam awkward later.

### Why no runtime AI (important principle)
Generating trips with a live model is a commodity (dozens of AI-wrapper apps exist) and a long-term cost risk if per-request pricing climbs. The moat is **hand-curated, expert-ranked, season-aware content** plus **deterministic rules** — never a model in the request path. Keep it that way.

---

## TL;DR for this build

Build a **fast, mobile-friendly, view-only Next.js site** that renders a **curated JSON itinerary** as a **color-coded, hour-by-hour, region→stop→day guide** with map links and a computed packing list. **No auth, no DB, no AI, no progress tracking.** Keep `item.id`s stable and avoid hardcoding "US" so the future generator and international expansion slot in cleanly. Scaffold with `rob-stack`. Start against the Northeast chapter.

---

## How this repo actually works (implementation notes)

Added during scaffolding — the facts a future session needs before editing code.

### Stack as built
- **Next.js 15 App Router + React 19 + TypeScript + Tailwind v4** (matches `rob-stack`'s Next.js conventions: `src/app`, `src/components`, `src/lib`, `@/*` alias, `postcss.config.mjs`, `eslint.config.mjs`, `Makefile`).
- **`output: "export"`** in `next.config.ts` — every page is prerendered to static HTML at build time into `out/`. There is no server at runtime, which is exactly what "no backend, no AI in the request path" demands.
- **Deployed to Cloudflare Workers static assets** via `wrangler deploy` (`wrangler.jsonc` points at `./out`). Deviates from `rob-stack`'s Vercel default because this is a pure static site.
- **Deliberately absent** (per the scope rules above): Clerk, Supabase, Upstash, Resend, R2, PostHog, Sentry, swagger, middleware, API routes.

### Content lives outside `src/`
```
content/
  trip.json                             trip header + the 18 categories
  regions/<regionId>/region.json        region metadata
  regions/<regionId>/stops/<stopId>.json  one file per stop (city/area)
```
Splitting per-stop keeps files hand-editable as the dataset grows to ~4.5 years of days. Adding a region = adding a folder; adding a stop = adding a file. Nothing needs registering — `src/lib/content.ts` discovers files from disk at build time and assembles the `trip → region → stop → day` tree, sorting regions/stops by `order` and days by `dayNumber`.

Because loading is `node:fs` inside server components, the JSON never ships to the browser — only the rendered HTML for that page does. Keep it that way as the dataset grows.

### Schema is enforced, not assumed
`src/schema/trip.ts` holds Zod schemas; `src/types/trip.ts` re-exports the inferred types. Content is validated on every load, and `npm run validate` (also run as part of `npm run build`) fails loudly with the file path and field path on bad content. When the schema changes, change the Zod schema first — the types follow.

### Derived data
`src/lib/derive.ts` computes what is never authored: the master packing list (aggregated `item.gear[]`, trip-wide and per-region), day/item counts, category usage, and state coverage. Nothing derived is stored in JSON.

### Conventions worth keeping
- `item.id` is authored, stable, and unique trip-wide — `npm run validate` enforces uniqueness. Don't generate ids from array position.
- `dayNumber` is unique trip-wide and is the URL key for a day.
- Category colors come from `content/trip.json`, never from CSS — one edit restyles the whole site.
- `country` defaults to `"US"` but is always read from the data; no US-specific logic is hardcoded.
