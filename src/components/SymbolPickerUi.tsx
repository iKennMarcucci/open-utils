"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { GLYPH_GROUPS, type Glyph } from "@/lib/symbols";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";

export function SymbolPickerUi() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLYPH_GROUPS;
    return GLYPH_GROUPS.map((g) => ({
      ...g,
      glyphs: g.glyphs.filter((x) => x.name.includes(q) || x.char === query.trim()),
    })).filter((g) => g.glyphs.length > 0);
  }, [query]);

  const copy = async (g: Glyph) => {
    await navigator.clipboard.writeText(g.char);
    setCopied(g.char);
    setTimeout(() => setCopied((c) => (c === g.char ? null : c)), 1400);
  };

  return (
    <ToolLayout slug="simbolos-emojis">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca: flecha, corazón, euro, fuego…"
              className="w-full rounded-control border border-border bg-surface pl-9 pr-3 h-10 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </div>
          <ExampleButton onClick={() => setQuery("flecha")} label="Ver ejemplo" />
        </div>

        {groups.length === 0 ? (
          <p className="text-center text-sm text-foreground-faint">Sin resultados para “{query}”.</p>
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <section key={group.id}>
                <p className="ou-label mb-3">{group.label}</p>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {group.glyphs.map((g) => (
                    <button
                      key={g.char + g.name}
                      onClick={() => copy(g)}
                      title={`${g.char} — ${g.name} (clic para copiar)`}
                      className="relative flex aspect-square items-center justify-center rounded-control border border-border bg-surface/50 text-2xl transition-colors hover:border-border-strong hover:bg-surface-hover"
                    >
                      <span aria-hidden>{g.char}</span>
                      {copied === g.char && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-control bg-surface/90">
                          <Check className="h-4 w-4 text-success-text" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <p className="text-sm text-foreground-faint">
          Pulsa cualquier símbolo para copiarlo al portapapeles.
        </p>
    </ToolLayout>
  );
}
