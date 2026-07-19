"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, Copy, ShieldAlert } from "lucide-react";
import { decodeJwt } from "@/lib/jwt";
import { CodeBlock } from "@/components/CodeBlock";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

// A real, expired demo token (HS256, secret "demo") — safe to ship as an example.
const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function JwtUi() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<"header" | "payload" | null>(null);
  const result = useMemo(() => decodeJwt(input), [input]);

  const copy = async (which: "header" | "payload", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <ToolLayout
      slug="decodificar-jwt"
      actions={<ExampleButton onClick={() => setInput(SAMPLE)} />}
    >
        <div>
          <label htmlFor="jwt-input" className="ou-label mb-2 block">
            Tu token JWT
          </label>
          <textarea
            id="jwt-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Pega aquí el token (header.payload.signature)."
            className="w-full min-h-[120px] resize-y rounded-panel border border-border focus:border-border-strong bg-surface/50 p-4 font-mono text-[13px] leading-relaxed break-all text-foreground outline-none transition-colors placeholder:text-foreground-faint"
          />
        </div>

        {/* Never claims to verify — decoding is not verifying. */}
        <div className="flex items-start gap-3 rounded-panel border border-amber-500/30 bg-amber-500/5 p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-sm text-foreground-subtle leading-relaxed">
            Esta herramienta <strong>decodifica</strong>, no verifica. La firma no se comprueba:
            para eso hace falta la clave secreta y debe hacerse en el servidor. No confíes en el
            contenido de un JWT solo porque se pueda leer aquí.
          </p>
        </div>

        {input.trim() && !result.ok && result.error && (
          <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
            <p className="text-sm text-error-text leading-relaxed">{result.error}</p>
          </div>
        )}

        {result.ok && (
          <div className="space-y-5">
            {result.claims.length > 0 && (
              <div className="rounded-panel border border-border bg-surface/50 p-4">
                <p className="ou-label mb-3">Claims destacados</p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {result.claims.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-xs text-foreground-faint">{c.key}</dt>
                      <dd className="truncate font-mono text-sm text-foreground">
                        {c.value}
                        {c.note && (
                          <span className="ml-2 rounded bg-error/15 px-1.5 py-0.5 text-[11px] text-error-text">
                            {c.note}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {(["header", "payload"] as const).map((which) => (
              <div key={which}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="ou-label">{which === "header" ? "Cabecera (header)" : "Contenido (payload)"}</span>
                  <button
                    onClick={() => copy(which, which === "header" ? result.headerText : result.payloadText)}
                    className="ou-btn ou-btn-secondary py-1.5"
                  >
                    {copied === which ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
                    {copied === which ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <CodeBlock
                  code={which === "header" ? result.headerText : result.payloadText}
                  lang="json"
                />
              </div>
            ))}
          </div>
        )}
    </ToolLayout>
  );
}
