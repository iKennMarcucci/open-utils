"use client";

import { useRef, useState, type ReactNode } from "react";
import { UploadCloud, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The single, shared empty-state file input for EVERY tool.
 *
 * Before a file exists, every tool used to roll its own drop area — different
 * borders, backgrounds, heights and copy. This unifies that first impression:
 * one canonical dashed dropzone, click- or drag-to-open, single or multiple.
 * Once a file is loaded each tool renders its own (larger) working UI, so the
 * expansion after a file is added stays tool-specific by design.
 */
export function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  title,
  subtitle = "o haz clic para seleccionarlo",
  hint,
  icon: Icon = UploadCloud,
  example,
  size = "default",
  disabled = false,
  className,
}: {
  /** Receives the picked files (drag or dialog). Tools for a single file read `files[0]`. */
  onFiles: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  /** Primary line, e.g. "Suelta tu PDF aquí". */
  title: string;
  /** Secondary line under the title. */
  subtitle?: string;
  /** Small hint line below (size/format limits, etc.). */
  hint?: ReactNode;
  /** Defaults to the upload-cloud glyph. */
  icon?: LucideIcon;
  /** Optional "Ver ejemplo" button rendered inside the zone. */
  example?: ReactNode;
  /** `compact` for secondary "add more" zones; `default` for the main empty state. */
  size?: "default" | "compact";
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled && e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-4 rounded-panel border-2 border-dashed p-8 text-center transition-all",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        size === "compact" ? "min-h-[180px]" : "min-h-[300px]",
        dragging
          ? "border-accent bg-accent-subtle"
          : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-strong transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-8 w-8 text-foreground-muted" />
      </div>
      <div>
        <p className="text-lg font-medium text-foreground">{title}</p>
        {subtitle && <p className="mt-1 text-sm text-foreground-subtle">{subtitle}</p>}
      </div>
      {hint && (
        <div className="flex items-center gap-2 text-xs text-foreground-faint">{hint}</div>
      )}
      {example && <div onClick={(e) => e.stopPropagation()}>{example}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
