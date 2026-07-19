"use client";

import { useState } from "react";
import { Check, Copy, Download, FileUp, Plus, RefreshCw, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import {
  FIELD_TYPES,
  FAKE_EXAMPLE,
  generateRecords,
  serialize,
  type Field,
  type FieldType,
  type OutputFormat,
} from "@/lib/fake-data";
import {
  parseOpenApi,
  fakeAll,
  OPENAPI_EXAMPLE,
  type ParsedSpec,
} from "@/lib/openapi-fake";
import { CodeBlock } from "@/components/CodeBlock";
import type { CodeLang } from "@/lib/highlight";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

const OUT_LANG: Record<OutputFormat, CodeLang> = {
  json: "json",
  csv: "csv",
  xml: "xml",
  sql: "sql",
  table: "csv",
};

const FORMATS: { id: OutputFormat; label: string; ext: string; mime: string }[] = [
  { id: "json", label: "JSON", ext: "json", mime: "application/json" },
  { id: "csv", label: "CSV", ext: "csv", mime: "text/csv" },
  { id: "xml", label: "XML", ext: "xml", mime: "application/xml" },
  { id: "sql", label: "SQL", ext: "sql", mime: "text/plain" },
  { id: "table", label: "Tabla (hoja de cálculo)", ext: "tsv", mime: "text/tab-separated-values" },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-success/15 text-success-text",
  POST: "bg-accent/15 text-accent-text",
  PUT: "bg-cat-amber/15 text-cat-amber",
  PATCH: "bg-cat-purple/15 text-cat-purple",
  DELETE: "bg-error/15 text-error-text",
};

let uid = 0;
type Row = Field & { id: number };
const withId = (f: Field): Row => ({ ...f, id: ++uid });

type Mode = "manual" | "openapi";

export function FakeDataUi() {
  const [mode, setMode] = useState<Mode>("manual");

  // Shared output area.
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloadName, setDownloadName] = useState<{ name: string; mime: string }>({
    name: "datos.json",
    mime: "application/json",
  });

  // Manual-schema mode.
  const [rows, setRows] = useState<Row[]>([
    withId({ name: "id", type: "uuid" }),
    withId({ name: "nombre", type: "fullName" }),
    withId({ name: "email", type: "email" }),
  ]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<OutputFormat>("json");
  const [table, setTable] = useState("datos");

  // OpenAPI / Swagger mode.
  const [specText, setSpecText] = useState("");
  const [parsed, setParsed] = useState<ParsedSpec | null>(null);
  const [parseError, setParseError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [arrayItems, setArrayItems] = useState(2);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    saveAs(new Blob([output], { type: `${downloadName.mime};charset=utf-8` }), downloadName.name);
  };

  // ── Manual mode ────────────────────────────────────────────────────────────
  const generateManual = (schema: Row[] = rows, n = count, fmt = format) => {
    const records = generateRecords(schema, n);
    const f = FORMATS.find((x) => x.id === fmt)!;
    setOutput(serialize(records, fmt, table || "datos"));
    setDownloadName({ name: `${table || "datos"}.${f.ext}`, mime: f.mime });
  };

  const update = (id: number, patch: Partial<Field>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));
  const addRow = () => setRows((rs) => [...rs, withId({ name: "", type: "word" })]);

  const loadManualExample = () => {
    setMode("manual");
    const ex = FAKE_EXAMPLE.map(withId);
    setRows(ex);
    setCount(5);
    generateManual(ex, 5, format);
  };

  // ── OpenAPI mode ───────────────────────────────────────────────────────────
  const parseSpec = (text: string) => {
    const res = parseOpenApi(text);
    if (!res.ok) {
      setParsed(null);
      setSelected(new Set());
      setParseError(res.error);
      return;
    }
    setParsed(res.data);
    setSelected(new Set(res.data.endpoints.map((e) => e.id)));
    setParseError("");
    setOutput("");
  };

  const onSpecFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setSpecText(text);
    parseSpec(text);
  };

  const toggleEndpoint = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const generateOpenApi = () => {
    if (!parsed) return;
    const eps = parsed.endpoints.filter((e) => selected.has(e.id));
    if (eps.length === 0) return;
    setOutput(fakeAll(parsed.spec, eps, { arrayItems }));
    setDownloadName({ name: "fake-api.json", mime: "application/json" });
  };

  const loadOpenApiExample = () => {
    setMode("openapi");
    setSpecText(OPENAPI_EXAMPLE);
    parseSpec(OPENAPI_EXAMPLE);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setOutput("");
  };

  return (
    <ToolLayout
      slug="datos-falsos"
      actions={
        <>
          <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
            <button
              onClick={() => switchMode("manual")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "manual" ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"
              )}
            >
              Esquema manual
            </button>
            <button
              onClick={() => switchMode("openapi")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "openapi" ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"
              )}
            >
              OpenAPI / Swagger
            </button>
          </div>
          <ExampleButton onClick={mode === "openapi" ? loadOpenApiExample : loadManualExample} />
        </>
      }
    >
        {mode === "manual" ? (
          <>
            {/* Schema */}
            <div className="space-y-2">
              <div className="ou-label">Esquema de datos</div>
              {rows.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <input
                    value={r.name}
                    onChange={(e) => update(r.id, { name: e.target.value })}
                    placeholder="nombre_campo"
                    className="w-1/2 rounded-control border border-border bg-surface px-3 h-10 font-mono text-sm text-foreground outline-none focus:border-border-strong"
                  />
                  <select
                    value={r.type}
                    onChange={(e) => update(r.id, { type: e.target.value as FieldType })}
                    className="flex-1 rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(r.id)}
                    className="shrink-0 p-2 rounded-control text-foreground-faint hover:text-error-text hover:bg-surface-hover transition-colors"
                    title="Eliminar campo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button onClick={addRow} className="ou-btn ou-btn-secondary">
                <Plus className="h-4 w-4" />
                Añadir campo
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="fd-count" className="ou-label mb-1.5 block">
                  Registros (máx. 1000)
                </label>
                <input
                  id="fd-count"
                  type="number"
                  min={1}
                  max={1000}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                  className="w-28 rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
                />
              </div>
              <div>
                <label htmlFor="fd-table" className="ou-label mb-1.5 block">
                  Nombre (tabla / raíz)
                </label>
                <input
                  id="fd-table"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="w-40 rounded-control border border-border bg-surface px-3 h-10 font-mono text-sm text-foreground outline-none focus:border-border-strong"
                />
              </div>
              <button onClick={() => generateManual()} className="ou-btn ou-btn-accent h-10 px-5">
                <RefreshCw className="h-4 w-4" />
                Generar
              </button>
            </div>

            {/* Format bar */}
            <div className="flex flex-wrap items-center gap-1 rounded-control border border-border bg-surface p-1">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFormat(f.id);
                    if (output) generateManual(rows, count, f.id);
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    format === f.id ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Spec input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="ou-label">Especificación OpenAPI 3 o Swagger 2 (JSON o YAML)</div>
                <label className="ou-btn ou-btn-secondary cursor-pointer py-1.5">
                  <FileUp className="h-4 w-4" />
                  Subir archivo
                  <input
                    type="file"
                    accept=".json,.yaml,.yml,application/json,text/yaml"
                    className="hidden"
                    onChange={(e) => onSpecFile(e.target.files?.[0])}
                  />
                </label>
              </div>
              <textarea
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                onBlur={() => specText.trim() && parseSpec(specText)}
                placeholder='Pega aquí tu Swagger / OpenAPI y pulsa «Analizar» (o sube un archivo .json / .yaml)…'
                spellCheck={false}
                className="h-40 w-full resize-y rounded-panel border border-border bg-surface/50 p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none focus:border-border-strong"
              />
              <div className="flex items-center gap-3">
                <button onClick={() => parseSpec(specText)} className="ou-btn ou-btn-secondary">
                  Analizar
                </button>
                {parseError && <p className="text-sm text-error-text">{parseError}</p>}
              </div>
            </div>

            {parsed && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="ou-label mb-1">
                      {parsed.title}
                      {parsed.version && <span className="text-foreground-faint"> · v{parsed.version}</span>}
                    </div>
                    <p className="text-sm text-foreground-muted">
                      {parsed.endpoints.length} endpoint{parsed.endpoints.length === 1 ? "" : "s"} con cuerpo · {selected.size} seleccionado
                      {selected.size === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <label htmlFor="fd-items" className="ou-label mb-1.5 block">
                        Ítems por lista
                      </label>
                      <input
                        id="fd-items"
                        type="number"
                        min={1}
                        max={50}
                        value={arrayItems}
                        onChange={(e) => setArrayItems(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                        className="w-24 rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
                      />
                    </div>
                    <button
                      onClick={generateOpenApi}
                      disabled={selected.size === 0}
                      className="ou-btn ou-btn-accent h-10 px-5 disabled:opacity-40"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generar
                    </button>
                  </div>
                </div>

                {/* Endpoint list */}
                <ul className="max-h-72 space-y-1 overflow-y-auto custom-scrollbar rounded-panel border border-border bg-surface/40 p-2">
                  {parsed.endpoints.map((ep) => (
                    <li key={ep.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 hover:bg-surface-hover">
                        <input
                          type="checkbox"
                          checked={selected.has(ep.id)}
                          onChange={() => toggleEndpoint(ep.id)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
                            METHOD_COLOR[ep.method] ?? "bg-surface-strong text-foreground-muted"
                          )}
                        >
                          {ep.method}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{ep.path}</span>
                        <span className="hidden shrink-0 gap-1.5 sm:flex">
                          {ep.requestSchema && (
                            <span className="rounded bg-surface-strong px-1.5 py-0.5 text-[10px] text-foreground-faint">req</span>
                          )}
                          {ep.responseSchema && (
                            <span className="rounded bg-surface-strong px-1.5 py-0.5 text-[10px] text-foreground-faint">
                              res {ep.responseStatus}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Output */}
        <div>
          <div className="mb-2 flex items-center justify-end gap-2">
            <button onClick={copy} disabled={!output} className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40">
              {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
              Copiar
            </button>
            <button onClick={download} disabled={!output} className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40">
              <Download className="h-4 w-4" />
            </button>
          </div>
          <CodeBlock
            code={output}
            lang={mode === "openapi" ? "json" : OUT_LANG[format]}
            className="min-h-[280px]"
            placeholder={
              mode === "openapi"
                ? "Analiza tu Swagger, elige endpoints y pulsa «Generar»."
                : "Pulsa «Generar» para crear los datos."
            }
          />
        </div>
    </ToolLayout>
  );
}
