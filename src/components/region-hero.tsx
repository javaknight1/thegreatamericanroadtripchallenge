import { regionScene } from "@/lib/region-art";
import type { RegionTheme } from "@/lib/region-theme";

/**
 * The banner at the top of a region's pages: its own scene, its own sky, its
 * own caption. Different subject per leg, same drawing language throughout.
 */
export function RegionHero({
  regionId,
  theme,
  order,
  name,
  season,
  eyebrow,
}: {
  regionId: string;
  theme: RegionTheme;
  order: number;
  name: string;
  season: string;
  /** Overrides the leg line — day pages use it to name the day. */
  eyebrow?: string;
}) {
  const scene = regionScene(regionId, theme);
  const gradientId = `sky-${regionId}`;

  return (
    <div className="relative h-36 overflow-hidden rounded-xl sm:h-44">
      <svg viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene.sky[0]} />
            <stop offset="100%" stopColor={scene.sky[1]} />
          </linearGradient>
        </defs>
        <rect width="100" height="36" fill={`url(#${gradientId})`} />
        {scene.layers.map((layer, index) => (
          <path key={index} d={layer.d} fill={layer.fill} opacity={layer.opacity} />
        ))}
      </svg>

      {scene.disc && (
        <div
          aria-hidden
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
          style={{
            left: `${scene.disc.cx}%`,
            top: `${(scene.disc.cy / 36) * 100}%`,
            height: `${(scene.disc.r / 36) * 200}%`,
            backgroundColor: scene.disc.fill,
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 text-canvas sm:p-5">
        <p className="font-mono text-[9px] tracking-[0.24em] text-white/75 uppercase">
          {eyebrow ?? `Leg ${order} · ${season}`}
        </p>
        <p className="mt-1 font-display text-2xl leading-none tracking-wide text-white uppercase sm:text-4xl">
          {name}
        </p>
        <p className="mt-1.5 font-cond text-[13px] font-semibold tracking-wide text-white/80 uppercase">
          {scene.caption}
        </p>
      </div>
    </div>
  );
}
