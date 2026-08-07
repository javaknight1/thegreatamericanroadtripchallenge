/**
 * Emits a JSON-LD block. Rendered server-side into the static HTML, so the
 * structured data is in the document a crawler fetches — no hydration, no
 * client JS, nothing to execute.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own build-time content, not user input. Escaping `<`
      // keeps a stray "</script>" in a blurb from closing the tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
