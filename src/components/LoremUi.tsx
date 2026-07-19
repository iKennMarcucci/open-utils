"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { generateLorem, type LoremUnit } from "@/lib/lorem";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

const UNITS: { id: LoremUnit; label: string }[] = [
  { id: "paragraphs", label: "Párrafos" },
  { id: "sentences", label: "Frases" },
  { id: "words", label: "Palabras" },
  { id: "characters", label: "Caracteres" },
];

export function LoremUi() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => generateLorem(count, unit), [count, unit]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ToolLayout
      slug="lorem-ipsum"
      actions={
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="lorem-count" className="ou-label mb-1.5 block">
                Cantidad
              </label>
              <input
                id="lorem-count"
                type="number"
                min={1}
                max={unit === "characters" ? 100000 : 5000}
                value={count}
                onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-28 rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
              />
            </div>
            <div
              role="radiogroup"
              aria-label="Unidad"
              className="flex flex-wrap items-center gap-1 rounded-control border border-border bg-surface p-1"
            >
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  role="radio"
                  aria-checked={unit === u.id}
                  onClick={() => setUnit(u.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    unit === u.id
                      ? "bg-surface-strong text-foreground"
                      : "text-foreground-faint hover:text-foreground"
                  )}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <ExampleButton onClick={() => { setCount(2); setUnit("paragraphs"); }} label="Ver ejemplo" />
        </>
      }
    >
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCopy} className="ou-btn ou-btn-secondary">
            {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={() => saveAs(new Blob([output], { type: "text/plain;charset=utf-8" }), "lorem-ipsum.txt")}
            className="ou-btn ou-btn-secondary"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
        </div>

        <div className="overflow-auto rounded-panel border border-border bg-surface/50 p-4">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-subtle">{output}</p>
        </div>
    </ToolLayout>
  );
}
