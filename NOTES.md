# NOTES.md — open observations and suggestions

A running record of things I've noticed while writing content and building the
site. **Nothing here has been acted on.** The baseline stands as authored; this
is the list to work from once the loop is fully written.

Rob's standing instruction: add suggestions here as they come up, without asking
first. Items are only removed when they're resolved or explicitly dropped.

Last updated at **142 stops · 442 days · 553 items · 30 states** — seven legs
complete plus California in progress (7 of its 16 stops), days 1–442
contiguous.

---

## 1. Free days are thin, and clustered badly

Every leg is under 10% free days, and the *gaps* are worse than the averages.
The brief says the trip is unrushed and free days are a feature — right now the
data doesn't back that up.

| leg | free days | longest run with none |
|---|---|---|
| New England | 4 / 69 (6%) | **27 days**, through day 69 |
| Mid-Atlantic | 5 / 76 (7%) | **35 days**, through day 141 |
| Coastal Southeast | 5 / 59 (8%) | 16 days, through day 183 |
| Florida | 4 / 44 (9%) | 12 days, through day 248 |
| Deep South | 3 / 67 (4%) | **30 days**, through day 285 |
| Texas & South Plains | 4 / 39 (10%) | 11 days, through day 354 |
| Desert Southwest | 6 / 63 (10%) | 22 days, through day 376 |

The Deep South run is the one I'd fix first: **days 256–285** is thirty straight
days without one, and it covers the heaviest material in the trip — Whitney
Plantation, Birmingham, the Legacy Museum, the Pettus Bridge, the National Civil
Rights Museum. That's a lot to absorb back to back.

**Suggestion:** now that rest is a block rather than a whole-day type, the cheap
fix is a half-day rest event inside an existing day rather than adding days. A
rest block in one of the Delta days and one mid-Mid-Atlantic would break both
long runs without changing any day numbers.

Also flagged by the audit — 4+ day stops with no breather anywhere in them:
Portland, Montpelier & Stowe, The Hudson Valley, Baltimore, Williamsburg &
Virginia Beach, Tampa & St. Petersburg, Memphis, Big Bend & Marfa, Santa Fe &
Taos. Big Bend is arguably correct (the days *are* the point); the cities less
so.

The Southwest's 22-day run (days 355–376) is worth a look for a different
reason: it ends at the Grand Canyon, and the days leading in are physically
demanding — White Sands, Canyon de Chelly, Monument Valley, Antelope Canyon,
then the rim, then Bright Angel. A rest day *before* day 376's descent would
serve the hike better than the free day that currently lands after it.

## 2. Stops running under their planned length

Not errors — the manifest's day counts are planning guidance. Listing them so
the choice is deliberate.

- **New York City — 15 of 18 days.** The biggest shortfall in the trip.
- **Boston — 6 of 7 days.**
- **Dallas & Fort Worth — 4 of 5 days.**
- **Austin — 5 of 6 days.**

## 3. Places I think are missing

- **New York City: Grand Central Terminal and Coney Island.** Both are obvious
  omissions for a trip whose pitch is "nothing left for a first time," and NYC
  is already three days under plan — they'd fit without displacing anything.
- **Sports is thin.** Only Churchill Downs (Deep South) and an Astros game
  (Houston, as a free-day option) so far. For a trip crossing the whole country
  over years, more ballparks/arenas would be easy and characterful — Fenway and
  Yankee Stadium are the glaring ones, both in legs already written.
- **Florida has no `somber-sites`, `concerts-venues` or `sports` at all.** The
  Kennedy Space Center covers space; but nothing on, say, the Pulse memorial.

## 4. Long drives worth a second look

Twenty-four days involve 3+ hours behind the wheel. The outliers:

| day | hours | leg |
|---|---|---|
| 346 | **5.5h** Fredericksburg → Big Bend | Texas |
| 417 | **5.5h** Tucson → San Diego | Southwest → California |
| 408 | **5.0h** Las Vegas → Phoenix | Southwest |
| 204 | **5.0h** Atlanta → St. Augustine | Coastal SE → FL |
| 385 | **4.5h** Jerome → Zion | Southwest |
| 237 | **4.5h** Key West → Naples | Florida |

Day 346 is authored with Marfa as a stop along the way and Marfa returns as a
real stop on day 349, so nothing is lost — but 5.5 hours is the longest single
hop in the trip. Worth deciding whether the Trans-Pecos crossing deserves an
overnight (Fort Stockton or Alpine) rather than one long push.

The Southwest adds three more. **Day 408, Las Vegas → Phoenix at 5 hours, is the
one I'd question** — the route goes Utah → Great Basin → Vegas → *back southeast*
to Phoenix → Bisbee → Tucson → San Diego. Phoenix and Tucson sit below Vegas on
the way to nothing; the leg backtracks to reach them. An alternative running
Phoenix/Tucson *before* going north to Utah would cut a long desert leg, but it
would renumber a lot of days, so it's a question for later, not a defect now.

### Death Valley is in the wrong leg

The clearest routing win I've seen so far. The trip currently reaches it via
**Santa Barbara → Death Valley (5h east, day 432) → Sequoia (4.5h west, day
434)** — 9.5 hours of driving, out and back, to visit a park that the trip
already drove within **two hours of when it was in Las Vegas on days 404–408.**

Moving Death Valley into the Las Vegas stretch would save most of that and let
California run cleanly up the coast: San Diego → Palm Springs → LA → Santa
Barbara → Sequoia → Yosemite → Monterey. It costs a renumber of the Southwest's
tail and California's head, which is why it's recorded rather than done — but of
everything in this file, this is the one I'd actually change.

## 5. Categories with no content yet

- **`skiing`** — still empty at 417 days, and **Park City just went by tagged as
  `cities`**. That was the natural home for it — a 2002 Olympic town with
  world-class resorts. The Rockies legs may cover it, but this was the miss.
- **`festivals`** — used in the Deep South (Mardi Gras, Mobile Carnival) but
  absent from Mid-Atlantic, Texas and the Southwest. Balloon Fiesta is mentioned
  in an Albuquerque blurb rather than being its own item.
- **`quirky`** — much better after the Southwest (Roswell, Meow Wolf, Jerome,
  Four Corners, Fremont Street, Tombstone). No longer a concern.
- **`commuting` / `free-rest`** — these can never be authored; the renderer
  assigns them to drive and rest blocks. The audit reporting them as "unused" is
  a false positive. **Suggestion:** teach `scripts/dev/audit.ts` to exclude them.

### `capitols` is being under-used

The Desert Southwest visits **three state capitals — Santa Fe, Salt Lake City,
and Phoenix — and has zero `capitols` items.** Santa Fe's plaza is tagged
`cities`, Utah's capitol is folded into a `landmarks` item with Temple Square,
and Arizona's capitol doesn't appear at all. Compare Texas, which gave the Texas
Capitol its own anchor.

This matters more than a tag: 48 capitals is one of the trip's implicit
completeness claims, and a "show me every capitol" filter would silently miss
these. **Suggestion:** when a leg passes through a capital, give the statehouse
its own `capitols` item even if it shares the day.

## 6. UI gaps

- **There is no category legend anywhere on the site.** `categoryUsage()` in
  `src/lib/derive.ts` computes exactly what one needs (categories in scope, with
  counts) and nothing renders it. The home page lists all 18 with counts, but a
  legend on region/day pages — ideally doubling as a filter — is called out as
  valuable in the brief and doesn't exist.
- **`mid` and `low` tiers are visually identical.** Only `anchor` gets a
  treatment (accent gradient, darker title, badge). So "quirky bonus, only if
  it's happening while you're here" reads the same as "do most of these." The
  brief asks for all three tiers to be surfaced. **Suggestion:** let `low`
  recede rather than making `mid` louder.
- **The national map can only plot written legs.** `content/plan.json` carries
  the 250-stop id contract but no coordinates, so the eight unwritten legs can't
  be drawn. Adding `location` to plan entries would let the home page show the
  *whole* intended loop with the written part highlighted — a much stronger
  picture of the product. It's a real content decision though (250 coordinates),
  not a code change, so it's parked here rather than done.

## 7. Small consistency items

- **Item id prefixes don't always match their stop id** — `dfw-*` under
  `dallas-fort-worth`, `okc-*` under `oklahoma-city`, `corpus-*` under
  `corpus-christi-padre-island`, `big-bend-*` under `big-bend-np-marfa`. Ids are
  only required to be stable and unique trip-wide, so nothing is broken, and
  renaming them later would break the very stability the ids exist to provide.
  **Recommendation: leave them alone.** Noted only so it isn't "fixed" someday.
- **Authored route order differs from the manifest in several legs.** Handled by
  re-sorting `plan.json` to the authored order once a leg completes (done for
  Coastal Southeast, Florida, Deep South, Texas). Worth continuing as each leg
  finishes rather than in a batch at the end.
- **Two legs' accents sit close on the national map** — Florida `#E0653C` and
  Texas `#B5591C` are both oranges. They're far apart geographically so it reads
  fine today, but as the West fills in it's worth re-checking that all fourteen
  are distinguishable side by side.

## 8. Ideas, not problems

- **Day 365 is a milestone the site doesn't mark.** One year on the road lands
  in Albuquerque, on a petroglyphs-and-pueblos day. Day 400 (a Salt Lake free
  day) and day 500 are coming too. A quiet marker on those day pages — "one year
  in" — would cost almost nothing and is exactly the kind of thing that makes a
  screenshot. It's also a nice trip-length reality check for a reader.
- **The national map could show progress as a percentage of the loop**, not just
  a count of legs. "417 of ~1,600 days" states the scale of the thing better
  than "7 of 14 legs," which reads as half-done when it isn't.

## 9. Where the trip stands

Written: legs 1–7 complete, plus California through Yosemite — days 1–442.
Remaining: the rest of California, Pacific Northwest, Northern Rockies, Colorado
Rockies, Great Plains, Upper Midwest & Great Lakes, Appalachia Return — 108 of
250 stops.

Capitals: **30 of 48 capital cities written**, 48/48 present in the plan.
(Though see §5 — three of those capitals have no `capitols` item.)
