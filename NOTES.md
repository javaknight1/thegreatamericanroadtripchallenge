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

### Home-page stats — audited and brought current

Every figure on the home page is derived, so nothing had gone *stale*; what had
gone missing was the new material. Now:

- **A national-parks tile: 48.** `src/lib/national-parks.ts` matches the content
  against the NPS list of the 51 parks in the contiguous 48. This is the one
  number on the site that needs an external fact, so the list is isolated in its
  own file with the reasoning written down — but the *count* still derives from
  the itinerary, so it can under-report and cannot over-report. The three it
  misses (**Biscayne, Channel Islands, Isle Royale**) are all boat-access-only,
  which is a better line than the number.
  - A loose substring match returned 49 and was wrong: Miami's *Biscayne
    Boulevard* and *Biscayne Bay* were satisfying Biscayne National Park. The
    matcher now requires either "<Park> National Park" or a stop named for it.
- **A `pacing()` derivation**, so the rest-block work is visible: 41 days that
  stop early alongside the 48 free days, and "never more than 13 days from one of
  those 89 breathers" — the worst case rather than an average, which is the only
  honest way to claim a trip is unrushed.
- **The Canada crossing is stated** rather than being invisible.
- **Free days moved off the tiles** into the pacing block, where the four day
  types are explained together and it isn't double-counted.
- The trip JSON-LD and `llms.txt` carry the same figures, and `tripDescription`
  no longer says "mapped so far" — the itinerary is finished.

---

## 1. Free days were thin and clustered badly — **FIXED**

Measured properly this was worse than the per-leg percentages suggested, because
the runs cross leg boundaries. Counting any day with neither a free day nor an
hour off in it, the trip contained **twenty runs of 14 days or longer**, the
worst being **52 consecutive days** from day 591 to 642 — the Great Plains
straight through into the Upper Midwest with no let-up anywhere.

The fix, as suggested, was a rest **block** inside a day that already exists
rather than a new day: **39 of them**, so no day number moved and no content was
lost. Each is placed at the end of a day that could absorb it, in a place worth
staying in, and each is written to that place rather than being a generic
"day off".

| | before | after |
|---|---|---|
| Breathers in 735 days | 48 | **89** (48 free days + 41 days with a rest block) |
| Longest run with none | **52 days** | **13 days** |
| Runs of 14+ days | 20 | **0** |
| Mean gap between breathers | 15.3 days | **8.3 days** |

Per leg, longest run with no breather: New England 13 · Mid-Atlantic 9 · Coastal
Southeast 12 · Florida 9 · Deep South 12 · Texas 11 · Southwest 11 · California
10 · Pacific NW 12 · Northern Rockies 12 · Colorado 6 · Great Plains 8 · Upper
Midwest 12 · Appalachia 9.

The two the notes singled out both got what they asked for:

- **The Deep South civil-rights stretch.** Day 280 now ends at Selma with the rest
  of the day deliberately empty — the Legacy Museum, the National Memorial for
  Peace and Justice, Montgomery and the Edmund Pettus Bridge come four days
  running, and nothing is scheduled after the bridge.
- **Before the Grand Canyon descent, not after it.** Day 356 takes the afternoon
  at White Sands and stays for sunset, which breaks the run leading into the rim.

**Day 365 also became a marker.** One year on the road lands in Albuquerque, and
the rest block there says so — which quietly resolves half of §8's milestone idea
at no cost.

Two things this surfaced in the renderer, both fixed in `schedule.ts`:

1. An open-ended event returned `"All day"` whenever it had no start, duration or
   end — correct for a whole free day, wrong for an evening that follows a full
   day of items, which is what every one of these rest blocks is. It now says
   `"All day"` only when nothing precedes it, and `"from 6:00 PM"` otherwise.
2. A `slot` label used to be ignored whenever a previous block had set the
   cursor, so `"Evening"` resolved to half past three if the afternoon finished
   early. A slot now takes the *later* of the cursor and what the label implies,
   so it can never contradict its own name or overlap what came before it.

Still true, and left alone deliberately — some 4+ day stops have no breather
inside them (Memphis, Big Bend & Marfa, Santa Fe & Taos, Olympic NP). Big Bend is
arguably correct: the days *are* the point. The rest are close enough to a
breather on either side that adding one inside would have cost content for
nothing.

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

- **New York City: Grand Central Terminal and Coney Island — DONE.** Both were
  obvious omissions for a trip whose pitch is "nothing left for a first time."
  Grand Central closes day 72, two blocks east of the library the day already
  ended at, timed for the evening rush under the ceiling. Coney Island closes day
  77's Brooklyn run — the Cyclone, the Wonder Wheel, Nathan's and the boardwalk at
  dusk, and it makes `theme-parks` a New York category. Both went into afternoons
  that were already open, so NYC is still 15 days.
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

- **`skiing` — FIXED. One item became fifteen.** See the section at the end of
  this file for what was wrong and how it was resolved.
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

### The Vancouver stop was filed as US/WA — **DONE**

`north-cascades-np-vancouver` carried `state: "WA"`, `country: "US"` while two of
its four days were in British Columbia, so the only international content in the
trip was invisible to the data model.

It's now two stops: **`vancouver-bc`** (`state: "BC"`, `country: "CA"`, days
509–510) and **`north-cascades-np`** (WA, days 511–512). Day 510 now ends with the
border crossing authored as a real drive, with the Peace Arch as a stop along the
way, instead of the crossing appearing as a throwaway clause in the next day's
blurb. No day numbers moved; the trip is 254 stops.

That split exposed a live counting bug, now fixed. Every "States" figure on the
site was `new Set(stops.map(s => s.state)).length`, with the home page subtracting
DC by hand — so **British Columbia would have rendered as a 49th state** on the
home page, the region pages, the meta descriptions, the JSON-LD and `llms.txt`.
`derive.ts` now exposes `usStates` (US only, DC excluded) for anything that
reports a *number*, and keeps `states` for anything that *lists* where the trip
goes, so the Pacific Northwest page reads "OR, WA, BC" and the counter still reads
48. Worth remembering for the Europe/Japan expansion in the brief: that was the
first stop that wasn't a US state, and five separate places assumed there'd never
be one.

Checked the rest of the content for the same shape: Duluth and Voyageurs mention
the Canadian border but stay on the US side of it, and Niagara is authored
entirely from the American side (Maid of the Mist, Cave of the Winds). Vancouver
was the only case.

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

### `skiing` finished the trip with one item — **FIXED, now fifteen**

The problem: Park City, Lake Tahoe, Sun Valley, Jackson Hole, Telluride, Aspen,
Vail and Breckenridge had all gone by tagged as something else, leaving one
`skiing` item across 735 days — Timberline Lodge, which only qualified because
Mount Hood skis in summer.

The route was the reason and it's still true: this itinerary never arrives at a
mountain in winter, so **nothing in it honestly skis**, and inventing a winter
day would have been a lie. What it does do is drive through eight of the
best-known ski destinations in the country, every one of which has a summer face
that is unmistakably about skiing. Those are what got written:

| leg | day | item |
|---|---|---|
| New England | 41 | The New England Ski Museum, at the foot of the Cannon tram |
| New England | 48 | The Vermont Ski and Snowboard Museum, Stowe |
| Mid-Atlantic | — | *nothing suitable on the route* |
| Desert Southwest | 362 | **Taos Ski Valley** |
| Desert Southwest | 399 | **Utah Olympic Park & the Alf Engen Ski Museum** |
| California | 458 | **The Heavenly Gondola**, South Lake Tahoe |
| Pacific NW | 475 | Timberline Lodge *(the original)* |
| Northern Rockies | 524 | **Bald Mountain** *(re-tagged)* + the world's first chairlift |
| Northern Rockies | 536 | **The Lone Peak Tram at Big Sky** |
| Northern Rockies | 545 | **The Aerial Tram at Jackson Hole** |
| Colorado | 575 | The gondola to Mountain Village, Telluride |
| Colorado | 581 | **The Silver Queen Gondola up Aspen Mountain** |
| Colorado | 582 | The Colorado Snowsports Museum + **Gondola One & the Back Bowls** |
| Colorado | 583 | Peak 8 & the BreckConnect Gondola |

Three of these are more than a tag fix:

- **Taos Ski Valley is the one place on the loop the trip reaches in season.** The
  Southwest leg runs in spring and the Valley stays open into April, so day 362 is
  the only day on this itinerary where the lifts might actually be turning.
- **Day 536 was a 90-minute transfer and nothing else**, on a road that runs
  straight past the largest ski resort in the United States. It's now Bozeman →
  Big Sky → the west gate of Yellowstone, with the Lone Peak Tram in the middle.
- **Park City's single 210-minute `cities` item** bundled Main Street with the
  Olympic park. Split, so the 2002 venues get their own billing.

Still worth knowing: **Bend has no Mount Bachelor item** (day 473 is genuinely
full with Smith Rock and the Ale Trail), Whitefish goes by unmentioned in the
Glacier leg, and McCall's Brundage Mountain is named in the stop summary but has
no item — day 518 arrives mid-afternoon and that time is deliberately unscheduled.

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
