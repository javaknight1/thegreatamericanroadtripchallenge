# Great American Road Trip Challenge — Content Schema (v1)

**Purpose:** the data contract the view-only site renders against. Content lives as **JSON** (no runtime AI, no database needed for MVP — just curated JSON files the frontend reads). Days are **numbered, not dated**. Active days are broken into **hour-by-hour blocks**; free and commute days stay deliberately light.

No progress/completion fields by design — that gets added later alongside the trip generator.

---

## Hierarchy

```
trip  (header + mission + categories)
└─ region        e.g. "The Northeast" (season, order, summary)
   └─ stop       e.g. "Boston" (city/area — lodging, food, days)
      └─ day     numbered; type = active | free | commute
         └─ block        (active days only) a time slot holding one item
            └─ item      the actual thing to do (category, tier, blurb, map link, gear)
```

---

## Categories (color-coded)

18 buckets. Each item references one `categoryId`. **Hex values below are a starting point — they'll need a design pass to be sure all 18 read as visually distinct.**

| id | label | color |
|---|---|---|
| `commuting` | Commuting & Travel | `#64748B` |
| `national-parks` | National Parks & Forests | `#2E7D32` |
| `cities` | Cities & Metros | `#3949AB` |
| `capitols` | State Capitols | `#5E35B1` |
| `landmarks` | Landmarks & Monuments | `#F9A825` |
| `museums-history` | Museums & History | `#6D4C41` |
| `somber-sites` | Somber & Civil-Rights Sites | `#455A64` |
| `theme-parks` | Theme Parks & Attractions | `#D81B60` |
| `skiing` | Skiing & Winter Sports | `#039BE5` |
| `outdoor-water` | Outdoor & Water Activities | `#00897B` |
| `concerts-venues` | Concerts & Venues | `#8E24AA` |
| `festivals` | Festivals & Events | `#FB8C00` |
| `sports` | Sports & Gamedays | `#E53935` |
| `food-drink` | Food & Drink Trails | `#C0CA33` |
| `guided-tours` | Guided Tours | `#00ACC1` |
| `quirky` | Quirky Americana & Roadside Oddities | `#F4511E` |
| `shopping` | Shopping | `#EC407A` |
| `free-rest` | Free / Rest Days | `#B0BEC5` |

---

## Field reference

**trip**
- `id`, `title`, `tagline`, `mission` (strings)
- `durationEstimate` — human string, e.g. `"~4.5 years"`
- `recommendedStart` — where/when to begin the loop
- `categories[]` — the table above
- `regions[]`

**region**
- `id`, `name`, `order` (1 = first in the loop)
- `season`, `seasonNote` — the hard weather/season logic for this leg
- `summary`
- `stops[]`

**stop** (a city or area)
- `id`, `name`, `state`, `country` (default `"US"` — set `"CA"` for Canada detours)
- `order` (position within the region)
- `location` — `{ lat, lng }` (map centering)
- `summary`
- `seasonalTip` *(optional)* — soft event note, e.g. *"Arrive late Sept to catch a Red Sox game."*
- `lodging[]` — `{ name, blurb, mapLink }` (prioritize unique/culturally-relevant places)
- `foodMustTry[]` — `{ name, blurb }` (the "you gotta get X here" list)
- `days[]`

**day**
- `dayNumber` — global running count across the whole trip
- `label` — short title, e.g. `"Day 1 — Freedom Trail & Fenway"`
- `type` — `"active"` | `"free"` | `"commute"`
- `summary`
- `blocks[]` — **active days only**
- `freeMenu[]` — **free days only**: a menu of optional items to pick from
- `commute` — **commute days only** (object, below)

**block** (active day time slot)
- `start`, `end` — clock times as strings (`"9:00 AM"`, `"12:00 PM"`), OR
- `slot` — a looser label (`"Morning"` / `"Afternoon"` / `"Evening"`) when exact times don't matter
- `item`

`end` is optional in practice: the site computes it from `start + item.durationMins`
when it isn't authored, and places a `slot`-only block after the one before it, so
every event displays a start and an end time either way.

**item** (the actual activity — also used inside `freeMenu`)
- `id` — stable, unique (survives reorders; ready for future completion-tracking)
- `title`
- `categoryId` — one of the 18
- `tier` — `"anchor"` (always do) | `"mid"` (do most) | `"low"` (quirky bonus)
- `durationMins`
- `location` — `{ name, address, lat, lng, mapLink }`
- `blurb` — what it is + why it matters (plain text; light markdown ok)
- `gear[]` *(optional)* — equipment this needs (skis, camping gear…). The site derives the **master packing list** by aggregating every `gear[]` — no separate storage.

**commute** (commute day)
- `from`, `to`
- `driveTimeMins`
- `scenicNote` *(optional)*
- `stopsAlongWay[]` *(optional)* — `{ title, blurb, mapLink }`

---

## Annotated example

One region stub showing all three day types. (Content here is illustrative — the full Northeast chapter is the next deliverable.)

```json
{
  "trip": {
    "id": "great-american-road-trip",
    "title": "The Great American Road Trip Challenge",
    "tagline": "See all of America — the definitive road trip, mapped hour by hour.",
    "mission": "To map the single most complete road trip across the United States...",
    "durationEstimate": "~4.5 years",
    "recommendedStart": "Late September, beginning in Boston for peak fall foliage heading north.",
    "categories": [
      { "id": "national-parks", "label": "National Parks & Forests", "color": "#2E7D32" },
      { "id": "museums-history", "label": "Museums & History", "color": "#6D4C41" },
      { "id": "sports", "label": "Sports & Gamedays", "color": "#E53935" },
      { "id": "food-drink", "label": "Food & Drink Trails", "color": "#C0CA33" }
    ],
    "regions": [
      {
        "id": "northeast",
        "name": "The Northeast",
        "order": 1,
        "season": "Fall",
        "seasonNote": "Open late September in Boston to catch a Red Sox game, then head north as the foliage peaks in early October.",
        "summary": "Autumn colors from coastal Maine down to the capital.",
        "stops": [
          {
            "id": "boston",
            "name": "Boston",
            "state": "MA",
            "country": "US",
            "order": 1,
            "location": { "lat": 42.3601, "lng": -71.0589 },
            "summary": "The trip's opening act — colonial history, a ballgame, and chowder.",
            "seasonalTip": "Arrive late September for a Red Sox game before the season ends.",
            "lodging": [
              { "name": "The Omni Parker House", "blurb": "Oldest continuously operating hotel in the U.S.; birthplace of the Boston cream pie.", "mapLink": "https://maps.google.com/?q=Omni+Parker+House+Boston" }
            ],
            "foodMustTry": [
              { "name": "Clam chowder at Union Oyster House", "blurb": "America's oldest restaurant; the New England classic done right." }
            ],
            "days": [
              {
                "dayNumber": 1,
                "label": "Day 1 — Freedom Trail & Fenway",
                "type": "active",
                "summary": "History by day, a ballgame by night.",
                "blocks": [
                  {
                    "start": "9:00 AM",
                    "end": "12:00 PM",
                    "item": {
                      "id": "boston-freedom-trail",
                      "title": "Walk the Freedom Trail",
                      "categoryId": "museums-history",
                      "tier": "anchor",
                      "durationMins": 180,
                      "location": { "name": "Boston Common (start)", "address": "139 Tremont St, Boston, MA", "lat": 42.3554, "lng": -71.0655, "mapLink": "https://maps.google.com/?q=Freedom+Trail+Boston+Common" },
                      "blurb": "A 2.5-mile line through 16 colonial-era sites — the essential Boston primer.",
                      "gear": ["comfortable walking shoes"]
                    }
                  },
                  {
                    "start": "7:10 PM",
                    "end": "10:00 PM",
                    "item": {
                      "id": "boston-fenway-redsox",
                      "title": "Red Sox game at Fenway Park",
                      "categoryId": "sports",
                      "tier": "anchor",
                      "durationMins": 170,
                      "location": { "name": "Fenway Park", "address": "4 Jersey St, Boston, MA", "lat": 42.3467, "lng": -71.0972, "mapLink": "https://maps.google.com/?q=Fenway+Park" },
                      "blurb": "The oldest ballpark in the majors — catch the season before it closes in early October."
                    }
                  }
                ]
              },
              {
                "dayNumber": 3,
                "label": "Day 3 — Free Day",
                "type": "free",
                "summary": "Breathe. Sleep in, wander, catch up on life.",
                "freeMenu": [
                  {
                    "id": "boston-sam-adams-tour",
                    "title": "Samuel Adams Brewery tour",
                    "categoryId": "food-drink",
                    "tier": "low",
                    "durationMins": 90,
                    "location": { "name": "Samuel Adams Boston Brewery", "address": "30 Germania St, Boston, MA", "lat": 42.3115, "lng": -71.1043, "mapLink": "https://maps.google.com/?q=Samuel+Adams+Boston+Brewery" },
                    "blurb": "If you feel like it — a low-key tasting in Jamaica Plain."
                  }
                ]
              },
              {
                "dayNumber": 4,
                "label": "Day 4 — Drive to Portland, Maine",
                "type": "commute",
                "summary": "Short coastal hop north.",
                "commute": {
                  "from": "Boston, MA",
                  "to": "Portland, ME",
                  "driveTimeMins": 115,
                  "scenicNote": "Coastal Route 1 detour adds time but trades the highway for lighthouses.",
                  "stopsAlongWay": [
                    { "title": "Nubble Lighthouse, York", "blurb": "One of the most photographed lighthouses in the country.", "mapLink": "https://maps.google.com/?q=Nubble+Lighthouse" }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Notes

- **Master packing list** is computed, not authored — aggregate every `item.gear[]` across the trip (and per region).
- **Canada detours** are just stops with `country: "CA"`.
- **Soft seasonal events** (parades, single-peak festivals) live in `seasonalTip` or a blurb — never as hard dates, since the trip is undated.
- **Free and drive days render as timeline blocks too** — the site synthesises a `free-rest` "rest" block for a free day and a `commuting` block for the drive, so those two categories are used by the renderer even though no authored item can carry them. A free day's `freeMenu` and a drive day's `stopsAlongWay` appear *below* the timeline, as explicitly optional.
- **No progress/completion fields** in v1 — `item.id` is already stable, so tracking can be layered on later without a schema break.

---

## How the schema is stored on disk

The document above describes one logical tree. On disk it is **split into files** so the dataset stays hand-editable as it grows:

```
content/
  trip.json                                trip header + categories (no regions inline)
  plan.json                                the manifest: every region and stop id, with planned day counts
  regions/<regionId>/region.json           region metadata (no stops inline)
  regions/<regionId>/stops/<stopId>.json   one stop, with its full days[]
```

`src/lib/content.ts` reassembles these into the exact tree shown above at build time. The JSON field names are unchanged — only the nesting is split across files.

Rules the loader enforces (`npm run validate`):

- every `item.categoryId` exists in `content/trip.json`
- every `item.id` is unique across the whole trip
- every `dayNumber` is unique across the whole trip
- `active` days have `blocks[]`, `commute` days have `commute`, `free` days have neither
- region `order` and stop `order` (within a region) are unique

---

## `plan.json` (the id contract)

Separate from the itinerary above, and not part of the `trip → day` tree. It lists
every leg and every stop the loop will visit, in order, with a planning-only day
count:

```json
{
  "regions": [
    {
      "id": "florida",
      "stops": [
        { "id": "orlando", "order": 5, "name": "Orlando", "state": "FL", "plannedDays": 10 }
      ]
    }
  ]
}
```

- A stop's `id` here is the filename it must use when its days are authored.
- `plannedDays` is an estimate for the overview screens only. Real day numbers are
  authored inside each `day` object and stay contiguous trip-wide.
- Legs with no authored stops render their planned route from this file, so the
  whole loop is browsable long before it is written.
