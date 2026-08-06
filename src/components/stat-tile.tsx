export function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface px-4 py-3">
      <p className="font-display text-2xl leading-none font-semibold sm:text-3xl">{value}</p>
      <p className="mt-1.5 text-xs tracking-wide text-muted uppercase">{label}</p>
    </div>
  );
}
