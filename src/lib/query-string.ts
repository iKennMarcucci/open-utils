/**
 * Query-string building and export helpers, all local and dependency-free.
 */

export type Param = { key: string; value: string; enabled: boolean };

export type ParsedUrl = { base: string; params: Param[] };

/** Accepts a full URL or a bare query string and splits it into base + params. */
export function parseUrl(input: string): ParsedUrl {
  const trimmed = input.trim();
  if (!trimmed) return { base: "", params: [] };

  const qIndex = trimmed.indexOf("?");
  let base = "";
  let query = trimmed;
  if (qIndex >= 0) {
    base = trimmed.slice(0, qIndex);
    query = trimmed.slice(qIndex + 1);
  } else if (/^https?:\/\//i.test(trimmed) || trimmed.includes("/")) {
    // A URL with no query string.
    return { base: trimmed, params: [] };
  }

  const params: Param[] = [];
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = eq >= 0 ? pair.slice(0, eq) : pair;
    const value = eq >= 0 ? pair.slice(eq + 1) : "";
    params.push({
      key: safeDecode(key),
      value: safeDecode(value),
      enabled: true,
    });
  }
  return { base, params };
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

export function buildQuery(params: Param[], sort: boolean): string {
  let active = params.filter((p) => p.enabled && p.key.trim() !== "");
  if (sort) active = [...active].sort((a, b) => a.key.localeCompare(b.key));
  return active
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
}

export function buildUrl(base: string, params: Param[], sort: boolean): string {
  const query = buildQuery(params, sort);
  if (!base) return query ? `?${query}` : "";
  return query ? `${base}?${query}` : base;
}

/** Common parameters grouped by intent, for one-click insertion. */
export const PRESET_GROUPS: { label: string; params: { key: string; value: string }[] }[] = [
  {
    label: "Paginación",
    params: [
      { key: "page", value: "1" },
      { key: "limit", value: "20" },
      { key: "offset", value: "0" },
    ],
  },
  {
    label: "Orden",
    params: [
      { key: "sort", value: "createdAt" },
      { key: "order", value: "desc" },
    ],
  },
  {
    label: "Búsqueda y filtro",
    params: [
      { key: "q", value: "" },
      { key: "filter", value: "" },
      { key: "fields", value: "id,name" },
    ],
  },
  {
    label: "Rango de fechas",
    params: [
      { key: "from", value: "2026-01-01" },
      { key: "to", value: "2026-12-31" },
    ],
  },
  {
    label: "API",
    params: [
      { key: "api_key", value: "TU_API_KEY" },
      { key: "lang", value: "es" },
    ],
  },
];

export type ExportLang = "curl" | "fetch" | "python" | "node";

export const EXPORT_LANGS: { id: ExportLang; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "fetch", label: "JavaScript (fetch)" },
  { id: "python", label: "Python (requests)" },
  { id: "node", label: "Node (axios)" },
];

export function exportAs(lang: ExportLang, url: string): string {
  const safe = url || "https://api.ejemplo.com/recurso";
  switch (lang) {
    case "curl":
      return `curl "${safe}"`;
    case "fetch":
      return `const res = await fetch("${safe}");\nconst data = await res.json();`;
    case "python":
      return `import requests\n\nres = requests.get("${safe}")\ndata = res.json()`;
    case "node":
      return `import axios from "axios";\n\nconst { data } = await axios.get("${safe}");`;
  }
}
