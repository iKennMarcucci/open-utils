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
  Pencil,
  Brush,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  accent: string; // css color for the category
  span: string; // grid span classes
  featured?: boolean;
};

/**
 * Every tool is a real, statically-linked route. Nothing here is derived from
 * component state: a crawler must see all nine links in the initial HTML.
 */
const TOOLS: Tool[] = [
  {
    id: "editor-pdf",
    title: "Editor de PDF",
    description:
      "Dibuja, resalta, escribe, agrega formas, flechas e imágenes sobre tus PDFs. Rota, reordena y elimina páginas — como Adobe o Edge, pero 100% en tu navegador.",
    href: "/editor-pdf",
    icon: Pencil,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    id: "editor-imagen",
    title: "Editor de Imagen",
    description:
      "Dibuja a mano, encierra en cuadros de colores, resalta, escribe texto y agrega formas sobre cualquier imagen. Exporta en PNG o JPG.",
    href: "/editor-imagen",
    icon: Brush,
    category: "Multimedia",
    accent: "var(--ds-teal-text)",
    span: "md:col-span-1",
  },
  {
    id: "pdf-a-imagen",
    title: "PDF a imagen",
    description:
      "Convierte cada página de un PDF en una imagen JPG o PNG de alta calidad.",
    href: "/pdf-a-imagen",
    icon: ImageIcon,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-1",
  },
  {
    id: "imagen-a-pdf",
    title: "Imagen a PDF",
    description:
      "Combina varias imágenes en un solo PDF y ordénalas arrastrándolas. Una página por imagen, a su tamaño exacto.",
    href: "/imagen-a-pdf",
    icon: FileText,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-1",
  },
  {
    id: "unir-pdf",
    title: "Unir PDF",
    description: "Combina varios PDFs e imágenes en un solo documento reordenable.",
    href: "/unir-pdf",
    icon: Layers,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-1",
  },
  {
    id: "dividir-pdf",
    title: "Dividir PDF",
    description:
      "Divide un PDF en paquetes: elige qué páginas van juntas y si salen como PDF o imágenes.",
    href: "/dividir-pdf",
    icon: Scissors,
    category: "Documentos",
    accent: "var(--ds-blue-text)",
    span: "md:col-span-1",
  },
  {
    id: "video-a-gif",
    title: "Video a GIF",
    description: "Recorta el fragmento que quieras de un video y expórtalo como GIF.",
    href: "/video-a-gif",
    icon: Video,
    category: "Multimedia",
    accent: "var(--ds-purple-text)",
    span: "md:col-span-1",
  },
  {
    id: "gif-a-video",
    title: "GIF a video",
    description: "Convierte un GIF animado en un video MP4, mucho más ligero.",
    href: "/gif-a-video",
    icon: Film,
    category: "Multimedia",
    accent: "var(--ds-purple-text)",
    span: "md:col-span-1",
  },
  {
    id: "formato-json",
    title: "Formato JSON",
    description: "Formatea, valida y minifica JSON al instante, sin enviarlo a ningún servidor.",
    href: "/formato-json",
    icon: Code,
    category: "Desarrollo",
    accent: "var(--ds-amber-text)",
    span: "md:col-span-1",
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

  return (
    <motion.div variants={item} className={tool.span}>
      <Link
        href={tool.href}
        className={cn(
          "group relative flex flex-col overflow-hidden p-5 md:p-6",
          "rounded-panel min-h-[190px]",
          tool.featured && "md:min-h-full rounded-hero",
          "ou-card-interactive h-full w-full"
        )}
      >
        {/* hover glow tinted by the category accent */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, ${tool.accent} 12%, transparent), transparent 60%)`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <IconWell icon={Icon} accent={tool.accent} large={tool.featured} />
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground-faint transition-all duration-300 group-hover:border-border-strong group-hover:text-foreground">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>

        <div className="relative z-10 mt-auto pt-6">
          <div className="mb-2">
            <CategoryTag label={tool.category} accent={tool.accent} />
          </div>
          {/* h3, not h2: the page h1 and the section h2s live in the server content. */}
          <h3
            className={cn(
              "font-semibold tracking-tight text-foreground",
              tool.featured ? "text-2xl md:text-3xl mb-2.5" : "text-lg mb-1.5"
            )}
          >
            {tool.title}
          </h3>
          <p
            className={cn(
              "text-foreground-subtle leading-relaxed",
              tool.featured ? "text-sm md:text-[15px] max-w-md" : "text-[13px]"
            )}
          >
            {tool.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Privado", detail: "Nada se sube a un servidor" },
  { icon: Zap, label: "Instantáneo", detail: "Procesado en tu navegador" },
  { icon: Code, label: "Open source", detail: "Licencia MIT, auditable" },
];

export function HomeView() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
      {/* Header. Deliberately NOT animated from opacity:0 — the h1 is the LCP
          element, and fading it in makes LCP wait for framer-motion to hydrate. */}
      <header className="mb-10 md:mb-12">
        <span className="ou-badge mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-success-text" />
          100% local · privado
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance">
          Utilidades de archivos que funcionan en tu navegador, sin subir nada
        </h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground-subtle text-pretty">
          Edita, convierte, une y divide PDF, imágenes y video sin registrarte y sin que
          tus archivos salgan de tu equipo. Gratis, sin marca de agua y de código abierto.
        </p>
      </header>

      <h2 className="sr-only">Herramientas disponibles</h2>

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
