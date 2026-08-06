import Link from "next/link";
import type { RegionMapData } from "@/lib/geo";
import type { RegionTheme } from "@/lib/region-theme";

/**
 * The region's route as a static SVG: state outlines behind, the drive between
 * stops drawn in order, one numbered pin per stop. The stop the current day
 * belongs to is enlarged and ringed.
 *
 * Pins are links to that stop's first day, so the map works with no JavaScript
 * at all — there is no client component anywhere in this view.
 */
export function RegionMap({
  map,
  theme,
  regionId,
  colors,
  activeStopId,
}: {
  map: RegionMapData;
  theme: RegionTheme;
  regionId: string;
  colors: Record<string, string>;
  activeStopId?: string;
}) {
  // Past a dozen stops the labels collide no matter how they're placed, so a
  // busy leg shows names only for the stop you're on. The numbers and the stop
  // list below carry the rest.
  const labelEveryStop = map.stops.length <= 11;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: theme.landStroke, backgroundColor: theme.water }}
    >
      <svg
        viewBox={`0 0 ${map.width} ${map.height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Map of this region's stops, in driving order"
      >
        {map.states.map((state) => (
          <path
            key={state.id}
            d={state.d}
            fill={theme.land}
            stroke={theme.landStroke}
            strokeWidth={0.8}
          />
        ))}

        <path
          d={map.routeD}
          fill="none"
          stroke={theme.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="7 5"
        />

        {map.stops.map((stop) => {
          const color = colors[stop.id] ?? theme.accent;
          const active = stop.id === activeStopId;
          const labelY = stop.labelSide === "above" ? stop.y - 15 : stop.y + 22;

          const pin = (
            <>
              {active && (
                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r={16}
                  fill={color}
                  opacity={0.25}
                />
              )}
              <circle
                cx={stop.x}
                cy={stop.y}
                r={active ? 10 : 7}
                fill={color}
                stroke={active ? theme.surface : theme.water}
                strokeWidth={active ? 3 : 2}
              />
              <text
                x={stop.x}
                y={stop.y + 3.5}
                textAnchor="middle"
                fill="#fff"
                fontSize={active ? 11 : 9}
                fontWeight={700}
                fontFamily="var(--font-mono)"
              >
                {stop.order}
              </text>
              {(labelEveryStop || active) && (
                <text
                  x={stop.x}
                  y={labelY}
                  textAnchor="middle"
                  fill={active ? theme.surface : "#9aa2ad"}
                  stroke={theme.water}
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontSize={13}
                  fontWeight={active ? 700 : 500}
                  fontFamily="var(--font-cond)"
                  letterSpacing="0.03em"
                >
                  {stop.name.toUpperCase()}
                </text>
              )}
            </>
          );

          return stop.firstDay ? (
            <Link
              key={stop.id}
              href={`/region/${regionId}/day/${stop.firstDay}/`}
              aria-label={`${stop.name}, ${stop.state}${stop.dayRange ? ` — ${stop.dayRange}` : ""}`}
            >
              {pin}
            </Link>
          ) : (
            <g key={stop.id} aria-label={`${stop.name}, ${stop.state}`}>
              {pin}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
