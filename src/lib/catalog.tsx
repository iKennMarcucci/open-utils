/**
 * Presentation registry: the one place that maps tools and categories to their
 * icon and accent colour.
 *
 * This is deliberately *not* in `tools.ts` / `categories.ts`: those hold the
 * SEO content (text only, importable by the OG-image renderer and the build-time
 * SEO checker), while icons are React components and accents are design-system
 * tokens. Keeping presentation here means adding a tool is "one entry in
 * tools.ts + one icon here", and it shows up — grouped and styled — in the
 * sidebar, the home and its category page automatically.
 */
import {
  FileText,
  Image as ImageIcon,
  Layers,
  Scissors,
  Pencil,
  Brush,
  Video,
  Film,
  Code,
  Binary,
  Type,
  Clapperboard,
  CaseSensitive,
  Pilcrow,
  KeyRound,
  Braces,
  Smile,
  Hash,
  Link2,
  Database,
  Replace,
  LayoutTemplate,
  Star,
  FileImage,
  Shrink,
  Stamp,
  FolderArchive,
  PackageOpen,
  FileSearch,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/lib/seo/tools";

/** Icon per tool slug. Every slug in TOOL_ORDER must have an entry. */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  "editor-pdf": Pencil,
  "editor-imagen": Brush,
  "pdf-a-imagen": ImageIcon,
  "imagen-a-pdf": FileText,
  "unir-pdf": Layers,
  "dividir-pdf": Scissors,
  "video-a-gif": Video,
  "gif-a-video": Film,
  "formato-json": Code,
  "codificar-base64": Binary,
  "decodificar-base64": Type,
  "convertir-mayusculas": CaseSensitive,
  "lorem-ipsum": Pilcrow,
  "decodificar-jwt": KeyRound,
  "json-a-typescript": Braces,
  "simbolos-emojis": Smile,
  "editor-markdown": Hash,
  "query-string": Link2,
  "datos-falsos": Database,
  "convertir-formatos": Replace,
  "imagen-placeholder": LayoutTemplate,
  "generar-favicon": Star,
  "svg-a-png": FileImage,
  "comprimir-imagen": Shrink,
  "marca-de-agua": Stamp,
  "comprimir-zip": FolderArchive,
  "descomprimir-zip": PackageOpen,
  "ver-metadatos": FileSearch,
};

export const TOOL_FALLBACK_ICON: LucideIcon = FileText;

export type CategoryVisual = {
  icon: LucideIcon;
  /** CSS custom property with the category accent colour. */
  accent: string;
};

export const CATEGORY_VISUALS: Record<CategoryId, CategoryVisual> = {
  documentos: { icon: FileText, accent: "var(--ds-blue-text)" },
  "imagen-y-video": { icon: Clapperboard, accent: "var(--ds-teal-text)" },
  desarrollo: { icon: Code, accent: "var(--ds-amber-text)" },
};
