/**
 * A small, safe Markdown → HTML renderer, with no dependencies.
 *
 * Safety model: every character of the source is HTML-escaped *first*, so the
 * user's text can never inject a tag. Only after escaping do we introduce our
 * own known-good tags for Markdown constructs. Link and image URLs are further
 * checked so `javascript:` and other dangerous schemes are dropped. This is a
 * pragmatic subset (headings, emphasis, code, lists, quotes, links, images,
 * rules, tables) — enough for notes and READMEs, not a CommonMark implementation.
 */

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const safeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (/^(https?:|mailto:|tel:|#|\/|\.)/i.test(trimmed)) return trimmed;
  return "#";
};

// Sentinels that cannot appear in escaped, single-line inline text (NUL is
// stripped from no input we produce), so they safely bracket a placeholder
// index while the other inline rules run.
const CODE_OPEN = String.fromCharCode(0);
const CODE_CLOSE = String.fromCharCode(1);

/** Inline spans: code, bold, italic, strikethrough, links, images. */
function inline(text: string): string {
  let out = escapeHtml(text);

  // Pull inline code out into placeholders *before* any other inline rule runs,
  // so emphasis/strikethrough markers inside code (`a_b_c`, `x**y**z`) stay
  // literal instead of being turned into <em>/<strong>. Restored at the end.
  const codeSpans: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `${CODE_OPEN}${codeSpans.length - 1}${CODE_CLOSE}`;
  });

  // images ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" />`);
  // links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
  // bold, italic, strikethrough
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/_([^_]+)_/g, "<em>$1</em>");
  out = out.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  // Restore the protected code spans.
  out = out.replace(
    new RegExp(`${CODE_OPEN}(\\d+)${CODE_CLOSE}`, "g"),
    (_, n) => `<code>${codeSpans[Number(n)]}</code>`,
  );

  return out;
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    if (buf.length) html.push(`<p>${inline(buf.join(" "))}</p>`);
    buf.length = 0;
  };

  const para: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (/^```/.test(line)) {
      flushParagraph(para);
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    // heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph(para);
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    // horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph(para);
      html.push("<hr />");
      i++;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      flushParagraph(para);
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""));
      html.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
      continue;
    }

    // table: header row | --- | rows
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && /-/.test(lines[i + 1])) {
      flushParagraph(para);
      const cells = (row: string) =>
        row.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== "") bodyRows.push(cells(lines[i++]));
      const thead = `<thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${bodyRows
        .map((r) => `<tr>${r.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // unordered / ordered list
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      flushParagraph(para);
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`);
      continue;
    }

    // blank line ends a paragraph
    if (line.trim() === "") {
      flushParagraph(para);
      i++;
      continue;
    }

    para.push(line);
    i++;
  }
  flushParagraph(para);

  return html.join("\n");
}

export const MARKDOWN_EXAMPLE = `# Título del documento

Un párrafo con **negrita**, *cursiva*, ~~tachado~~ y \`código en línea\`.

## Lista de tareas

- Primer punto
- Segundo punto con un [enlace](https://openutils.co)
- Tercer punto

> Una cita para resaltar algo importante.

\`\`\`js
function saludar(nombre) {
  return "Hola, " + nombre;
}
\`\`\`

| Formato | Soportado |
| ------- | --------- |
| Tablas  | Sí        |
| Código  | Sí        |
`;
