"use client";

import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { CASES, toCase, CASE_EXAMPLE, type CaseId } from "@/lib/text-case";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

export function TextCaseUi() {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<CaseId | null>(null);

  const copy = async (id: CaseId, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
  };

  const isEmpty = !input.trim();

  return (
    <ToolLayout
      slug="convertir-mayusculas"
      actions={
        <>
          <ExampleButton onClick={() => setInput(CASE_EXAMPLE)} />
          <button
            onClick={() => setInput("")}
            disabled={isEmpty}
            className="ou-btn ou-btn-secondary disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar
          </button>
        </>
      }
    >
        <div>
          <label htmlFor="tc-input" className="ou-label mb-2 block">
            Tu texto
          </label>
          <textarea
            id="tc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Escribe o pega tu texto. Reconoce camelCase, snake_case, kebab-case y espacios."
            className="w-full min-h-[120px] resize-y rounded-panel border border-border focus:border-border-strong bg-surface/50 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-foreground-faint"
          />
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {CASES.map(({ id, label }) => {
            const value = isEmpty ? "" : toCase(input, id);
            return (
              <button
                key={id}
                onClick={() => value && copy(id, value)}
                disabled={!value}
                className="group flex items-center justify-between gap-3 rounded-panel border border-border bg-surface/50 p-3 text-left transition-colors hover:border-border-strong disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="min-w-0">
                  <span className="ou-label block">{label}</span>
                  <span className="mt-0.5 block truncate font-mono text-sm text-foreground">
                    {value || "—"}
                  </span>
                </span>
                <span className="shrink-0 text-foreground-faint group-hover:text-foreground transition-colors">
                  {copiedId === id ? (
                    <Check className="h-4 w-4 text-success-text" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-foreground-faint">
          Pulsa cualquier formato para copiarlo.
        </p>
    </ToolLayout>
  );
}
