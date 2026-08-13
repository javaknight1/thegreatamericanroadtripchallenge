# NOTES.md — open observations and suggestions

A running record of things I've noticed while writing content and building the
site. **Nothing here has been acted on.** The baseline stands as authored; this
is the list to work from once the loop is fully written.

Rob's standing instruction: add suggestions here as they come up, without asking
first. Items are only removed when they're resolved or explicitly dropped.

Last updated at **252 stops · 735 days · 800 items · all 48 states** — the
itinerary is **complete**. All fourteen legs, days 1 through 735 contiguous with
no gaps, 48/48 states and 48/48 capital cities, ending where it began in Boston.
`validate` reports no warnings.

Everything below is the backlog: things worth improving now that the baseline
exists.

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
| California | 4 / 51 (8%) | 12 days, through day 440 |
| Pacific Northwest | 2 / 48 (4%) | **23 days**, through day 503 |
| Northern Rockies | 2 / 38 (5%) | 14 days, through day 530 |
| Colorado Rockies | 2 / 30 (7%) | 19 days, through day 584 |
| Great Plains | 1 / 37 (3%) | **31 days**, through day 621 |

**The Great Plains is now the worst leg in the trip on both measures** — a single
free day in 37 (3%), and a 31-day run from day 591 all the way to the leg's end
at 621. Every stop from Deadwood to Topeka is 1–4 days with no breather, and
several are long prairie transfers. The Deep South's 30-day run (days 256–285)
is now second.

That Deep South stretch is still the one I'd fix first, because of what it
covers — Whitney Plantation, Birmingham, the Legacy Museum, the Pettus Bridge,
the National Civil Rights Museum, back to back with no room to absorb any of it.
The Plains run is longer but much lighter going.

**Suggestion:** now that rest is a block rather than a whole-day type, the cheap
fix is a half-day rest event inside an existing day rather than adding days. A
rest block in one of the Delta days and one mid-Mid-Atlantic would break both
long runs without changing any day numbers.

Also flagged by the audit — 4+ day stops with no breather anywhere in them:
Portland, Montpelier & Stowe, The Hudson Valley, Baltimore, Williamsburg &
Virginia Beach, Tampa & St. Petersburg, Memphis, Big Bend & Marfa, Santa Fe &
Taos, Olympic NP, North Cascades & Vancouver. Big Bend is arguably correct (the
days *are* the point); the cities less so.

**The Pacific Northwest is now the worst leg for this** — 2 free days in 48 (4%),
tying the Deep South for the lowest rate, with a 23-day run from day 481 to 503.
That stretch covers Salem, the Oregon Coast, Astoria, St. Helens, Rainier,
Olympia, three days of Olympic, and four of Seattle. It's also physically hard:
Paradise, the Hoh, Hurricane Ridge and Ruby Beach are consecutive hiking days
with a ferry crossing in the middle.

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
- **Los Angeles — 5 of 8 days.** Now the second-biggest shortfall.
- **San Francisco — 5 of 7 days.**
- **San Diego — 4 of 5 days.**
- **Dallas & Fort Worth — 4 of 5 days.**
- **Austin — 5 of 6 days.**

California accounts for three of the seven. The state came in at 51 days against
a planned 58 — the single largest gap in any leg so far. Worth deciding whether
that's deliberate compression or worth filling; LA in particular loses three
days, and Universal, Disneyland and the Getty are already competing for room.

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
- **Reno and South Lake Tahoe were named but never visited — DONE.** The stop is
  titled "Lake Tahoe, Reno & Carson City" and promised "Reno's neon," but no item
  went there; Reno survived only as a trailing clause in the Carson City blurb.
  South Lake Tahoe was thinner still — a lodging suggestion and Emerald Bay's
  mailing address.

  Both now have real time, and it cost no days. Day 458 adds the **Heavenly
  Gondola** out of the middle of South Lake Tahoe, 9,100 ft above the lake (and
  the trip's second `skiing` item). Day 459 is re-cut as Carson City → Virginia
  City → **Reno**, with the **National Automobile Museum** and the **Reno Arch and
  Truckee Riverwalk** after dark. The stop summary and the day label now describe
  what the days actually contain.

## 4. Long drives worth a second look

Twenty-four days involve 3+ hours behind the wheel. The outliers:

| day | hours | leg |
|---|---|---|
| 346 | **5.5h** Fredericksburg → Big Bend | Texas |
| 419 | **5.5h** Tucson → San Diego | Southwest → California |
| 518 | **5.3h** Coeur d'Alene → McCall | Northern Rockies |
| 584 | **5.0h** Breckenridge → Scottsbluff | Colorado → Great Plains |
| 403 | **5.0h** Great Basin → Death Valley | Southwest |
| 410 | **5.0h** Las Vegas → Phoenix | Southwest |
| 204 | **5.0h** Atlanta → St. Augustine | Coastal SE → FL |
| 385 | **4.5h** Jerome → Zion | Southwest |
| 237 | **4.5h** Key West → Naples | Florida |

**Day 518's seven-hour haul is fixed — DONE.** It used to run the whole length of
Idaho, Coeur d'Alene to Boise on US-95, with nothing authored along the way. It
now stops at **McCall**, a mountain town on Payette Lake at roughly the two-thirds
mark: 5h20 in, an afternoon on the lake, then a morning in Ponderosa State Park
and two hours down the Payette River canyon into Boise. Lewiston's confluence, the
White Bird grade and Riggins are authored as stops along the way.

It cost no days. Boise now drives itself to Craters of the Moon on the afternoon of
its second day instead of spending a whole day on a 2h30 transfer, which paid for
McCall — 735 days in, 735 days out, and no day after 521 moved. **The longest
drive in the trip is now 5.5h**, and there are two of them.

That change is also what surfaced a real bug: `tripStats.driveTimeMins` summed
only day-level `commute` objects and ignored block-level `drive`s, so any drive
authored as a block — the only way to put a drive *after* something else in a day
— was invisible to the "Behind the wheel" figure. Fixed in `derive.ts`.

Day 346 is authored with Marfa as a stop along the way and Marfa returns as a
real stop on day 349, so nothing is lost — but it's worth deciding whether the
Trans-Pecos crossing deserves an overnight (Fort Stockton or Alpine) rather than
one long push.

The Southwest adds three more. **Day 410, Las Vegas → Phoenix at 5 hours, is the
one I'd question** — the route goes Utah → Great Basin → Death Valley → Vegas →
*back southeast* to Phoenix → Bisbee → Tucson → San Diego. Phoenix and Tucson sit
below Vegas on the way to nothing; the leg backtracks to reach them. An
alternative running Phoenix/Tucson *before* going north to Utah would cut a long
desert leg, but it would renumber a lot of days, so it's a question for later,
not a defect now.

Day 403's new 5-hour Great Basin → Death Valley run is the cost of the Death
Valley move, and it's a good trade: it replaces a 4-hour drive to Vegas and
retires two much worse ones. It's also the most characterful empty-desert drive
in the trip, with Goldfield and Rhyolite authored as stops along the way.

### Death Valley was in the wrong leg — **DONE**

It used to be reached via Santa Barbara → Death Valley (5h east) → Sequoia (4.5h
west), an out-and-back to a park the trip had already driven within two hours of
at Las Vegas.

It now sits in the Desert Southwest between Great Basin and Las Vegas, on days
404–405. Great Basin drives west across US-6/US-95 through Goldfield and Rhyolite
(5h), and Death Valley is two hours from the Strip. California starts at San
Diego and runs up the coast without doubling back once: San Diego → Joshua Tree →
LA → Santa Barbara → Sequoia → Yosemite → Monterey.

The block of days 404–434 was reordered rather than lengthened, so it is the same
31 days and **nothing from day 435 to 735 moved.** Net driving is 2h20 lower, and
Death Valley is now visited in the Southwest's spring rather than California's
"late spring to summer," which is the season it actually wants. Both region
`seasonNote`s and `summary`s were updated, and `plan.json` was re-sorted to the
authored order for both legs (the Southwest had never been re-sorted).

## 5. Categories with no content yet

- **`skiing` — RESOLVED at day 475.** Timberline Lodge on Mount Hood is the
  first item to carry it, so all 18 categories are now in use. Worth noting the
  two that got away, in case they're worth re-tagging for balance: Park City
  (2002 Olympics) is `cities`, and Lake Tahoe's "Kayak or ski Tahoe" free-day
  option is `outdoor-water`. **Sun Valley has now gone by too** (day 524) —
  "America's original destination ski resort," with its Bald Mountain item tagged
  `outdoor-water` and skiing mentioned only in the blurb. **Jackson Hole makes
  four** — days 543–546 cover the Tetons, the Snake and the town square, with no
  mention of the ski resort at all. That's four of the country's best-known ski
  destinations passed over, and one `skiing` item across 554 days. Aspen and Vail
  in the Colorado leg are the last realistic chances.
- **`festivals`** — used in the Deep South (Mardi Gras, Mobile Carnival) but
  absent from Mid-Atlantic, Texas and the Southwest. Balloon Fiesta is mentioned
  in an Albuquerque blurb rather than being its own item.
- **`quirky`** — comfortably the trip's best-served surprise. After the Southwest
  (Roswell, Meow Wolf, Jerome, Four Corners, Fremont Street, Tombstone) the
  Plains pile on Carhenge, Wall Drug, the Corn Palace and the Fargo woodchipper.
  The "roadside oddities" promise in the mission statement is now genuinely met.
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

**California did this right** — Sacramento's capitol is its own `capitols` anchor,
and Carson City's is too. So the pattern is established; it's the three Southwest
capitals that are the outliers.

### SEO/GEO: what's done, and what still needs a human

Built (all derived from content, so it can't drift): canonical URLs, per-page
descriptions that name places rather than repeating a four-word day summary,
JSON-LD on every page type, `sitemap.xml` (924 URLs), `robots.txt` explicitly
welcoming AI crawlers, `llms.txt`, and an `<h1>` on day pages, which had none.

What I could **not** do from here, in rough order of value:

1. **No social share image.** Static export can't run Next's `ImageResponse`, so
   there is no OG image — links posted to iMessage, Slack or Instagram render as
   bare text. Given the brief says the site is a marketing showcase for
   screenshot-driven ads, this is the biggest remaining gap. Fix: generate PNGs
   at build from the existing `region-art.ts` / `day-art.ts` SVGs (a script +
   `sharp`), or commit one hand-made 1200×630 default.
2. **Google Search Console and Bing Webmaster aren't verified** — needs a DNS
   record or meta tag only Rob can add. Until then nobody knows what the site
   ranks for.
3. **No FAQ content.** Answer engines quote question-shaped text. "How long does
   it take to drive all 48 states?" / "What's the best month to start?" are
   questions this trip genuinely answers, and a short FAQ block with `FAQPage`
   JSON-LD would be quotable in a way the itinerary itself isn't.
4. **`trip.tagline` is doing double duty.** "See all of America — the definitive
   road trip, mapped hour by hour" is a fine banner and a weak `<title>`; the
   title now appends it to the site name, but a keyword-led variant
   ("48-state road trip itinerary, day by day") would compete better.

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

### The Vancouver stop is filed as US/WA

`north-cascades-np-vancouver` carries `state: "WA"`, `country: "US"`, but two of
its four days (509 and 510) are in British Columbia — Stanley Park, Granville
Island, Capilano, Grouse Mountain. The schema explicitly supports `country: "CA"`
for exactly this (the brief calls out Canada detours as ordinary stops), and the
map projects the stop from its `location`, which sits on the US side.

Nothing renders wrong today. But the state-coverage stat counts this as
Washington only, and a future "which countries does this trip enter?" question
would answer wrong. **Suggestion:** either split Vancouver into its own
`country: "CA"` stop, or leave it and accept that the Canada content is
invisible to the data model. I'd split it — the trip's international detours are
a selling point, not a footnote.

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

### `skiing` will finish the trip with one item

**Settled, unless something changes.** Aspen, Vail and Breckenridge are now
written (days 581–583) and none carries a `skiing` item — Maroon Bells is
`landmarks`, Vail Village and Breckenridge are `cities`. That completes the
sweep: Park City, Lake Tahoe, Sun Valley, Jackson Hole, Telluride, and now the
I-70 trio have all gone by tagged as something else.

The route is the reason, and it's a defensible one. The leg is timed for late
summer and fall — the season note is explicit about aspens, and the summary says
"ski towns out of season." Nowhere does this itinerary arrive at a mountain in
winter, so nothing in it honestly skis.

That leaves **one `skiing` item across 584 days** (Timberline Lodge, day 475,
which qualifies only because Mount Hood offers summer skiing). Options, in the
order I'd pick them:

1. **Add a winter-facing item anyway** at Vail or Breckenridge — the category
   describes the place, and a reader planning their own trip wants to know the
   mountain is there. Costs nothing structurally.
2. **Re-tag one existing item** — Sun Valley's Bald Mountain is the cleanest fit,
   since the blurb already says "world-class skiing in winter."
3. **Accept it.** A fall loop through the Rockies genuinely doesn't ski, and the
   home page showing `skiing: 1` is honest. But it will read as an oversight to
   anyone scanning the category list, not as an editorial choice.

### The Upper Midwest closed better than it started

Complete at 31/31 stops, days 622–703 — the largest leg in the trip. It ended
with **four free days in 82** (5%), two of them back-to-back in Chicago (days
668–669), which is the first time the itinerary has given two consecutive free
days anywhere. Given this leg follows the Great Plains' 31-day dry run, that
pairing does real work.

`plan.json` has been re-sorted to the authored route, which diverged from the
manifest more than any other leg — the manifest ran Wisconsin before Chicago and
Illinois; the authored route runs Minnesota → Wisconsin → Chicago → Illinois →
Indiana → Michigan → Ohio, which is geographically clean.

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

**The trip is written.** 14 legs · 252 stops · 735 days · 800 things to do ·
48 states · 48 capitals · 455 anchors · 48 free days · ~554 hours of driving.
Day 1 opens in Boston; day 735 drives back into it.

`plan.json` gained two stops that were authored but never planned — Rochester
and Syracuse — so the manifest now stands at 252 against its original 250.

Capitals: **48 of 48 — complete.** Madison (day 658) and Springfield (day 673)
were the last two. Every state capital city on the mission statement's list now
has a written day.

**The capitals check produced a real false positive — confirmed, now moot.**
(All 48 are now written, so the count is right by any method; the matching
weakness remains for anyone re-running the audit on a partial rewrite.)

`scripts/dev/audit.ts` matches a capital by testing whether any stop name
*contains* the city name, with no state check. **Charleston, SC** (Coastal
Southeast, not a capital) was therefore satisfying **Charleston, WV** (a
capital), and the audit reported 46/48 when the true figure was 45/48. Writing
Charleston, WV on day 710 closed the gap by accident, so the number is correct
again — but it was wrong for several legs and nothing surfaced it.

The same shape still lurks: "Mount Hood & the Columbia Gorge" satisfies
Columbia, SC, and a future "Jackson Hole" would satisfy Jackson, MS. Both are
genuinely written, so no live error today. **Suggestion:** match on stop `state`
as well as name — a two-line change that would have caught this.
(Though see §5 — three of those capitals have no `capitols` item.)
