"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { highlight, type CodeLang } from "@/lib/highlight";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  lang: CodeLang;
  placeholder?: string;
  error?: boolean;
  className?: string;
  minHeight?: number;
  "aria-label"?: string;
};

/**
 * Editable, syntax-highlighted textarea. A transparent <textarea> sits on top of
 * a coloured <pre> that mirrors its text, so the user edits plain text while
 * seeing the key/value structure in colour. Both layers share identical metrics
 * (see `.ou-code-input` in globals.css) so the caret stays aligned. The panel
 * auto-grows with its content down to `minHeight`.
 */
export function CodeInput({
  id,
  value,
  onChange,
  lang,
  placeholder,
  error,
  className,
  minHeight = 420,
  "aria-label": ariaLabel,
}: Props) {
  // A trailing newline needs a filler char, otherwise the <pre> collapses the
  // last empty line and the two layers drift by one row.
  const html = useMemo(() => highlight(value, lang) + (value.endsWith("\n") ? " " : ""), [value, lang]);

  return (
    <div
      className={cn(
        "ou-code-input rounded-panel border bg-surface/50 transition-colors",
        error ? "border-error/60 focus-within:border-error" : "border-border focus-within:border-border-strong",
        className
      )}
      style={{ minHeight }}
    >
      <pre className="ou-code p-4" aria-hidden="true" style={{ minHeight }}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        aria-label={ariaLabel}
        className="p-4 placeholder:text-foreground-faint"
      />
    </div>
  );
}
