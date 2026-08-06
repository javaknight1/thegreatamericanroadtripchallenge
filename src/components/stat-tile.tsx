export function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface px-3.5 py-3">
      <p className="font-display text-2xl leading-none sm:text-3xl">{value}</p>
      <p className="mt-1.5 font-mono text-[9.5px] tracking-[0.14em] text-muted uppercase">{label}</p>
    </div>
  );
}
