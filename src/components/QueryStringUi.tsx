"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, Check, Copy, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildUrl,
  parseUrl,
  exportAs,
  EXPORT_LANGS,
  PRESET_GROUPS,
  type Param,
  type ExportLang,
} from "@/lib/query-string";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

let uid = 0;
const withId = (p: Param) => ({ ...p, id: ++uid });
type Row = Param & { id: number };

export function QueryStringUi() {
  const [base, setBase] = useState("");
  const [rows, setRows] = useState<Row[]>([withId({ key: "", value: "", enabled: true })]);
  const [sort, setSort] = useState(false);
  const [importText, setImportText] = useState("");
  const [lang, setLang] = useState<ExportLang>("curl");
  const [copied, setCopied] = useState<string | null>(null);

  const url = useMemo(() => buildUrl(base, rows, sort), [base, rows, sort]);
  const code = useMemo(() => exportAs(lang, url), [lang, url]);

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  const update = (id: number, patch: Partial<Param>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));
  const addRow = () => setRows((rs) => [...rs, withId({ key: "", value: "", enabled: true })]);
  const addPreset = (params: { key: string; value: string }[]) =>
    setRows((rs) => {
      const existing = new Set(rs.map((r) => r.key));
      const fresh = params.filter((p) => !existing.has(p.key)).map((p) => withId({ ...p, enabled: true }));
      const cleaned = rs.filter((r) => r.key.trim() !== "" || r.value.trim() !== "");
      return [...cleaned, ...fresh];
    });

  const doImport = () => {
    const parsed = parseUrl(importText);
    if (parsed.base) setBase(parsed.base);
    if (parsed.params.length) setRows(parsed.params.map(withId));
    setImportText("");
  };

  const loadExample = () => {
    setBase("https://api.ejemplo.com/productos");
    setRows(
      [
        { key: "categoria", value: "libros", enabled: true },
        { key: "page", value: "2", enabled: true },
        { key: "limit", value: "20", enabled: true },
        { key: "sort", value: "precio", enabled: true },
        { key: "order", value: "asc", enabled: true },
      ].map(withId)
    );
  };

  return (
    <ToolLayout
      slug="query-string"
      contentClassName="space-y-6"
      actions={
        <>
          <ExampleButton onClick={loadExample} />
          <button
            onClick={() => setSort((s) => !s)}
            className={cn("ou-btn ou-btn-secondary", sort && "border-accent/50 text-foreground")}
          >
            <ArrowDownAZ className="h-4 w-4" />
            {sort ? "Orden alfabético: sí" : "Ordenar alfabéticamente"}
          </button>
        </>
      }
    >
        {/* Import */}
        <div className="flex flex-wrap gap-2">
          <input
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Pega aquí una URL o query string para importarla…"
            className="min-w-[240px] flex-1 rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
          />
          <button onClick={doImport} disabled={!importText.trim()} className="ou-btn ou-btn-secondary disabled:opacity-40">
            Importar
          </button>
        </div>

        {/* Base URL */}
        <div>
          <label htmlFor="qs-base" className="ou-label mb-1.5 block">
            Base URL
          </label>
          <input
            id="qs-base"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="https://api.ejemplo.com/recurso"
            className="w-full rounded-control border border-border bg-surface px-3 h-11 font-mono text-sm text-foreground outline-none focus:border-border-strong"
          />
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESET_GROUPS.map((g) => (
            <button
              key={g.label}
              onClick={() => addPreset(g.params)}
              className="ou-pill hover:border-border-strong"
              title={`Añadir: ${g.params.map((p) => p.key).join(", ")}`}
            >
              <Plus className="h-3.5 w-3.5" />
              {g.label}
            </button>
          ))}
        </div>

        {/* Params */}
        <div className="space-y-2">
          <div className="ou-label">Parámetros</div>
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) => update(r.id, { enabled: e.target.checked })}
                className="h-4 w-4 shrink-0 accent-[var(--accent-text)]"
                title="Incluir este parámetro"
              />
              <input
                value={r.key}
                onChange={(e) => update(r.id, { key: e.target.value })}
                placeholder="clave"
                className="w-1/3 min-w-0 rounded-control border border-border bg-surface px-3 h-10 font-mono text-sm text-foreground outline-none focus:border-border-strong"
              />
              <input
                value={r.value}
                onChange={(e) => update(r.id, { value: e.target.value })}
                placeholder="valor"
                className="min-w-0 flex-1 rounded-control border border-border bg-surface px-3 h-10 font-mono text-sm text-foreground outline-none focus:border-border-strong"
              />
              <button
                onClick={() => remove(r.id)}
                className="shrink-0 p-2 rounded-control text-foreground-faint hover:text-error-text hover:bg-surface-hover transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={addRow} className="ou-btn ou-btn-secondary">
            <Plus className="h-4 w-4" />
            Añadir parámetro
          </button>
        </div>

        {/* Output */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="ou-label">URL resultante</span>
            <button onClick={() => copy("url", url)} disabled={!url} className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40">
              {copied === "url" ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
              Copiar
            </button>
          </div>
          <div className="overflow-x-auto rounded-panel border border-border bg-surface/50 p-4">
            <code className="break-all font-mono text-sm text-foreground">{url || "—"}</code>
          </div>
        </div>

        {/* Export */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-control border border-border bg-surface p-1">
              {EXPORT_LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    lang === l.id ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button onClick={() => copy("code", code)} className="ou-btn ou-btn-secondary py-1.5">
              {copied === "code" ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
              Copiar código
            </button>
          </div>
          <pre className="overflow-x-auto rounded-panel border border-border bg-surface/50 p-4 font-mono text-[13px] leading-relaxed text-foreground">
            {code}
          </pre>
        </div>
    </ToolLayout>
  );
}
