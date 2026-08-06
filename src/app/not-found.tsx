import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-sm text-muted">Wrong exit</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">This road isn&apos;t on the map yet</h1>
      <p className="mt-4 text-base text-muted">
        The page you were looking for doesn&apos;t exist — or that leg of the trip hasn&apos;t been written yet.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-canvas"
      >
        Back to the start
      </Link>
    </div>
  );
}
