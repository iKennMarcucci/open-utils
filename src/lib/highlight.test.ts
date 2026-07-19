import { describe, it, expect } from "vitest";
import { highlight } from "@/lib/highlight";

describe("highlight", () => {
  it("returns empty string for empty input", () => {
    expect(highlight("", "json")).toBe("");
  });

  it("wraps JSON tokens in <span class=\"token ...\">", () => {
    const html = highlight('{"a":1}', "json");
    expect(html).toContain('<span class="token');
    // property and number tokens exist in Prism's json grammar
    expect(html).toMatch(/token (property|punctuation|number)/);
  });

  it("highlights YAML", () => {
    const html = highlight("clave: valor\nlista:\n  - 1", "yaml");
    expect(html).toContain('<span class="token');
  });

  it("escapes <, > and & so output is safe HTML", () => {
    const html = highlight("<script>&</script>", "text");
    expect(html).toBe("&lt;script&gt;&amp;&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("escapes HTML in highlighted (grammar) output too", () => {
    const html = highlight('{"k":"<b>&</b>"}', "json");
    // The dangerous opening bracket is escaped so no real tag can be injected.
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("</b>");
    expect(html).toContain("&lt;b");
    expect(html).toContain("&amp;");
  });

  it("colors the CSV header row differently from the body", () => {
    const html = highlight("id,nombre\n1,Ada", "csv");
    expect(html).toContain('<span class="token table-header">id</span>');
    expect(html).toContain('<span class="token string">1</span>');
    // commas become punctuation tokens
    expect(html).toContain('<span class="token punctuation">,</span>');
  });

  it("preserves blank CSV lines without emitting spans", () => {
    const html = highlight("a\n\nb", "csv");
    const lines = html.split("\n");
    expect(lines[1]).toBe("");
  });

  it("returns escaped plain text for the 'text' language", () => {
    expect(highlight("just text < >", "text")).toBe("just text &lt; &gt;");
  });
});
