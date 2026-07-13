"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
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

const SAMPLE = `{"nombre":"Open Utils","privado":true,"herramientas":["pdf","imagen","video"],"limites":{"conversores":"50MB","editor":"100MB"}}`;

export function JsonFormatterUi() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation is cheap and synchronous — no debounce needed, and it keeps the
  // status light in sync with whatever is in the textarea right now.
  const issue = useMemo(() => validateJson(input), [input]);
  const isEmpty = !input.trim();

  const apply = (fn: (v: string) => ReturnType<typeof formatJson>) => {
    const result = fn(input);
    if (result.ok) setInput(result.output);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = () => {
    saveAs(new Blob([input], { type: "application/json" }), "datos.json");
  };

  const handleFile = async (file: File) => {
    setInput(await file.text());
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 sm:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4"
        >
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">Formato JSON</h2>
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => apply((v) => formatJson(v, indent))}
              disabled={isEmpty || !!issue}
              className="ou-btn ou-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Wand2 className="h-4 w-4" />
              Formatear
            </button>
            <button
              onClick={() => apply(minifyJson)}
              disabled={isEmpty || !!issue}
              className="ou-btn ou-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minimize2 className="h-4 w-4" />
              Minificar
            </button>

            <div
              role="radiogroup"
              aria-label="Indentación"
              className="flex items-center gap-1 rounded-control border border-border bg-surface p-1"
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
            <button
              onClick={handleCopy}
              disabled={isEmpty}
              className="ou-btn ou-btn-secondary disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button
              onClick={handleDownload}
              disabled={isEmpty || !!issue}
              className="ou-btn ou-btn-secondary disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Descargar
            </button>
            <button
              onClick={() => setInput("")}
              disabled={isEmpty}
              className="ou-btn ou-btn-secondary disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="json-input" className="ou-label mb-2 block">
            Tu JSON
          </label>
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={`Pega aquí tu JSON. Por ejemplo:\n\n${SAMPLE}`}
            className={cn(
              "w-full min-h-[420px] resize-y rounded-panel border bg-surface/50 p-4",
              "font-mono text-[13px] leading-relaxed text-foreground",
              "outline-none transition-colors placeholder:text-foreground-faint",
              issue ? "border-error/60 focus:border-error" : "border-border focus:border-border-strong"
            )}
          />
        </div>

        {/* Status */}
        <div aria-live="polite" className="min-h-[52px]">
          {isEmpty ? (
            <p className="text-sm text-foreground-faint">
              Nada se envía a ningún servidor: el JSON se procesa con el motor de tu propio
              navegador.
            </p>
          ) : issue ? (
            <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-error-text">
                  JSON no válido
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
                JSON válido — {input.length.toLocaleString("es")} caracteres.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
