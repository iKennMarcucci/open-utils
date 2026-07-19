"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { getTool } from "@/lib/seo/tools";

/**
 * The single, shared frame for EVERY tool screen. It exists so every tool looks
 * the same: a left-aligned title with a short description, its primary toolbar
 * on the same row (via `actions`), then the tool itself — filling the *entire*
 * container width with a uniform small padding (equal on X and Y), no max-width
 * cap. No tool should set its own outer container, padding or title anymore;
 * they render their controls/panels as `children` and their top button row as
 * `actions`.
 *
 * The frame no longer forces `min-h-screen`: a tall empty tool used to push the
 * crawlable info section below the fold, so the height now follows the content.
 */
function conciseDescription(desc: string): string {
  // First sentence only — drops the "Gratis y sin registro / privacy" tail so
  // the header stays to the point (≤ ~3 lines even on a narrow phone).
  const first = desc.split(/(?<=\.)\s+/)[0];
  return first || desc;
}

export function ToolLayout({
  slug,
  title,
  description,
  children,
  actions,
  contentClassName,
}: {
  /** When set, the title + description default to this tool's SEO copy. */
  slug?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  /** The tool's primary toolbar, rendered on the header row (right side on
   *  desktop, wrapping below the title on narrow screens). */
  actions?: ReactNode;
  /** Extra classes for the content wrapper (defaults to vertical spacing). */
  contentClassName?: string;
}) {
  let tool: ReturnType<typeof getTool> | null = null;
  if (slug) {
    try {
      tool = getTool(slug);
    } catch {
      tool = null;
    }
  }

  const heading = title ?? tool?.name ?? "";
  const desc =
    description ?? (tool ? conciseDescription(tool.description) : undefined);

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="flex w-full flex-col gap-5 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
          <header className="min-w-0 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {heading}
            </h2>
            {desc && (
              <p className="text-sm leading-relaxed text-foreground-muted">
                {desc}
              </p>
            )}
          </header>
          {actions && (
            <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
              {actions}
            </div>
          )}
        </motion.div>

        <div className={cn("min-w-0", contentClassName ?? "space-y-5")}>{children}</div>
      </div>
    </div>
  );
}
