"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, Copy, Download } from "lucide-react";
import { saveAs } from "file-saver";
import { jsonToTypeScript } from "@/lib/json-to-ts";
import { CodeInput } from "@/components/CodeInput";
import { CodeBlock } from "@/components/CodeBlock";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

const SAMPLE = JSON.stringify(
  {
    id: 42,
    name: "Ada",
    active: true,
    roles: ["admin", "editor"],
    profile: { age: 36, city: "Londres" },
    posts: [
      { id: 1, title: "Hola", likes: 10 },
      { id: 2, title: "Mundo", likes: 5, pinned: true },
    ],
  },
  null,
  2
);

export function JsonToTsUi() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => jsonToTypeScript(input, rootName || "Root"), [input, rootName]);
  const output = result.ok ? result.output : "";
  const error = result.ok ? null : result.error;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ToolLayout
      slug="json-a-typescript"
      actions={
        <>
          <div className="min-w-0">
            <label htmlFor="jts-root" className="ou-label mb-1.5 block">
              Nombre de la interfaz raíz
            </label>
            <input
              id="jts-root"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="w-full max-w-[12rem] rounded-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </div>
          <ExampleButton onClick={() => setInput(SAMPLE)} />
        </>
      }
    >
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="jts-input" className="ou-label mb-2 flex h-8 items-center">
              JSON de entrada
            </label>
            <CodeInput
              id="jts-input"
              value={input}
              onChange={setInput}
              lang="json"
              error={!!error}
              placeholder="Pega aquí un JSON de ejemplo."
            />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex h-8 items-center justify-between">
              <span className="ou-label">TypeScript</span>
              <div className="flex gap-2">
                <button onClick={handleCopy} disabled={!output} className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40">
                  {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button
                  onClick={() => saveAs(new Blob([output], { type: "text/plain;charset=utf-8" }), "tipos.ts")}
                  disabled={!output}
                  className="ou-btn ou-btn-secondary py-1.5 disabled:opacity-40"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CodeBlock
              code={output}
              lang="typescript"
              className="min-h-[420px]"
              placeholder="Las interfaces aparecerán aquí."
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
