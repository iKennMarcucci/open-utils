"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { highlight, type CodeLang } from "@/lib/highlight";

type Props = {
  code: string;
  lang: CodeLang;
  className?: string;
  /** Placeholder text shown (dimmed) when `code` is empty. */
  placeholder?: string;
};

/**
 * Read-only, syntax-highlighted code panel. Used for every "output" pane
 * (formatted JSON, generated TypeScript, converted formats, fake data…). The
 * colours come from `.ou-code .token.*` in globals.css and follow the theme.
 */
export function CodeBlock({ code, lang, className, placeholder }: Props) {
  const html = useMemo(() => highlight(code, lang), [code, lang]);

  return (
    <pre
      className={cn(
        "ou-code overflow-auto rounded-panel border border-border bg-surface/50 p-4 font-mono text-[13px] leading-relaxed",
        className
      )}
    >
      {code ? (
        <code dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code className="text-foreground-faint">{placeholder ?? ""}</code>
      )}
    </pre>
  );
}
