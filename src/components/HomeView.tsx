"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  FileText,
  ArrowUpRight,
  Video,
  Code,
  Layers,
  Scissors,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = {
  id: string;
  title: string;
  description: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  accent: string; // css color for the category
  span: string; // grid span classes
  featured?: boolean;
  soon?: boolean;
};

const TOOLS: Tool[] = [
  {
    id: "pdf-converter",
    title: "PDF ⇄ IMG",
    description:
      "Convierte PDFs a imágenes de alta calidad o transforma varias imágenes en un único documento. Todo el procesamiento ocurre en tu navegador.",
    href: "/pdf-converter",
    icon: FileText,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    id: "video-converter",
    title: "Video ⇄ GIF",
    description: "Recorta videos y expórtalos como GIF, o convierte GIFs en video.",
    href: "/video-converter",
    icon: Video,
    category: "Multimedia",
    accent: "var(--ds-purple-text)",
    span: "md:col-span-1",
  },
  {
    id: "merge-pdf",
    title: "Unificador PDF",
    description: "Combina PDFs e imágenes en un solo documento paginado y reordenable.",
    href: "/pdf-organizer?mode=merge",
    icon: Layers,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-1",
  },
  {
    id: "pdf-splitter",
    title: "Separador PDF",
    description: "Divide un PDF en paquetes: elige qué páginas van juntas y si salen como PDF o imágenes.",
    href: "/pdf-organizer?mode=split",
    icon: Scissors,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-1",
  },
  {
    id: "json-format",
    title: "Formato JSON",
    description: "Formatea, valida y minifica JSON al instante.",
    icon: Code,
    category: "Desarrollo",
    accent: "var(--ds-amber-text)",
    span: "md:col-span-1",
    soon: true,
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function IconWell({
  icon: Icon,
  accent,
  large,
}: {
  icon: Tool["icon"];
  accent: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-control border border-border bg-surface-strong transition-transform duration-300 group-hover:scale-105",
        large ? "w-14 h-14" : "w-11 h-11"
      )}
      style={{ color: accent }}
    >
      <Icon className={cn(large ? "w-7 h-7" : "w-5 h-5")} />
    </div>
  );
}

function CategoryTag({ label, accent }: { label: string; accent: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 ou-label">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: accent }}
      />
      {label}
    </span>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  const inner = (
    <>
      {/* hover glow tinted by the category accent */}
      {!tool.soon && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, ${tool.accent} 12%, transparent), transparent 60%)`,
          }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between">
        <IconWell icon={Icon} accent={tool.accent} large={tool.featured} />
        {tool.soon ? (
          <span className="ou-badge">
            <Sparkles className="w-3 h-3" /> Próximamente
          </span>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground-faint transition-all duration-300 group-hover:border-border-strong group-hover:text-foreground">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-6">
        <div className="mb-2">
          <CategoryTag label={tool.category} accent={tool.accent} />
        </div>
        <h2
          className={cn(
            "font-semibold tracking-tight text-foreground",
            tool.featured ? "text-2xl md:text-3xl mb-2.5" : "text-lg mb-1.5"
          )}
        >
          {tool.title}
        </h2>
        <p
          className={cn(
            "text-foreground-subtle leading-relaxed",
            tool.featured ? "text-sm md:text-[15px] max-w-md" : "text-[13px]"
          )}
        >
          {tool.description}
        </p>
      </div>
    </>
  );

  const baseClass = cn(
    "group relative flex flex-col overflow-hidden p-5 md:p-6",
    "rounded-panel min-h-[190px]",
    tool.featured && "md:min-h-full rounded-hero",
    tool.span
  );

  if (tool.soon) {
    return (
      <motion.div
        variants={item}
        className={cn(
          baseClass,
          "border border-dashed border-border bg-surface/40 opacity-70"
        )}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className={tool.span}>
      <Link
        href={tool.href!}
        className={cn(baseClass, "ou-card-interactive h-full w-full")}
      >
        {inner}
      </Link>
    </motion.div>
  );
}

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Privado", detail: "Nada se sube a un servidor" },
  { icon: Zap, label: "Instantáneo", detail: "Procesado en tu navegador" },
  { icon: Code, label: "Open source", detail: "Utilidades abiertas" },
];

export function HomeView() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 md:mb-12"
      >
        <span className="ou-badge mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-success-text" />
          100% local · privado
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance">
          Open Utils
        </h1>
        <p className="mt-3 max-w-xl text-base md:text-lg text-foreground-subtle text-pretty">
          Una colección de utilidades rápidas y privadas. Elige una herramienta
          para empezar — todo se procesa en tu navegador.
        </p>
      </motion.header>

      {/* Bento grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(190px,auto)]"
      >
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}

        {/* Identity / trust bento tile */}
        <motion.div
          variants={item}
          className="ou-card rounded-panel p-5 md:p-6 flex flex-col justify-center gap-4"
        >
          <p className="ou-label">Por qué Open Utils</p>
          <div className="flex flex-col gap-3.5">
            {HIGHLIGHTS.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-strong text-foreground-muted">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-foreground-faint leading-snug">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
