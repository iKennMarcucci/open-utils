/**
 * Renders a JSON-LD block into the initial HTML.
 *
 * A plain <script> tag, not next/script: JSON-LD is data, not executable code,
 * and it has to be present in the server response — AI crawlers don't run JS.
 * `<` is escaped to `<` so a string in the data can't break out of the tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
