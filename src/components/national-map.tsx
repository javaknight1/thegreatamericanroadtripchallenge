import Link from "next/link";
import type { NationalMapData } from "@/lib/geo";
import { regionTheme } from "@/lib/region-theme";

/**
 * The whole loop on one map of the contiguous 48 — every region map merged into
 * a single projection, each leg in its own colour. States the trip reaches are
 * shaded lighter than those it doesn't; now that the loop is complete that's
 * every one of them, which is the point.
 *
 * There are no stop names here: at this scale 250 pins can't be labelled without
 * turning to mush, so each leg wears one number and the legend under the map
 * does the naming. Counts deliberately aren't repeated — the route list on the
 * home page carries those. Numbers and legend rows are links, so the map still
 * navigates with JavaScript off.
 */
export function NationalMap({ map }: { map: NationalMapData }) {
  const theme = regionTheme("");

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <div style={{ backgroundColor: theme.water }}>
        <svg
          viewBox={`0 0 ${map.width} ${map.height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Map of the contiguous United States showing every leg of the trip written so far"
        >
          {map.states.map((state) => (
            <path
              key={state.id}
              d={state.d}
              fill={state.visited ? theme.landStroke : theme.land}
              fillOpacity={state.visited ? 0.55 : 1}
              stroke={theme.landStroke}
              strokeWidth={0.7}
            />
          ))}

          {map.legs.map((leg) => {
            const color = regionTheme(leg.id).accent;
            return (
              <g key={leg.id}>
                <path
                  d={leg.routeD}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.9}
                />
                {leg.stops.map((stop) => (
                  <circle
                    key={stop.id}
                    cx={stop.x}
                    cy={stop.y}
                    r={3.2}
                    fill={color}
                    stroke={theme.water}
                    strokeWidth={1}
                  />
                ))}
              </g>
            );
          })}

          {/* Badges last so a leg's number is never buried under the next leg's line. */}
          {map.legs.map((leg) => {
            const color = regionTheme(leg.id).accent;
            if (!leg.badge) return null;
            return (
              <Link
                key={leg.id}
                href={`/region/${leg.id}/`}
                aria-label={`Leg ${leg.order} — ${leg.name}`}
              >
                <circle
                  cx={leg.badge.x}
                  cy={leg.badge.y}
                  r={10}
                  fill={color}
                  stroke={theme.water}
                  strokeWidth={2.5}
                />
                <text
                  x={leg.badge.x}
                  y={leg.badge.y + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                >
                  {leg.order}
                </text>
              </Link>
            );
          })}
        </svg>
      </div>

      {/* min-w-0 on the grid items: a grid child defaults to min-width:auto, so
          a long leg name ("The Upper Midwest & Great Lakes") pushes the track
          wider than the phone instead of truncating, and takes the whole
          document with it. */}
      <ul className="grid gap-x-5 gap-y-1.5 border-t border-hairline p-4 sm:grid-cols-2">
        {map.legs.map((leg) => (
            <li key={leg.id} className="min-w-0">
              <Link
                href={`/region/${leg.id}/`}
                className="flex items-baseline gap-2.5 py-0.5"
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 translate-y-px rounded-full"
                  style={{ backgroundColor: regionTheme(leg.id).accent }}
                />
                <span className="font-mono text-[10px] text-muted">
                  {leg.order}
                </span>
                <span className="min-w-0 flex-1 truncate font-cond text-[15px] font-bold tracking-wide uppercase">
                  {leg.name}
                </span>
              </Link>
            </li>
        ))}
      </ul>
    </div>
  );
}
