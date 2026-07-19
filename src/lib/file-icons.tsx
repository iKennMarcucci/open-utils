/**
 * Per-extension file icons + colours, à la VS Code's "Material Icon Theme".
 * Every file type resolves to a Lucide icon and a distinctive colour so the ZIP
 * explorer can be scanned by shape/colour rather than by reading names.
 */
import {
  Database,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileCog,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileTerminal,
  FileText,
  FileType,
  FileVideo,
  Folder,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

export type FileVisual = { Icon: LucideIcon; color: string };

// One entry per extension. Keep the table flat and explicit — it reads as a
// legend and is trivial to extend.
const BY_EXT: Record<string, FileVisual> = {
  // Web / code
  js: { Icon: FileCode, color: "#f1dd35" },
  mjs: { Icon: FileCode, color: "#f1dd35" },
  cjs: { Icon: FileCode, color: "#f1dd35" },
  ts: { Icon: FileCode, color: "#3178c6" },
  tsx: { Icon: FileCode, color: "#3178c6" },
  jsx: { Icon: FileCode, color: "#61dafb" },
  vue: { Icon: FileCode, color: "#41b883" },
  html: { Icon: FileCode, color: "#e34c26" },
  htm: { Icon: FileCode, color: "#e34c26" },
  css: { Icon: FileCode, color: "#42a5f5" },
  scss: { Icon: FileCode, color: "#c6538c" },
  sass: { Icon: FileCode, color: "#c6538c" },
  less: { Icon: FileCode, color: "#2a6db3" },
  php: { Icon: FileCode, color: "#8993be" },
  py: { Icon: FileCode, color: "#3572a5" },
  rb: { Icon: FileCode, color: "#cc342d" },
  go: { Icon: FileCode, color: "#00add8" },
  rs: { Icon: FileCode, color: "#dea584" },
  java: { Icon: FileCode, color: "#e76f00" },
  kt: { Icon: FileCode, color: "#a97bff" },
  c: { Icon: FileCode, color: "#5c9dd6" },
  h: { Icon: FileCode, color: "#5c9dd6" },
  cpp: { Icon: FileCode, color: "#5c9dd6" },
  cs: { Icon: FileCode, color: "#68217a" },
  swift: { Icon: FileCode, color: "#f05138" },
  dart: { Icon: FileCode, color: "#0175c2" },

  // Data / config
  json: { Icon: FileJson, color: "#cbcb41" },
  json5: { Icon: FileJson, color: "#cbcb41" },
  xml: { Icon: FileCode, color: "#f1662a" },
  yaml: { Icon: FileCog, color: "#cb171e" },
  yml: { Icon: FileCog, color: "#cb171e" },
  toml: { Icon: FileCog, color: "#9c4221" },
  ini: { Icon: FileCog, color: "#8a8a8a" },
  env: { Icon: FileCog, color: "#dcdc57" },
  conf: { Icon: FileCog, color: "#8a8a8a" },
  config: { Icon: FileCog, color: "#8a8a8a" },
  lock: { Icon: FileCog, color: "#8a8a8a" },
  sql: { Icon: Database, color: "#f29111" },
  db: { Icon: Database, color: "#f29111" },

  // Docs / text
  md: { Icon: FileText, color: "#42a5f5" },
  mdx: { Icon: FileText, color: "#42a5f5" },
  txt: { Icon: FileText, color: "#9aa0a6" },
  rtf: { Icon: FileText, color: "#9aa0a6" },
  pdf: { Icon: FileType, color: "#e53935" },
  doc: { Icon: FileText, color: "#2b579a" },
  docx: { Icon: FileText, color: "#2b579a" },
  log: { Icon: FileText, color: "#9aa0a6" },

  // Spreadsheets / tabular
  csv: { Icon: FileSpreadsheet, color: "#21a366" },
  tsv: { Icon: FileSpreadsheet, color: "#21a366" },
  xls: { Icon: FileSpreadsheet, color: "#21a366" },
  xlsx: { Icon: FileSpreadsheet, color: "#21a366" },

  // Images
  png: { Icon: FileImage, color: "#26a69a" },
  jpg: { Icon: FileImage, color: "#26a69a" },
  jpeg: { Icon: FileImage, color: "#26a69a" },
  gif: { Icon: FileImage, color: "#26a69a" },
  webp: { Icon: FileImage, color: "#26a69a" },
  bmp: { Icon: FileImage, color: "#26a69a" },
  avif: { Icon: FileImage, color: "#26a69a" },
  ico: { Icon: FileImage, color: "#26a69a" },
  svg: { Icon: FileImage, color: "#ffb300" },

  // Media
  mp4: { Icon: FileVideo, color: "#ec407a" },
  mov: { Icon: FileVideo, color: "#ec407a" },
  webm: { Icon: FileVideo, color: "#ec407a" },
  mkv: { Icon: FileVideo, color: "#ec407a" },
  avi: { Icon: FileVideo, color: "#ec407a" },
  mp3: { Icon: FileAudio, color: "#ff7043" },
  wav: { Icon: FileAudio, color: "#ff7043" },
  ogg: { Icon: FileAudio, color: "#ff7043" },
  flac: { Icon: FileAudio, color: "#ff7043" },

  // Archives
  zip: { Icon: FileArchive, color: "#a1887f" },
  rar: { Icon: FileArchive, color: "#a1887f" },
  tar: { Icon: FileArchive, color: "#a1887f" },
  gz: { Icon: FileArchive, color: "#a1887f" },
  "7z": { Icon: FileArchive, color: "#a1887f" },

  // Shell
  sh: { Icon: FileTerminal, color: "#89e051" },
  bash: { Icon: FileTerminal, color: "#89e051" },
  zsh: { Icon: FileTerminal, color: "#89e051" },
};

// Special-cased whole filenames (no extension, or the extension is misleading).
const BY_NAME: Record<string, FileVisual> = {
  dockerfile: { Icon: FileCog, color: "#2496ed" },
  ".gitignore": { Icon: FileCog, color: "#8a8a8a" },
  ".env": { Icon: FileCog, color: "#dcdc57" },
  license: { Icon: FileText, color: "#d4b106" },
  readme: { Icon: FileText, color: "#42a5f5" },
  "package.json": { Icon: FileJson, color: "#8bc34a" },
};

const DEFAULT: FileVisual = { Icon: File, color: "var(--foreground-faint)" };

export function extOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : "";
}

/** Resolve the icon + colour for a file path. */
export function fileVisual(path: string): FileVisual {
  const base = (path.split("/").pop() ?? path).toLowerCase();
  if (BY_NAME[base]) return BY_NAME[base];
  const stem = base.replace(/\.[^.]+$/, "");
  if (BY_NAME[stem]) return BY_NAME[stem];
  return BY_EXT[extOf(path)] ?? DEFAULT;
}

export const FOLDER_VISUAL: FileVisual = { Icon: Folder, color: "#f5a623" };
export const FOLDER_OPEN_VISUAL: FileVisual = { Icon: FolderOpen, color: "#f5a623" };

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "avif", "ico", "svg"]);
const TEXT_EXTS = new Set([
  "txt", "md", "mdx", "json", "json5", "js", "mjs", "cjs", "ts", "tsx", "jsx", "css",
  "scss", "sass", "less", "html", "htm", "xml", "svg", "csv", "tsv", "yaml", "yml",
  "toml", "ini", "env", "conf", "config", "sql", "py", "rb", "go", "rs", "java", "kt",
  "c", "h", "cpp", "cs", "php", "sh", "bash", "zsh", "log", "vue", "dart", "swift",
]);

export type FileKind = "image" | "text" | "binary";

export function fileKind(path: string): FileKind {
  const ext = extOf(path);
  if (IMAGE_EXTS.has(ext)) return "image";
  if (TEXT_EXTS.has(ext)) return "text";
  return "binary";
}

/** Best-effort mapping from a filename to a highlighter language id. */
export function langOf(path: string): import("./highlight").CodeLang {
  const ext = extOf(path);
  const map: Record<string, import("./highlight").CodeLang> = {
    json: "json", json5: "json",
    yaml: "yaml", yml: "yaml",
    toml: "toml",
    csv: "csv", tsv: "csv",
    xml: "xml", svg: "xml",
    html: "html", htm: "html",
    css: "css", scss: "css", sass: "css", less: "css",
    sql: "sql",
    md: "markdown", mdx: "markdown",
    ts: "typescript", tsx: "typescript", js: "typescript", mjs: "typescript",
    cjs: "typescript", jsx: "jsx",
  };
  return map[ext] ?? "text";
}
