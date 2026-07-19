"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Check, Copy, Download } from "lucide-react";
import { saveAs } from "file-saver";
import {
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  parseInput,
  serializeOutput,
  CONVERT_EXAMPLE,
  type Format,
} from "@/lib/format-convert";
import { CodeInput } from "@/components/CodeInput";
import { CodeBlock } from "@/components/CodeBlock";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import type { CodeLang } from "@/lib/highlight";

// Map a data Format onto the closest highlighter grammar.
const LANG: Record<string, CodeLang> = {
  json: "json",
  yaml: "yaml",
  csv: "csv",
  xml: "xml",
  html: "html",
  toml: "toml",
  sql: "sql",
  markdown: "markdown",
};
const langOf = (f: Format): CodeLang => LANG[f] ?? "text";

export function FormatConvertUi() {
  const [input, setInput] = useState("");
  const [from, setFrom] = useState<Format>("json");
  const [to, setTo] = useState<Format>("yaml");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = parseInput(input, from);
    if (!parsed.ok) return { ok: false as const, error: parsed.error };
    if (parsed.value === null) return { ok: true as const, output: "" };
    const s = serializeOutput(parsed.value, to, "datos");
    if (!s.ok) return { ok: false as const, error: s.error };
    return { ok: true as const, output: s.value };
  }, [input, from, to]);

  const output = result.ok ? result.output : "";
  const error = result.ok ? null : result.error;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const f = OUTPUT_FORMATS.find((x) => x.id === to)!;
    saveAs(new Blob([output], { type: "text/plain;charset=utf-8" }), `datos.${f.ext}`);
  };

  const selectClass =
    "rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong";

  return (
    <ToolLayout
      slug="convertir-formatos"
      actions={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="ou-label">De</label>
            <select value={from} onChange={(e) => setFrom(e.target.value as Format)} className={selectClass}>
              {INPUT_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <ArrowRight className="h-4 w-4 text-foreground-faint" />
            <label className="ou-label">a</label>
            <select value={to} onChange={(e) => setTo(e.target.value as Format)} className={selectClass}>
              {OUTPUT_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          <ExampleButton onClick={() => { setFrom("json"); setInput(CONVERT_EXAMPLE); }} />
        </>
      }
    >
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="fc-input" className="ou-label mb-2 flex h-8 items-center">
              Entrada ({INPUT_FORMATS.find((f) => f.id === from)?.label})
            </label>
            <CodeInput
              id="fc-input"
              value={input}
              onChange={setInput}
              lang={langOf(from)}
              error={!!error}
              placeholder="Pega aquí tus datos."
            />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex h-8 items-center justify-between">
              <span className="ou-label">Salida ({OUTPUT_FORMATS.find((f) => f.id === to)?.label})</span>
              <div className="flex gap-2">
                <button onClick={copy} disabled={!output} className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40">
                  {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
                  Copiar
                </button>
                <button onClick={download} disabled={!output} className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CodeBlock
              code={output}
              lang={langOf(to)}
              className="min-h-[420px]"
              placeholder="El resultado aparecerá aquí."
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
            <p className="text-sm text-error-text leading-relaxed">{error}</p>
          </div>
        )}
    </ToolLayout>
  );
}
