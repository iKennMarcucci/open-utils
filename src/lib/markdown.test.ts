import { describe, it, expect } from "vitest";
import { renderMarkdown, MARKDOWN_EXAMPLE } from "@/lib/markdown";

describe("renderMarkdown — headings", () => {
  it("renders all six heading levels", () => {
    for (let n = 1; n <= 6; n++) {
      const hashes = "#".repeat(n);
      expect(renderMarkdown(`${hashes} Title`)).toBe(`<h${n}>Title</h${n}>`);
    }
  });

  it("requires a space after the hashes", () => {
    expect(renderMarkdown("#NoSpace")).toBe("<p>#NoSpace</p>");
  });

  it("does not create an <h7> for seven hashes", () => {
    const out = renderMarkdown("####### Too deep");
    expect(out).not.toContain("<h7>");
    expect(out).toBe("<p>####### Too deep</p>");
  });
});

describe("renderMarkdown — inline formatting", () => {
  it("renders bold, italic (both markers) and strikethrough", () => {
    expect(renderMarkdown("**b**")).toBe("<p><strong>b</strong></p>");
    expect(renderMarkdown("*i*")).toBe("<p><em>i</em></p>");
    expect(renderMarkdown("_i_")).toBe("<p><em>i</em></p>");
    expect(renderMarkdown("~~s~~")).toBe("<p><del>s</del></p>");
  });

  it("renders inline code without further formatting inside it", () => {
    const out = renderMarkdown("`a_b_c`");
    // underscores inside code must stay literal, not become <em>
    expect(out).toBe("<p><code>a_b_c</code></p>");
  });

  it("does not turn bold markers inside inline code into tags", () => {
    const out = renderMarkdown("`a**b**c`");
    expect(out).toBe("<p><code>a**b**c</code></p>");
  });
});

describe("renderMarkdown — links and images (safety)", () => {
  it("renders a safe http link with target/rel", () => {
    const out = renderMarkdown("[label](https://openutils.co)");
    expect(out).toBe(
      '<p><a href="https://openutils.co" target="_blank" rel="noopener noreferrer">label</a></p>',
    );
  });

  it("drops a javascript: URL to #", () => {
    const out = renderMarkdown("[x](javascript:alert(1))");
    expect(out).toContain('href="#"');
    expect(out).not.toContain("javascript:");
  });

  it("drops a data: URL in images", () => {
    const out = renderMarkdown("![x](data:text/html,<script>)");
    expect(out).toContain('src="#"');
    expect(out).not.toContain("data:text/html");
  });

  it("allows relative, anchor, mailto and tel URLs", () => {
    expect(renderMarkdown("[a](/foo)")).toContain('href="/foo"');
    expect(renderMarkdown("[a](#sec)")).toContain('href="#sec"');
    expect(renderMarkdown("[a](mailto:x@y.co)")).toContain('href="mailto:x@y.co"');
    expect(renderMarkdown("[a](tel:+123)")).toContain('href="tel:+123"');
  });
});

describe("renderMarkdown — XSS escaping", () => {
  it("escapes raw HTML tags in text", () => {
    const out = renderMarkdown("<script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("escapes ampersands and quotes", () => {
    expect(renderMarkdown("a & b")).toBe("<p>a &amp; b</p>");
    expect(renderMarkdown('say "hi"')).toBe("<p>say &quot;hi&quot;</p>");
  });

  it("escapes HTML inside a fenced code block", () => {
    const out = renderMarkdown("```\n<b>x</b>\n```");
    expect(out).toBe("<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>");
  });
});

describe("renderMarkdown — block constructs", () => {
  it("renders an unordered list", () => {
    expect(renderMarkdown("- a\n- b")).toBe("<ul><li>a</li><li>b</li></ul>");
  });

  it("renders an ordered list", () => {
    expect(renderMarkdown("1. a\n2. b")).toBe("<ol><li>a</li><li>b</li></ol>");
  });

  it("renders a blockquote spanning multiple lines as one quote", () => {
    expect(renderMarkdown("> a\n> b")).toBe("<blockquote>a b</blockquote>");
  });

  it("renders a horizontal rule from ---, *** and ___", () => {
    expect(renderMarkdown("---")).toBe("<hr />");
    expect(renderMarkdown("***")).toBe("<hr />");
    expect(renderMarkdown("___")).toBe("<hr />");
  });

  it("renders a table with header and body", () => {
    const md = "| A | B |\n| - | - |\n| 1 | 2 |";
    const out = renderMarkdown(md);
    expect(out).toContain("<table>");
    expect(out).toContain("<th>A</th>");
    expect(out).toContain("<th>B</th>");
    expect(out).toContain("<td>1</td>");
    expect(out).toContain("<td>2</td>");
  });

  it("keeps a fenced code block's internal blank lines and indentation", () => {
    const out = renderMarkdown("```\nline1\n\n  indented\n```");
    expect(out).toBe("<pre><code>line1\n\n  indented</code></pre>");
  });
});

describe("renderMarkdown — paragraphs and whitespace", () => {
  it("joins consecutive non-blank lines into one paragraph", () => {
    expect(renderMarkdown("one\ntwo")).toBe("<p>one two</p>");
  });

  it("splits paragraphs on blank lines", () => {
    expect(renderMarkdown("one\n\ntwo")).toBe("<p>one</p>\n<p>two</p>");
  });

  it("returns empty string for empty or whitespace-only input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("   \n\n  ")).toBe("");
  });

  it("normalizes CRLF line endings", () => {
    expect(renderMarkdown("a\r\n\r\nb")).toBe("<p>a</p>\n<p>b</p>");
  });

  it("does not crash on an unterminated fenced code block", () => {
    const out = renderMarkdown("```\ncode without closing fence");
    expect(out).toBe("<pre><code>code without closing fence</code></pre>");
  });
});

describe("renderMarkdown — the shipped example", () => {
  it("renders every documented construct without leaving raw markdown", () => {
    const out = renderMarkdown(MARKDOWN_EXAMPLE);
    expect(out).toContain("<h1>Título del documento</h1>");
    expect(out).toContain("<strong>negrita</strong>");
    expect(out).toContain("<em>cursiva</em>");
    expect(out).toContain("<del>tachado</del>");
    expect(out).toContain("<code>código en línea</code>");
    expect(out).toContain("<h2>Lista de tareas</h2>");
    expect(out).toContain("<ul>");
    expect(out).toContain('<a href="https://openutils.co"');
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<pre><code>");
    expect(out).toContain("<table>");
  });
});
