import { dayArt } from "@/lib/day-art";
import { formatDuration } from "@/lib/format";
import type { Day, DayType } from "@/types/trip";

const typeLabels: Record<DayType, string> = {
  active: "Full day",
  free: "Free day",
  commute: "Drive day",
};

/**
 * The day's hero: a generated landscape keyed to what the day holds, with the
 * day number and place set over it. Server-rendered SVG — no image requests.
 */
export function DayHeader({ day, place }: { day: Day; place: string }) {
  const art = dayArt(day);
  const gradientId = `sky-${day.dayNumber}`;
  const minutes =
    day.commute?.driveTimeMins ??
    (day.blocks ?? []).reduce((total, block) => total + block.item.durationMins, 0);

  return (
    <div className="relative h-52 overflow-hidden bg-chrome sm:h-64">
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={art.sky[0]} />
            <stop offset="100%" stopColor={art.sky[1]} />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill={`url(#${gradientId})`} />
        {art.disc && <circle cx={art.disc.cx} cy={art.disc.cy} r={art.disc.r} fill={art.disc.fill} opacity="0.9" />}
        {art.layers.map((layer, index) => (
          <path key={index} d={layer.d} fill={layer.fill} />
        ))}
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/80" />

      <div className="absolute inset-x-0 bottom-0 p-4 text-canvas sm:p-6">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[9px] tracking-[0.28em] text-gold uppercase">Day</span>
          <span className="font-display text-4xl leading-none text-white sm:text-5xl">
            {String(day.dayNumber).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-1 font-display text-2xl leading-none tracking-wide text-white uppercase sm:text-3xl">
          {place}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/30 bg-black/30 px-2.5 py-0.5 font-cond text-xs font-semibold tracking-wider uppercase">
            {typeLabels[day.type]}
          </span>
          {minutes > 0 && (
            <span className="font-mono text-[11px] tracking-widest text-white/85">
              {day.type === "commute" ? `${formatDuration(minutes)} drive` : `${formatDuration(minutes)} planned`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
