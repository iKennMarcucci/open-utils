/**
 * Generate TypeScript interfaces from a JSON sample, locally.
 *
 * The approach: walk the parsed value, and every object becomes a named
 * interface. Arrays are typed by merging the shapes of all their elements, so
 * `[{a:1},{a:2,b:3}]` yields `{ a: number; b?: number }` rather than guessing
 * from the first item. Interface names are derived from the property they hang
 * off, de-duplicated by structural signature so identical shapes are reused.
 */

import { validateJson } from "./json-format";

type TsResult = { ok: true; output: string } | { ok: false; error: string };

const pascal = (s: string) =>
  s
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") || "Item";

const singular = (s: string) => (s.length > 3 && s.endsWith("s") ? s.slice(0, -1) : s);

export function jsonToTypeScript(input: string, rootName = "Root"): TsResult {
  if (!input.trim()) return { ok: true, output: "" };
  const issue = validateJson(input);
  if (issue) {
    return {
      ok: false,
      error: `JSON no válido${issue.line ? ` (línea ${issue.line}, columna ${issue.column})` : ""}: ${issue.message}`,
    };
  }

  const value = JSON.parse(input);
  const interfaces = new Map<string, string>(); // name -> body
  const signatures = new Map<string, string>(); // structural signature -> name

  const nameFor = (base: string) => {
    const wanted = pascal(base);
    if (!interfaces.has(wanted) && !reserved.has(wanted)) return wanted;
    let i = 2;
    while (interfaces.has(`${wanted}${i}`)) i++;
    return `${wanted}${i}`;
  };
  const reserved = new Set<string>();

  const typeOf = (val: unknown, hint: string): string => {
    if (val === null) return "null";
    if (Array.isArray(val)) return `${arrayType(val, hint)}[]`;
    switch (typeof val) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "object":
        return objectType(val as Record<string, unknown>, hint);
      default:
        return "unknown";
    }
  };

  const arrayType = (arr: unknown[], hint: string): string => {
    if (arr.length === 0) return "unknown";
    const objs = arr.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[];
    if (objs.length === arr.length) {
      // Merge all object element shapes into one interface.
      const merged = mergeObjects(objs);
      return objectType(merged.shape, singular(hint), merged.optional);
    }
    // Union of primitive/array element types.
    const types = new Set(arr.map((x) => typeOf(x, singular(hint))));
    return [...types].join(" | ") || "unknown";
  };

  const mergeObjects = (objs: Record<string, unknown>[]) => {
    const shape: Record<string, unknown> = {};
    const seen: Record<string, number> = {};
    for (const o of objs) for (const k of Object.keys(o)) {
      seen[k] = (seen[k] ?? 0) + 1;
      if (!(k in shape) || shape[k] === null) shape[k] = o[k];
    }
    const optional = new Set(Object.keys(seen).filter((k) => seen[k] < objs.length));
    return { shape, optional };
  };

  const objectType = (obj: Record<string, unknown>, hint: string, optional?: Set<string>): string => {
    const lines: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      const opt = optional?.has(key) ? "?" : "";
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      lines.push(`  ${safeKey}${opt}: ${typeOf(val, key)};`);
    }
    const body = lines.length ? `{\n${lines.join("\n")}\n}` : "{}";
    const signature = body;

    // Reuse an identical interface if we've already emitted one.
    const existing = signatures.get(signature);
    if (existing) return existing;

    const name = nameFor(hint);
    reserved.add(name);
    signatures.set(signature, name);
    interfaces.set(name, body);
    return name;
  };

  // When the whole document is an array, the element interface must be named
  // differently from the root alias (otherwise `type Root = Root[]` would clash
  // with `interface Root`, and the `[]` gets silently dropped). Give the element
  // a singularised / "Item" name so we can emit `type Root = RootItem[]`.
  const itemName = (base: string) => {
    const s = singular(base);
    return s !== base ? s : `${pascal(base)}Item`;
  };
  const rootType = Array.isArray(value) ? typeOf(value, itemName(rootName)) : typeOf(value, rootName);

  // Emit a root type alias whenever the document's top-level type isn't itself a
  // single named interface equal to the root name (arrays, unions, primitives).
  let head = "";
  if (!interfaces.size || rootType !== pascal(rootName)) {
    head = `export type ${pascal(rootName)} = ${rootType};\n\n`;
  }

  const decls = [...interfaces.entries()]
    .reverse()
    .map(([name, body]) => `export interface ${name} ${body}`)
    .join("\n\n");

  return { ok: true, output: (head + decls).trim() + "\n" };
}
