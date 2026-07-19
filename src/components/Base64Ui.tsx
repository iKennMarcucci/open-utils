"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  FileDown,
  FileUp,
  Trash2,
} from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { encodeBase64, decodeBase64, bytesToBase64, base64ToBytes } from "@/lib/base64";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

type Mode = "encode" | "decode";

const COPY: Record<
  Mode,
  {
    heading: string;
    inputLabel: string;
    outputLabel: string;
    placeholder: string;
    idleHint: string;
    downloadName: string;
    counterpartHref: string;
    counterpartLabel: string;
    example: string;
  }
> = {
  encode: {
    heading: "Codificar Base64",
    inputLabel: "Tu texto",
    outputLabel: "Base64",
    placeholder: "Escribe o pega aquí el texto que quieres codificar. Por ejemplo:\n\nHola, mundo 🚀",
    idleHint: "Escribe o pega texto, o carga un archivo, para ver su Base64 aquí.",
    downloadName: "codificado.txt",
    counterpartHref: "/decodificar-base64",
    counterpartLabel: "¿Necesitas el paso inverso? Decodificar Base64",
    example: "Hola, mundo 🚀 — Open Utils codifica esto en Base64.",
  },
  decode: {
    heading: "Decodificar Base64",
    inputLabel: "Tu Base64",
    outputLabel: "Texto",
    placeholder:
      "Pega aquí la cadena en Base64 que quieres decodificar. Por ejemplo:\n\nSG9sYSwgbXVuZG8g8J+agA==",
    idleHint: "Pega una cadena Base64 para ver su texto decodificado aquí.",
    downloadName: "decodificado.txt",
    counterpartHref: "/codificar-base64",
    counterpartLabel: "¿Necesitas el paso inverso? Codificar Base64",
    example: "SG9sYSwgbXVuZG8g8J+agCDigJQgT3BlbiBVdGlscw==",
  },
};

export function Base64Ui({ mode }: { mode: Mode }) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  // Encode-from-file: when set, the output is the file's Base64 rather than the text's.
  const [file, setFile] = useState<{ name: string; base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const c = COPY[mode];

  const textResult = useMemo(() => {
    if (mode === "encode") return { ok: true as const, output: encodeBase64(input) };
    return decodeBase64(input);
  }, [input, mode]);

  const isEmpty = mode === "encode" ? !input.trim() && !file : !input.trim();
  const output = mode === "encode" && file ? file.base64 : textResult.ok ? textResult.output : "";
  const error = mode === "encode" ? null : textResult.ok ? null : textResult.error;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadText = () => {
    saveAs(new Blob([output], { type: "text/plain;charset=utf-8" }), c.downloadName);
  };

  // Decode → save the decoded bytes as a file (works even for binary content).
  const handleDownloadFile = () => {
    const res = base64ToBytes(input);
    if (!res.ok) return;
    saveAs(new Blob([res.bytes as BlobPart], { type: "application/octet-stream" }), "archivo-decodificado");
  };

  const handleEncodeFile = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    setFile({ name: f.name, base64: bytesToBase64(bytes) });
    setInput("");
  };

  const clearAll = () => {
    setInput("");
    setFile(null);
  };

  return (
    <ToolLayout
      slug={mode === "encode" ? "codificar-base64" : "decodificar-base64"}
      actions={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={c.counterpartHref} className="ou-btn ou-btn-secondary">
              <ArrowLeftRight className="h-4 w-4" />
              {mode === "encode" ? "Decodificar" : "Codificar"}
            </Link>
            <ExampleButton onClick={() => { setFile(null); setInput(c.example); }} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode === "encode" ? (
              <button onClick={() => fileInputRef.current?.click()} className="ou-btn ou-btn-secondary">
                <FileUp className="h-4 w-4" />
                Codificar archivo
              </button>
            ) : (
              <button
                onClick={handleDownloadFile}
                disabled={isEmpty || !base64ToBytes(input).ok}
                className="ou-btn ou-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                title="Guardar el contenido decodificado como archivo"
              >
                <FileDown className="h-4 w-4" />
                Descargar como archivo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleEncodeFile(f);
                e.target.value = "";
              }}
            />
            <button onClick={handleCopy} disabled={isEmpty || !!error} className="ou-btn ou-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
              {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            {mode === "encode" && (
              <button onClick={handleDownloadText} disabled={isEmpty} className="ou-btn ou-btn-secondary disabled:opacity-40">
                <Download className="h-4 w-4" />
              </button>
            )}
            <button onClick={clearAll} disabled={isEmpty} className="ou-btn ou-btn-secondary disabled:opacity-40">
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </>
      }
    >
        {/* Encode-from-file banner */}
        {mode === "encode" && file && (
          <div className="flex items-center gap-3 rounded-panel border border-border bg-surface/50 p-3">
            <FileUp className="h-4 w-4 shrink-0 text-accent-text" />
            <p className="min-w-0 truncate text-sm text-foreground-subtle">
              Codificando el archivo <span className="font-medium text-foreground">{file.name}</span>. Escribe en el
              cuadro de texto para volver al modo texto.
            </p>
          </div>
        )}

        {/* Input */}
        <div>
          <label htmlFor="b64-input" className="ou-label mb-2 block">
            {c.inputLabel}
          </label>
          <textarea
            id="b64-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (file) setFile(null);
            }}
            spellCheck={false}
            placeholder={c.placeholder}
            className={cn(
              "w-full min-h-[180px] resize-y rounded-panel border bg-surface/50 p-4",
              "font-mono text-[13px] leading-relaxed text-foreground",
              "outline-none transition-colors placeholder:text-foreground-faint",
              error ? "border-error/60 focus:border-error" : "border-border focus:border-border-strong"
            )}
          />
        </div>

        {/* Output */}
        <div>
          <label htmlFor="b64-output" className="ou-label mb-2 block">
            {c.outputLabel}
          </label>
          <textarea
            id="b64-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="El resultado aparecerá aquí."
            className={cn(
              "w-full min-h-[180px] resize-y rounded-panel border border-border bg-surface/30 p-4",
              "font-mono text-[13px] leading-relaxed break-all text-foreground",
              "outline-none placeholder:text-foreground-faint"
            )}
          />
        </div>

        {/* Status */}
        <div aria-live="polite" className="min-h-[52px]">
          {isEmpty ? (
            <p className="text-sm text-foreground-faint">{c.idleHint}</p>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
              <p className="text-sm text-error-text leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-panel border border-border bg-surface/50 p-4">
              <Check className="h-4 w-4 shrink-0 text-success-text" />
              <p className="text-sm text-foreground-subtle">{output.length.toLocaleString("es")} caracteres.</p>
            </div>
          )}
        </div>

        <p className="text-sm text-foreground-faint">
          <Link href={c.counterpartHref} className="text-accent-text underline-offset-4 hover:underline">
            {c.counterpartLabel}
          </Link>
        </p>
    </ToolLayout>
  );
}
