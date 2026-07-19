/**
 * Universal data-format converter.
 *
 * Everything routes through a plain JavaScript value: parse the source into it,
 * then serialize that value into the target. JSON, YAML, CSV and TOML can be
 * *read*; JSON, YAML, CSV, XML, TOML, SQL, Markdown and HTML can be *written*.
 * The tabular targets (CSV, SQL, Markdown, HTML) need an array of flat objects
 * — the tool says so and errors clearly when the data isn't shaped that way,
 * rather than emitting something misleading.
 */
import * as YAML from "js-yaml";
import TOML from "@iarna/toml";

export type Format = "json" | "yaml" | "csv" | "toml" | "xml" | "sql" | "markdown" | "html";

export const INPUT_FORMATS: { id: Format; label: string }[] = [
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "csv", label: "CSV" },
  { id: "toml", label: "TOML" },
];

export const OUTPUT_FORMATS: { id: Format; label: string; ext: string }[] = [
  { id: "json", label: "JSON", ext: "json" },
  { id: "yaml", label: "YAML", ext: "yaml" },
  { id: "csv", label: "CSV", ext: "csv" },
  { id: "xml", label: "XML", ext: "xml" },
  { id: "toml", label: "TOML", ext: "toml" },
  { id: "sql", label: "SQL", ext: "sql" },
  { id: "markdown", label: "Markdown", ext: "md" },
  { id: "html", label: "HTML", ext: "html" },
];

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

// ── Parsing ──────────────────────────────────────────────────────────────────

function coerce(s: string): unknown {
  const t = s.trim();
  if (t === "") return "";
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(t) && String(Number(t)) === t) return Number(t);
  return s;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/\r\n/g, "\n").trim();

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  row.push(cell);
  rows.push(row);

  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.some((c) => c !== "")).map((r) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => (obj[h] = coerce(r[i] ?? "")));
    return obj;
  });
}

export function parseInput(text: string, format: Format): Ok<unknown> | Err {
  if (!text.trim()) return { ok: true, value: null };
  try {
    switch (format) {
      case "json": return { ok: true, value: JSON.parse(text) };
      case "yaml": return { ok: true, value: YAML.load(text) };
      case "toml": return { ok: true, value: TOML.parse(text) };
      case "csv": return { ok: true, value: parseCsv(text) };
      default: return { ok: false, error: `El formato ${format} no se admite como entrada.` };
    }
  } catch (e) {
    return { ok: false, error: `No se pudo leer el ${format.toUpperCase()}: ${(e as Error).message}` };
  }
}

// ── Serializing ──────────────────────────────────────────────────────────────

const isFlatObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) &&
  Object.values(v).every((x) => x === null || typeof x !== "object");

function asRows(value: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(value) && value.every(isFlatObject)) return value as Record<string, unknown>[];
  if (isFlatObject(value)) return [value];
  return null;
}

const NEEDS_TABLE = "Este formato necesita datos tabulares: un array de objetos planos (o un solo objeto). Los datos actuales están anidados y no encajan en una tabla.";

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const xmlEscape = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const htmlEscape = xmlEscape;
const sqlValue = (v: unknown) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
};

function toXml(value: unknown): string {
  const node = (name: string, val: unknown, indent: string): string => {
    if (Array.isArray(val)) return val.map((v) => node(name, v, indent)).join("\n");
    if (val && typeof val === "object") {
      const inner = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => node(k, v, indent + "  "))
        .join("\n");
      return `${indent}<${name}>\n${inner}\n${indent}</${name}>`;
    }
    return `${indent}<${name}>${xmlEscape(val)}</${name}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${node("root", value, "")}`;
}

export function serializeOutput(value: unknown, format: Format, table = "datos"): Ok<string> | Err {
  try {
    switch (format) {
      case "json":
        return { ok: true, value: JSON.stringify(value, null, 2) };
      case "yaml":
        return { ok: true, value: YAML.dump(value, { indent: 2 }).trimEnd() };
      case "toml":
        if (!value || typeof value !== "object" || Array.isArray(value))
          return { ok: false, error: "TOML requiere un objeto en la raíz (no un array ni un valor suelto)." };
        return { ok: true, value: TOML.stringify(value as TOML.JsonMap).trimEnd() };
      case "xml":
        return { ok: true, value: toXml(value) };
      case "csv": {
        const rows = asRows(value);
        if (!rows) return { ok: false, error: NEEDS_TABLE };
        const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
        return { ok: true, value: [keys.join(","), ...rows.map((r) => keys.map((k) => csvCell(r[k])).join(","))].join("\n") };
      }
      case "sql": {
        const rows = asRows(value);
        if (!rows) return { ok: false, error: NEEDS_TABLE };
        const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
        return {
          ok: true,
          value: rows.map((r) => `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((k) => sqlValue(r[k])).join(", ")});`).join("\n"),
        };
      }
      case "markdown": {
        const rows = asRows(value);
        if (!rows) return { ok: false, error: NEEDS_TABLE };
        const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
        const header = `| ${keys.join(" | ")} |`;
        const sep = `| ${keys.map(() => "---").join(" | ")} |`;
        const body = rows.map((r) => `| ${keys.map((k) => String(r[k] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
        return { ok: true, value: [header, sep, ...body].join("\n") };
      }
      case "html": {
        const rows = asRows(value);
        if (!rows) return { ok: false, error: NEEDS_TABLE };
        const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
        const thead = `  <thead><tr>${keys.map((k) => `<th>${htmlEscape(k)}</th>`).join("")}</tr></thead>`;
        const tbody = `  <tbody>\n${rows.map((r) => `    <tr>${keys.map((k) => `<td>${htmlEscape(r[k])}</td>`).join("")}</tr>`).join("\n")}\n  </tbody>`;
        return { ok: true, value: `<table>\n${thead}\n${tbody}\n</table>` };
      }
      default:
        return { ok: false, error: "Formato no soportado." };
    }
  } catch (e) {
    return { ok: false, error: `No se pudo generar el ${format.toUpperCase()}: ${(e as Error).message}` };
  }
}

export const CONVERT_EXAMPLE = `[
  { "id": 1, "nombre": "Ada", "activo": true },
  { "id": 2, "nombre": "Linus", "activo": false }
]`;
