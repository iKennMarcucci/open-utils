/**
 * Fake request/response bodies from an OpenAPI 3.x or Swagger 2.0 spec.
 *
 * The spec (JSON or YAML) is parsed locally; for each path + method we pull the
 * request-body schema and the success-response schema and fill them with fake
 * data by walking the JSON Schema. `$ref` is resolved against the same document,
 * with a cycle guard so recursive models terminate. Everything runs in the
 * browser — the spec never leaves the device.
 */
import { parse as parseYaml } from "yaml";
import { value as fakeValue, guessFieldType } from "./fake-data";

type Json = Record<string, unknown>;

export type Endpoint = {
  id: string;
  method: string; // upper-case: GET, POST…
  path: string;
  summary: string;
  requestSchema?: Json;
  responseStatus?: string;
  responseSchema?: Json;
};

export type ParsedSpec = {
  title: string;
  version: string;
  spec: Json;
  endpoints: Endpoint[];
};

const METHODS = ["get", "post", "put", "patch", "delete", "head", "options"] as const;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const int = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Parse a spec from JSON or YAML text and extract its endpoints. */
export function parseOpenApi(text: string): { ok: true; data: ParsedSpec } | { ok: false; error: string } {
  const src = text.trim();
  if (!src) return { ok: false, error: "Pega o sube un archivo Swagger / OpenAPI." };

  // Real-world Swagger exports mix flow syntax (`items: { … }`) with block
  // indentation that strict parsers reject, so we lean on the tolerant `yaml`
  // parser (with `strict: false`) instead of js-yaml. JSON is a subset of YAML,
  // so a single parse covers both — we only try `JSON.parse` first because it is
  // faster and gives a cleaner tree for pure-JSON specs.
  let spec: unknown;
  try {
    spec = JSON.parse(src);
  } catch {
    try {
      spec = parseYaml(src, { strict: false, uniqueKeys: false });
    } catch {
      return { ok: false, error: "No se pudo leer el archivo: no es JSON ni YAML válido." };
    }
  }

  if (!isObj(spec)) return { ok: false, error: "El contenido no es un documento OpenAPI válido." };
  if (!isObj(spec.paths)) {
    return { ok: false, error: "No parece un Swagger / OpenAPI: falta la sección «paths»." };
  }

  const info = isObj(spec.info) ? spec.info : {};
  const endpoints = extractEndpoints(spec);
  if (endpoints.length === 0) {
    return { ok: false, error: "No se encontró ningún endpoint con cuerpo de petición o respuesta." };
  }

  return {
    ok: true,
    data: {
      title: typeof info.title === "string" ? info.title : "API",
      version: typeof info.version === "string" ? info.version : "",
      spec,
      endpoints,
    },
  };
}

/** Grab the JSON schema of an OpenAPI 3 media-type map (application/json first). */
function jsonSchemaFromContent(content: unknown): Json | undefined {
  if (!isObj(content)) return undefined;
  const media =
    (isObj(content["application/json"]) && content["application/json"]) ||
    Object.values(content).find(isObj);
  if (isObj(media) && isObj(media.schema)) return media.schema;
  return undefined;
}

function extractEndpoints(spec: Json): Endpoint[] {
  const paths = spec.paths as Json;
  const out: Endpoint[] = [];

  for (const path of Object.keys(paths)) {
    const item = paths[path];
    if (!isObj(item)) continue;

    for (const method of METHODS) {
      const op = item[method];
      if (!isObj(op)) continue;

      // Request body — OpenAPI 3 (requestBody.content) or Swagger 2 (a body param).
      let requestSchema: Json | undefined;
      if (isObj(op.requestBody) && "content" in op.requestBody) {
        requestSchema = jsonSchemaFromContent((op.requestBody as Json).content);
      } else if (Array.isArray(op.parameters)) {
        const body = op.parameters.find((p) => isObj(p) && p.in === "body");
        if (isObj(body) && isObj(body.schema)) requestSchema = body.schema;
      }

      // Response — prefer 200/201, then any 2xx, then `default`.
      const responses = isObj(op.responses) ? op.responses : {};
      const codes = Object.keys(responses);
      const status =
        ["200", "201"].find((c) => c in responses) ??
        codes.find((c) => /^2\d\d$/.test(c)) ??
        (codes.includes("default") ? "default" : codes[0]);
      let responseSchema: Json | undefined;
      if (status && isObj(responses[status])) {
        const resp = responses[status] as Json;
        responseSchema = isObj(resp.content)
          ? jsonSchemaFromContent(resp.content) // OpenAPI 3
          : isObj(resp.schema)
            ? resp.schema // Swagger 2
            : undefined;
      }

      if (!requestSchema && !responseSchema) continue;

      out.push({
        id: `${method}:${path}`,
        method: method.toUpperCase(),
        path,
        summary: typeof op.summary === "string" ? op.summary : "",
        requestSchema,
        responseStatus: responseSchema ? status : undefined,
        responseSchema,
      });
    }
  }
  return out;
}

/** Resolve a local `#/...` JSON pointer against the spec. */
function resolveRef(spec: Json, ref: string): Json | undefined {
  if (!ref.startsWith("#/")) return undefined;
  const parts = ref.slice(2).split("/").map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
  let cur: unknown = spec;
  for (const p of parts) {
    if (!isObj(cur) && !Array.isArray(cur)) return undefined;
    cur = (cur as Json)[p];
  }
  return isObj(cur) ? cur : undefined;
}

type FakeOpts = { arrayItems: number };

/** Walk a JSON Schema node and produce a fake value for it. */
function fakeSchema(schema: unknown, spec: Json, name: string, seen: Set<string>, depth: number, opts: FakeOpts): unknown {
  if (!isObj(schema) || depth > 8) return null;

  // $ref — resolve, guarding against recursive models.
  if (typeof schema.$ref === "string") {
    if (seen.has(schema.$ref)) return null;
    const target = resolveRef(spec, schema.$ref);
    if (!target) return null;
    return fakeSchema(target, spec, name || schema.$ref.split("/").pop() || "", new Set(seen).add(schema.$ref), depth + 1, opts);
  }

  // Author-provided examples and enums win: they're guaranteed realistic.
  if ("example" in schema) return schema.example;
  if (Array.isArray(schema.examples) && schema.examples.length) return schema.examples[0];
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[int(0, schema.enum.length - 1)];

  // Composition.
  if (Array.isArray(schema.allOf)) {
    const merged: Json = {};
    for (const part of schema.allOf) {
      const v = fakeSchema(part, spec, name, seen, depth + 1, opts);
      if (isObj(v)) Object.assign(merged, v);
    }
    // allOf may also carry sibling properties.
    if (isObj(schema.properties)) Object.assign(merged, fakeObject(schema, spec, seen, depth, opts));
    return merged;
  }
  if (Array.isArray(schema.oneOf) && schema.oneOf.length) return fakeSchema(schema.oneOf[0], spec, name, seen, depth + 1, opts);
  if (Array.isArray(schema.anyOf) && schema.anyOf.length) return fakeSchema(schema.anyOf[0], spec, name, seen, depth + 1, opts);

  const type = typeof schema.type === "string" ? schema.type : isObj(schema.properties) ? "object" : "string";

  switch (type) {
    case "object":
      return fakeObject(schema, spec, seen, depth, opts);
    case "array": {
      const n = Math.max(
        typeof schema.minItems === "number" ? schema.minItems : 1,
        Math.min(opts.arrayItems, typeof schema.maxItems === "number" ? schema.maxItems : opts.arrayItems)
      );
      return Array.from({ length: n }, () => fakeSchema(schema.items, spec, name, seen, depth + 1, opts));
    }
    case "integer":
    case "number": {
      const min = typeof schema.minimum === "number" ? schema.minimum : 1;
      const max = typeof schema.maximum === "number" ? schema.maximum : min + 1000;
      if (type === "integer") return int(min, Math.max(min, max));
      return Math.round((min + Math.random() * (max - min)) * 100) / 100;
    }
    case "boolean":
      return Math.random() < 0.5;
    case "string":
    default: {
      const format = typeof schema.format === "string" ? schema.format : undefined;
      const guess = guessFieldType(name, format);
      if (guess) return fakeValue(guess);
      return fakeValue("word");
    }
  }
}

function fakeObject(schema: Json, spec: Json, seen: Set<string>, depth: number, opts: FakeOpts): Json {
  const props = isObj(schema.properties) ? schema.properties : {};
  const obj: Json = {};
  for (const key of Object.keys(props)) {
    obj[key] = fakeSchema(props[key], spec, key, seen, depth + 1, opts);
  }
  return obj;
}

/** Fake the request and/or response body of one endpoint. */
export function fakeEndpoint(spec: Json, ep: Endpoint, opts: FakeOpts = { arrayItems: 2 }): { request?: unknown; response?: unknown } {
  const out: { request?: unknown; response?: unknown } = {};
  if (ep.requestSchema) out.request = fakeSchema(ep.requestSchema, spec, "", new Set(), 0, opts);
  if (ep.responseSchema) out.response = fakeSchema(ep.responseSchema, spec, "", new Set(), 0, opts);
  return out;
}

/** Build one JSON document faking every selected endpoint. */
export function fakeAll(spec: Json, endpoints: Endpoint[], opts: FakeOpts = { arrayItems: 2 }): string {
  const doc: Record<string, unknown> = {};
  for (const ep of endpoints) {
    const faked = fakeEndpoint(spec, ep, opts);
    const entry: Json = {};
    if (faked.request !== undefined) entry.request = faked.request;
    if (faked.response !== undefined) {
      entry.status = ep.responseStatus;
      entry.response = faked.response;
    }
    doc[`${ep.method} ${ep.path}`] = entry;
  }
  return JSON.stringify(doc, null, 2);
}

/** A tiny Swagger-ish sample spec for the "Ver ejemplo" button. */
export const OPENAPI_EXAMPLE = `{
  "openapi": "3.0.0",
  "info": { "title": "API de tienda", "version": "1.0.0" },
  "paths": {
    "/usuarios": {
      "get": {
        "summary": "Listar usuarios",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Usuario" } }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Crear usuario",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/NuevoUsuario" }
            }
          }
        },
        "responses": {
          "201": {
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/Usuario" } }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Usuario": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "nombre": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "ciudad": { "type": "string" },
          "activo": { "type": "boolean" },
          "creadoEn": { "type": "string", "format": "date-time" }
        }
      },
      "NuevoUsuario": {
        "type": "object",
        "properties": {
          "nombre": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "edad": { "type": "integer", "minimum": 18, "maximum": 90 }
        }
      }
    }
  }
}`;
