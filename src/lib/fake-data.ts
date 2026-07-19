/**
 * Fake data generator, local and dependency-free.
 *
 * `Math.random` is fine here: generation runs in the browser on a button press,
 * never during server render, so it doesn't affect SSR output.
 */

export type FieldType =
  | "uuid" | "firstName" | "lastName" | "fullName" | "email" | "username"
  | "phone" | "int" | "float" | "boolean" | "date" | "datetime"
  | "city" | "country" | "company" | "jobTitle" | "word" | "sentence"
  | "url" | "ipv4" | "color" | "price";

export const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: "uuid", label: "UUID" },
  { id: "firstName", label: "Nombre" },
  { id: "lastName", label: "Apellido" },
  { id: "fullName", label: "Nombre completo" },
  { id: "email", label: "Email" },
  { id: "username", label: "Usuario" },
  { id: "phone", label: "Teléfono" },
  { id: "int", label: "Entero" },
  { id: "float", label: "Decimal" },
  { id: "price", label: "Precio" },
  { id: "boolean", label: "Booleano" },
  { id: "date", label: "Fecha" },
  { id: "datetime", label: "Fecha y hora" },
  { id: "city", label: "Ciudad" },
  { id: "country", label: "País" },
  { id: "company", label: "Empresa" },
  { id: "jobTitle", label: "Puesto" },
  { id: "word", label: "Palabra" },
  { id: "sentence", label: "Frase" },
  { id: "url", label: "URL" },
  { id: "ipv4", label: "IPv4" },
  { id: "color", label: "Color (hex)" },
];

export type Field = { name: string; type: FieldType };
export type OutputFormat = "json" | "csv" | "xml" | "sql" | "table";

const FIRST = ["Ada", "Alan", "Grace", "Linus", "Marie", "Carlos", "Lucía", "Mateo", "Sofía", "Diego", "Elena", "Pablo", "Nadia", "Omar", "Irene", "Hugo"];
const LAST = ["García", "Lovelace", "Turing", "Torvalds", "Curie", "Martínez", "López", "Ada", "Núñez", "Ferrer", "Ibáñez", "Roldán", "Vega", "Serra"];
const CITIES = ["Madrid", "Barcelona", "Sevilla", "Bogotá", "Lima", "México", "Quito", "Santiago", "Valencia", "Bilbao", "Rosario", "Porto"];
const COUNTRIES = ["España", "México", "Colombia", "Argentina", "Chile", "Perú", "Ecuador", "Uruguay", "Portugal"];
const COMPANIES = ["Nubex", "Datalia", "Orbita", "Vektor", "Lumen", "Craftbyte", "Solvia", "Rednodo", "Pixelar"];
const JOBS = ["Desarrolladora", "Diseñador", "Analista", "Product Manager", "DevOps", "QA", "Data Scientist", "CTO"];
const WORDS = ["lorem", "ipsum", "dolor", "amet", "nube", "dato", "flujo", "nodo", "clave", "índice", "vector", "señal"];
const DOMAINS = ["ejemplo.com", "correo.dev", "mail.io", "dominio.org"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const int = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n: number) => String(n).padStart(2, "0");

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function value(type: FieldType): string | number | boolean {
  switch (type) {
    case "uuid": return uuid();
    case "firstName": return pick(FIRST);
    case "lastName": return pick(LAST);
    case "fullName": return `${pick(FIRST)} ${pick(LAST)}`;
    case "username": return `${pick(FIRST).toLowerCase()}${int(1, 999)}`;
    case "email": return `${pick(FIRST).toLowerCase()}.${pick(LAST).toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@${pick(DOMAINS)}`;
    case "phone": return `+34 6${int(10, 99)} ${int(100, 999)} ${int(100, 999)}`;
    case "int": return int(1, 10000);
    case "float": return Math.round(Math.random() * 100000) / 100;
    case "price": return Math.round((Math.random() * 500 + 1) * 100) / 100;
    case "boolean": return Math.random() < 0.5;
    case "date": {
      const d = new Date(2020, int(0, 11), int(1, 28));
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    case "datetime": {
      const d = new Date(2020, int(0, 11), int(1, 28), int(0, 23), int(0, 59), int(0, 59));
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}Z`;
    }
    case "city": return pick(CITIES);
    case "country": return pick(COUNTRIES);
    case "company": return pick(COMPANIES);
    case "jobTitle": return pick(JOBS);
    case "word": return pick(WORDS);
    case "sentence": return `${Array.from({ length: int(4, 9) }, () => pick(WORDS)).join(" ")}.`.replace(/^./, (c) => c.toUpperCase());
    case "url": return `https://${pick(DOMAINS)}/${pick(WORDS)}/${int(1, 999)}`;
    case "ipv4": return `${int(1, 255)}.${int(0, 255)}.${int(0, 255)}.${int(1, 255)}`;
    case "color": return `#${int(0, 0xffffff).toString(16).padStart(6, "0")}`;
  }
}

// ── Field-type inference ─────────────────────────────────────────────────────
// Used when faking from an OpenAPI/Swagger schema: a JSON Schema string tells us
// little, but its `format` and the property name usually reveal what it holds, so
// we can produce realistic values (an "email" field gets an email, not a word).

const FORMAT_HINTS: Record<string, FieldType> = {
  uuid: "uuid",
  email: "email",
  "date-time": "datetime",
  date: "date",
  uri: "url",
  url: "url",
  hostname: "url",
  ipv4: "ipv4",
  ip: "ipv4",
  password: "word",
};

const NAME_HINTS: [RegExp, FieldType][] = [
  [/e-?mail|correo/i, "email"],
  [/user_?name|usuario|login|handle/i, "username"],
  [/first_?name|nombre$/i, "firstName"],
  [/last_?name|surname|apellidos?/i, "lastName"],
  [/full_?name|display_?name|nombre_?completo/i, "fullName"],
  [/phone|tel(e|é)fono|mobile|movil|móvil/i, "phone"],
  [/price|amount|cost|precio|total|importe|salary|salario/i, "price"],
  [/city|ciudad|town|localidad/i, "city"],
  [/country|país|pais|nation/i, "country"],
  [/company|empresa|organi[zs]ation|organizaci(o|ó)n/i, "company"],
  [/job|role|puesto|cargo|position/i, "jobTitle"],
  [/color|colour/i, "color"],
  [/website|homepage|link|url/i, "url"],
  [/ip_?addr|ip$/i, "ipv4"],
  [/uuid|guid/i, "uuid"],
  [/(^|_)id$|_id$/i, "uuid"],
  [/date_?time|timestamp|created_?at|updated_?at/i, "datetime"],
  [/date|fecha/i, "date"],
  [/name|nombre/i, "fullName"],
];

/**
 * Best-guess field type for a property, from its OpenAPI `format` first and its
 * name second. Returns null when nothing matches, so the caller can fall back to
 * a generic value for the JSON type.
 */
export function guessFieldType(name: string, format?: string): FieldType | null {
  if (format && FORMAT_HINTS[format.toLowerCase()]) return FORMAT_HINTS[format.toLowerCase()];
  for (const [re, type] of NAME_HINTS) if (re.test(name)) return type;
  return null;
}

export function generateRecords(schema: Field[], count: number): Record<string, unknown>[] {
  const fields = schema.filter((f) => f.name.trim() !== "");
  const n = Math.max(1, Math.min(count, 1000));
  return Array.from({ length: n }, () => {
    const row: Record<string, unknown> = {};
    for (const f of fields) row[f.name] = value(f.type);
    return row;
  });
}

// ── Serializers ──────────────────────────────────────────────────────────────

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const xmlEscape = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sqlValue = (v: unknown) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
};

export function serialize(records: Record<string, unknown>[], format: OutputFormat, table = "datos"): string {
  if (records.length === 0) return "";
  const keys = Object.keys(records[0]);

  switch (format) {
    case "json":
      return JSON.stringify(records, null, 2);
    case "csv":
      return [keys.join(","), ...records.map((r) => keys.map((k) => csvCell(r[k])).join(","))].join("\n");
    case "table":
      // Tab-separated: paste straight into a spreadsheet.
      return [keys.join("\t"), ...records.map((r) => keys.map((k) => String(r[k] ?? "")).join("\t"))].join("\n");
    case "xml":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${table}>\n${records
        .map(
          (r) =>
            `  <registro>\n${keys.map((k) => `    <${k}>${xmlEscape(r[k])}</${k}>`).join("\n")}\n  </registro>`
        )
        .join("\n")}\n</${table}>`;
    case "sql":
      return records
        .map(
          (r) =>
            `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((k) => sqlValue(r[k])).join(", ")});`
        )
        .join("\n");
  }
}

export const FAKE_EXAMPLE: Field[] = [
  { name: "id", type: "uuid" },
  { name: "nombre", type: "fullName" },
  { name: "email", type: "email" },
  { name: "ciudad", type: "city" },
  { name: "precio", type: "price" },
  { name: "activo", type: "boolean" },
];
