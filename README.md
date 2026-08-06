# The Great American Road Trip Challenge

> See all of America — the definitive road trip, mapped hour by hour.

A **view-only** itinerary site: one continuous, hand-curated road trip through the contiguous US, rendered region → stop → day → hour. No accounts, no database, no AI in the request path. Live at **[thegreatamericanroadtripchallenge.com](https://thegreatamericanroadtripchallenge.com)**.

The full product brief is in [`CLAUDE.md`](CLAUDE.md); the data contract is in [`docs/road-trip-schema.md`](docs/road-trip-schema.md).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind v4 |
| Content | Curated JSON in `content/`, validated with Zod |
| Build | `next build` with `output: "export"` → static HTML in `out/` |
| Hosting | Cloudflare Workers static assets (`wrangler.jsonc`) |

There is no server, no database, and no auth — by design. Those belong to the future trip generator, not this site.

## Commands

```bash
make setup          # npm install
make dev            # next dev at http://localhost:3000
make validate       # check content/ against the schema (also runs in build)
make build          # validate + static export to out/
make lint           # eslint + tsc --noEmit
make preview        # serve the site through wrangler locally, exactly as Cloudflare will
make deploy         # wrangler deploy (the build hook runs `npm run build` first)
```

## Authoring content

```
content/
  trip.json                                 trip header + the 18 categories
  regions/<regionId>/region.json            region metadata (season, order, summary)
  regions/<regionId>/stops/<stopId>.json    one stop (city/area) with its days[]
```

- **Add a region:** create `content/regions/<regionId>/region.json`. Its `id` must match the folder name and its `order` must be unique.
- **Add a stop:** drop a JSON file in that region's `stops/`. Its `id` must match the filename; `order` positions it within the region.
- Nothing needs registering — the loader discovers files at build time, sorts regions and stops by `order`, and sorts days by `dayNumber`.

`npm run validate` enforces the schema plus the rules no single file can see:

- every `item.categoryId` exists in `trip.json`
- `item.id` and `dayNumber` are unique across the whole trip
- `active` days have blocks, `commute` days have a commute object, `free` days have neither
- region `order` and per-region stop `order` are unique

It also warns (without failing) about over-stuffed days, gaps in day numbering, and items missing a map link.

Two things are computed, never authored: the **master packing list** (aggregated from every `item.gear[]`) and all the trip/region counts.

## Deploying

The site builds to fully static HTML, so any static host works. On Cloudflare:

**Option A — connect this repo (Workers Builds):** in the Cloudflare dashboard create a Worker from this GitHub repo. The only required setting is

| Setting | Value |
|---|---|
| Deploy command | `npx wrangler deploy` |
| Build command | *(leave empty)* |
| Root directory | `/` |

`wrangler.jsonc` declares `build.command = "npm run build"`, so wrangler runs the static export itself before uploading `out/`. Leaving the dashboard's build command empty avoids building twice; setting it to `npm run build` is harmless but redundant.

**Option B — deploy from your machine:** `make deploy` (`wrangler deploy` uploads `out/`).

Either way, attach `thegreatamericanroadtripchallenge.com` to the Worker under **Settings → Domains & Routes**.
