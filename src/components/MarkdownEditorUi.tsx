"use client";

import { useMemo, useState } from "react";
import { Check, Code2, Copy, Download, Eye, SquareSplitHorizontal } from "lucide-react";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { renderMarkdown, MARKDOWN_EXAMPLE } from "@/lib/markdown";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

type View = "split" | "editor" | "preview";

const PROSE = cn(
  "max-w-none text-sm leading-relaxed text-foreground-subtle",
  "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3",
  "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2.5",
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2",
  "[&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
  "[&_a]:text-accent-text [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:text-foreground [&_strong]:font-semibold",
  "[&_code]:rounded [&_code]:bg-surface-strong [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-panel [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface-strong [&_pre]:p-4",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_hr]:my-6 [&_hr]:border-border",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-surface-strong [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:p-2",
  "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-panel"
);

export function MarkdownEditorUi() {
  const [md, setMd] = useState("");
  const [view, setView] = useState<View>("split");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => renderMarkdown(md), [md]);

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const fullHtmlDoc = `<!doctype html>\n<html lang="es">\n<head><meta charset="utf-8"><title>Documento</title></head>\n<body>\n${html}\n</body>\n</html>\n`;

  return (
    <ToolLayout
      slug="editor-markdown"
      actions={
        <>
          <div className="flex items-center gap-2">
            <ExampleButton onClick={() => setMd(MARKDOWN_EXAMPLE)} />
            <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
              {([
                { id: "editor", icon: Code2, label: "Editor" },
                { id: "split", icon: SquareSplitHorizontal, label: "Dividido" },
                { id: "preview", icon: Eye, label: "Vista previa" },
              ] as const).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  title={v.label}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    view === v.id ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyHtml} disabled={!md.trim()} className="ou-btn ou-btn-secondary disabled:opacity-40">
              {copied ? <Check className="h-4 w-4 text-success-text" /> : <Copy className="h-4 w-4" />}
              Copiar HTML
            </button>
            <button
              onClick={() => saveAs(new Blob([md], { type: "text/markdown;charset=utf-8" }), "documento.md")}
              disabled={!md.trim()}
              className="ou-btn ou-btn-secondary disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              .md
            </button>
            <button
              onClick={() => saveAs(new Blob([fullHtmlDoc], { type: "text/html;charset=utf-8" }), "documento.html")}
              disabled={!md.trim()}
              className="ou-btn ou-btn-secondary disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              .html
            </button>
          </div>
        </>
      }
    >
        <div className={cn("grid gap-4 grid-cols-1", view === "split" && "lg:grid-cols-2")}>
          {view !== "preview" && (
            <textarea
              value={md}
              onChange={(e) => setMd(e.target.value)}
              spellCheck={false}
              placeholder="Escribe Markdown aquí…"
              className="min-h-[520px] w-full min-w-0 resize-y rounded-panel border border-border focus:border-border-strong bg-surface/50 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-foreground-faint"
            />
          )}
          {view !== "editor" && (
            <div className="min-h-[520px] min-w-0 overflow-auto rounded-panel border border-border bg-surface/30 p-5">
              {md.trim() ? (
                <div className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <p className="text-sm text-foreground-faint">La vista previa aparecerá aquí.</p>
              )}
            </div>
          )}
        </div>
    </ToolLayout>
  );
}
