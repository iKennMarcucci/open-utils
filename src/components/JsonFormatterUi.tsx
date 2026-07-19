"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Minimize2,
  Trash2,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { formatJson, minifyJson, validateJson } from "@/lib/json-format";
import { CodeInput } from "@/components/CodeInput";
import { CodeBlock } from "@/components/CodeBlock";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

const SAMPLE = `{"nombre":"Open Utils","privado":true,"herramientas":["pdf","imagen","video"],"limites":{"conversores":"50MB","editor":"100MB"}}`;

type Action = "format" | "minify";

export function JsonFormatterUi() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [action, setAction] = useState<Action>("format");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation accepts both strict JSON and the "JS object literal" shape
  // (unquoted keys, single quotes, trailing commas) — see json-format.ts.
  const issue = useMemo(() => validateJson(input), [input]);
  const isEmpty = !input.trim();

  // The result is derived live: change the input or the mode and the right pane
  // updates. Both format and minify normalise loose input to real JSON.
  const result = useMemo(
    () => (action === "format" ? formatJson(input, indent) : minifyJson(input)),
    [input, indent, action]
  );
  const output = result.ok ? result.output : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = () => {
    saveAs(new Blob([output], { type: "application/json" }), "datos.json");
  };

  const handleFile = async (file: File) => {
    setInput(await file.text());
  };

  return (
    <ToolLayout
      slug="formato-json"
      actions={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAction("format")}
              className={cn(
                "ou-btn ou-btn-secondary",
                action === "format" && "border-accent/60 text-foreground"
              )}
            >
              <Wand2 className="h-4 w-4" />
              Formatear
            </button>
            <button
              onClick={() => setAction("minify")}
              className={cn(
                "ou-btn ou-btn-secondary",
                action === "minify" && "border-accent/60 text-foreground"
              )}
            >
              <Minimize2 className="h-4 w-4" />
              Minificar
            </button>

            <div
              role="radiogroup"
              aria-label="Indentación"
              className={cn(
                "flex items-center gap-1 rounded-control border border-border bg-surface p-1 transition-opacity",
                action === "minify" && "opacity-40 pointer-events-none"
              )}
            >
              {[2, 4].map((n) => (
                <button
                  key={n}
                  role="radio"
                  aria-checked={indent === n}
                  onClick={() => setIndent(n)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    indent === n
                      ? "bg-surface-strong text-foreground"
                      : "text-foreground-faint hover:text-foreground"
                  )}
                >
                  {n} esp.
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ou-btn ou-btn-secondary"
            >
              <UploadCloud className="h-4 w-4" />
              Abrir
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <ExampleButton onClick={() => setInput(SAMPLE)} />
            <button
              onClick={() => setInput("")}
              disabled={isEmpty}
              className="ou-btn ou-btn-secondary disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </>
      }
    >
        {/* Two panes: input on the left, result on the right */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="json-input" className="ou-label mb-2 flex h-8 items-center">
              Tu JSON
            </label>
            <CodeInput
              id="json-input"
              value={input}
              onChange={setInput}
              lang="json"
              error={!!issue}
              placeholder={`Pega aquí tu JSON o un objeto tipo { clave: valor }.\n\nPor ejemplo:\n${SAMPLE}`}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex h-8 items-center justify-between">
              <span className="ou-label">{action === "format" ? "Formateado" : "Minificado"}</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40"
                >
                  {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CodeBlock
              code={output}
              lang="json"
              className="min-h-[420px]"
              placeholder="El resultado aparecerá aquí."
            />
          </div>
        </div>

        {/* Status */}
        <div aria-live="polite" className="min-h-[52px]">
          {isEmpty ? (
            <p className="text-sm text-foreground-faint">
              Acepta JSON estándar y objetos de JavaScript (<code className="font-mono text-xs">{"{ clave: valor }"}</code>,
              comillas simples, comas finales). Nada se envía a ningún servidor: se procesa en tu navegador.
            </p>
          ) : issue ? (
            <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-error-text">
                  No se pudo interpretar
                  {issue.line ? ` — línea ${issue.line}, columna ${issue.column}` : ""}
                </p>
                <p className="mt-1 text-xs text-foreground-subtle leading-relaxed">
                  {issue.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-panel border border-border bg-surface/50 p-4">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success-text" />
              <p className="text-sm text-foreground-subtle">
                Válido — {output.length.toLocaleString("es")} caracteres de salida.
              </p>
            </div>
          )}
        </div>
    </ToolLayout>
  );
}
