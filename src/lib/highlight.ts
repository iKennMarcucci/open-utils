/**
 * Thin wrapper around Prism used by every code / data-format panel in the app.
 *
 * `highlight()` returns an HTML string (never touches the DOM) so it can feed a
 * `dangerouslySetInnerHTML` in React. Token colours live in `globals.css`
 * (`.ou-code .token.*`) and track the light/dark theme through CSS variables,
 * so this module only produces the markup — never the colours.
 *
 * The whole thing runs in the browser: nothing is sent anywhere.
 */
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markup"; // XML + HTML
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";

export type CodeLang =
  | "json"
  | "yaml"
  | "toml"
  | "csv"
  | "xml"
  | "html"
  | "css"
  | "sql"
  | "markdown"
  | "typescript"
  | "jsx"
  | "text";

const GRAMMARS: Record<CodeLang, string> = {
  json: "json",
  yaml: "yaml",
  toml: "toml",
  csv: "csv", // handled specially (Prism has no CSV grammar)
  xml: "markup",
  html: "markup",
  css: "css",
  sql: "sql",
  markdown: "markdown",
  typescript: "typescript",
  jsx: "jsx",
  text: "text",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * CSV has no Prism grammar, so we colour it by hand: the header row as
 * property-coloured, every field afterwards as a string, commas as punctuation.
 */
function highlightCsv(code: string): string {
  const lines = code.split("\n");
  return lines
    .map((line, row) => {
      if (line === "") return "";
      const cls = row === 0 ? "table-header" : "string";
      const cells = line.split(",").map(
        (cell) => `<span class="token ${cls}">${escapeHtml(cell)}</span>`
      );
      return cells.join('<span class="token punctuation">,</span>');
    })
    .join("\n");
}

/** Highlight `code` as `lang`, returning safe HTML for dangerouslySetInnerHTML. */
export function highlight(code: string, lang: CodeLang): string {
  if (!code) return "";
  if (lang === "csv") return highlightCsv(code);
  if (lang === "text") return escapeHtml(code);

  const grammarName = GRAMMARS[lang];
  const grammar = Prism.languages[grammarName];
  if (!grammar) return escapeHtml(code);
  try {
    return Prism.highlight(code, grammar, grammarName);
  } catch {
    return escapeHtml(code);
  }
}
