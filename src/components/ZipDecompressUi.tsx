"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronRight,
  Download,
  FolderTree,
  Home,
  Layers,
  UploadCloud,
  X,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/canvas";
import { CodeBlock } from "@/components/CodeBlock";
import { ToolLayout } from "@/components/ToolLayout";
import {
  fileKind,
  fileVisual,
  FOLDER_VISUAL,
  FOLDER_OPEN_VISUAL,
  langOf,
} from "@/lib/file-icons";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";

type Entry = { path: string; dir: boolean; size: number; getBlob: () => Promise<Blob> };

type TreeNode = {
  name: string;
  path: string;
  dir: boolean;
  size: number;
  entry?: Entry;
  children: TreeNode[];
};

type ViewMode = "tree" | "tabs" | "explorer";

const MAX_PREVIEW_BYTES = 2_000_000; // don't read huge blobs into memory
const MAX_HIGHLIGHT_CHARS = 200_000; // beyond this, skip syntax highlighting

// ── Tree construction ────────────────────────────────────────────────────────
function buildTree(entries: Entry[]): TreeNode {
  const root: TreeNode = { name: "", path: "", dir: true, size: 0, children: [] };
  for (const e of entries) {
    const parts = e.path.replace(/\/+$/, "").split("/").filter(Boolean);
    let cur = root;
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");
      let child = cur.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path, dir: isLast ? e.dir : true, size: 0, children: [] };
        cur.children.push(child);
      }
      if (isLast && !e.dir) {
        child.dir = false;
        child.size = e.size;
        child.entry = e;
      }
      cur = child;
    });
  }
  sortTree(root);
  return root;
}

function sortTree(node: TreeNode) {
  node.children.sort((a, b) => {
    if (a.dir !== b.dir) return a.dir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}

function nodeAt(root: TreeNode, path: string): TreeNode | null {
  if (!path) return root;
  const parts = path.split("/").filter(Boolean);
  let cur: TreeNode | undefined = root;
  for (const part of parts) {
    cur = cur?.children.find((c) => c.name === part);
    if (!cur) return null;
  }
  return cur ?? null;
}

// ── File preview (text / image / binary) ─────────────────────────────────────
function FilePreview({ entry }: { entry: Entry | null }) {
  const [state, setState] = useState<
    | { status: "empty" }
    | { status: "loading" }
    | { status: "text"; text: string; truncated: boolean }
    | { status: "image"; url: string }
    | { status: "binary"; reason: "type" | "size" }
  >({ status: "empty" });

  useEffect(() => {
    if (!entry) {
      setState({ status: "empty" });
      return;
    }
    let url: string | null = null;
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      const kind = fileKind(entry.path);
      if (kind !== "image" && entry.size > MAX_PREVIEW_BYTES) {
        setState({ status: "binary", reason: "size" });
        return;
      }
      try {
        const blob = await entry.getBlob();
        if (cancelled) return;
        if (kind === "image") {
          url = URL.createObjectURL(blob);
          setState({ status: "image", url });
        } else if (kind === "text") {
          const raw = await blob.text();
          if (cancelled) return;
          const truncated = raw.length > MAX_HIGHLIGHT_CHARS;
          setState({ status: "text", text: truncated ? raw.slice(0, MAX_HIGHLIGHT_CHARS) : raw, truncated });
        } else {
          setState({ status: "binary", reason: "type" });
        }
      } catch {
        setState({ status: "binary", reason: "type" });
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [entry]);

  if (!entry || state.status === "empty") {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-panel border border-dashed border-border bg-surface/30 p-6 text-center text-sm text-foreground-faint">
        Selecciona un archivo para ver su contenido.
      </div>
    );
  }
  if (state.status === "loading") {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-panel border border-border bg-surface/30 p-6 text-sm text-foreground-faint">
        Cargando…
      </div>
    );
  }
  if (state.status === "image") {
    return (
      <div className="flex min-h-[280px] items-center justify-center overflow-auto rounded-panel border border-border bg-[repeating-conic-gradient(var(--surface-strong)_0_25%,var(--surface)_0_50%)] bg-[length:24px_24px] p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.url} alt={entry.path} className="max-h-[420px] max-w-full rounded shadow-lg" />
      </div>
    );
  }
  if (state.status === "binary") {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-panel border border-border bg-surface/30 p-6 text-center">
        <p className="text-sm text-foreground-subtle">
          {state.reason === "size"
            ? "El archivo es demasiado grande para previsualizarlo."
            : "No se puede mostrar una vista previa de este tipo de archivo."}
        </p>
        <button onClick={() => downloadEntry(entry)} className="ou-btn ou-btn-secondary">
          <Download className="h-4 w-4" /> Descargar
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <CodeBlock code={state.text} lang={state.text.length > MAX_HIGHLIGHT_CHARS ? "text" : langOf(entry.path)} className="max-h-[460px]" />
      {state.truncated && (
        <p className="text-xs text-foreground-faint">
          Vista previa recortada a los primeros {MAX_HIGHLIGHT_CHARS.toLocaleString("es")} caracteres.
        </p>
      )}
    </div>
  );
}

function downloadEntry(e: Entry) {
  e.getBlob().then((blob) => saveAs(blob, e.path.split("/").pop() || "archivo"));
}

// ── Tree view row ────────────────────────────────────────────────────────────
function TreeRows({
  node,
  depth,
  open,
  toggle,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  open: Set<string>;
  toggle: (path: string) => void;
  selected: string | null;
  onSelect: (n: TreeNode) => void;
}) {
  return (
    <>
      {node.children.map((child) => {
        if (child.dir) {
          const isOpen = open.has(child.path);
          const { Icon, color } = isOpen ? FOLDER_OPEN_VISUAL : FOLDER_VISUAL;
          return (
            <div key={child.path}>
              <button
                onClick={() => toggle(child.path)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-hover transition-colors"
                style={{ paddingLeft: depth * 16 + 8 }}
              >
                <ChevronRight
                  className={cn("h-3.5 w-3.5 shrink-0 text-foreground-faint transition-transform", isOpen && "rotate-90")}
                />
                <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                <span className="truncate text-sm text-foreground">{child.name}</span>
                <span className="ml-auto shrink-0 text-[11px] text-foreground-faint">{child.children.length}</span>
              </button>
              {isOpen && (
                <TreeRows node={child} depth={depth + 1} open={open} toggle={toggle} selected={selected} onSelect={onSelect} />
              )}
            </div>
          );
        }
        const { Icon, color } = fileVisual(child.path);
        return (
          <button
            key={child.path}
            onClick={() => onSelect(child)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
              selected === child.path ? "bg-surface-hover" : "hover:bg-surface-hover"
            )}
            style={{ paddingLeft: depth * 16 + 8 + 18 }}
          >
            <Icon className="h-4 w-4 shrink-0" style={{ color }} />
            <span className="truncate text-sm text-foreground">{child.name}</span>
            <span className="ml-auto shrink-0 text-[11px] text-foreground-faint">{formatBytes(child.size)}</span>
          </button>
        );
      })}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ZipDecompressUi() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [zipName, setZipName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("tree");

  // Shared selection + per-view navigation state.
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [cwd, setCwd] = useState(""); // explorer: current directory path

  const tree = useMemo(() => (entries ? buildTree(entries) : null), [entries]);
  const files = useMemo(() => entries?.filter((e) => !e.dir) ?? [], [entries]);
  const selectedEntry = useMemo(
    () => files.find((f) => f.path === selectedPath) ?? null,
    [files, selectedPath]
  );

  const openZip = async (file: File) => {
    setError(null);
    setZipName(file.name);
    try {
      const zip = await JSZip.loadAsync(file);
      const list: Entry[] = [];
      zip.forEach((path, entry) => {
        list.push({
          path,
          dir: entry.dir,
          size: (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0,
          getBlob: () => entry.async("blob"),
        });
      });
      list.sort((a, b) => a.path.localeCompare(b.path));
      setEntries(list);
      setSelectedPath(list.find((e) => !e.dir)?.path ?? null);
      setOpenFolders(new Set());
      setCwd("");
    } catch {
      setError("No se pudo abrir el archivo. ¿Seguro que es un ZIP válido?");
      setEntries(null);
    }
  };

  const loadExample = async () => {
    const zip = new JSZip();
    zip.file("README.md", "# Ejemplo\n\nContenido de **muestra** para el visor.\n");
    zip.file("src/index.ts", 'export const saludo = "Hola";\nconsole.log(saludo);\n');
    zip.file("src/styles.css", "body {\n  margin: 0;\n  color: #333;\n}\n");
    zip.file("datos/usuarios.csv", "id,nombre\n1,Ada\n2,Linus\n");
    zip.file("datos/config.json", JSON.stringify({ activo: true, limite: 50 }, null, 2));
    zip.folder("imagenes");
    const blob = await zip.generateAsync({ type: "blob" });
    await openZip(new File([blob], "ejemplo.zip", { type: "application/zip" }));
  };

  const toggleFolder = (path: string) =>
    setOpenFolders((s) => {
      const next = new Set(s);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const reset = () => {
    setEntries(null);
    setError(null);
    setSelectedPath(null);
  };

  const cwdNode = tree ? nodeAt(tree, cwd) : null;
  const breadcrumb = cwd ? cwd.split("/") : [];

  return (
    <ToolLayout
      slug="descomprimir-zip"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <label className="ou-btn ou-btn-secondary cursor-pointer">
            <UploadCloud className="h-4 w-4" /> Abrir ZIP
            <input type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) openZip(f); e.target.value = ""; }} />
          </label>
          <ExampleButton onClick={loadExample} />
          {entries && (
            <button onClick={reset} className="ou-btn ou-btn-secondary">
              <X className="h-4 w-4" /> Cerrar
            </button>
          )}
        </div>
      }
    >
        {error && (
          <div className="flex items-start gap-3 rounded-panel border border-error/40 bg-error/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-text" />
            <p className="text-sm text-error-text">{error}</p>
          </div>
        )}

        {!entries && !error && (
          <FileDropzone
            onFiles={(files) => openZip(files[0])}
            accept=".zip,application/zip"
            title="Arrastra un archivo .zip para ver qué contiene."
          />
        )}

        {entries && tree && (
          <div className="space-y-4">
            {/* Header + view switch */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{zipName}</span>
                <span className="text-xs text-foreground-faint">{files.length} archivos</span>
              </div>
              <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
                {([
                  { id: "tree", label: "Árbol", Icon: FolderTree },
                  { id: "tabs", label: "Pestañas", Icon: Layers },
                  { id: "explorer", label: "Explorador", Icon: FolderTree },
                ] as const).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      view === id ? "bg-surface-strong text-foreground" : "text-foreground-faint hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tree view ── */}
            {view === "tree" && (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
                <div className="max-h-[520px] overflow-auto custom-scrollbar rounded-panel border border-border bg-surface/40 p-2">
                  <TreeRows node={tree} depth={0} open={openFolders} toggle={toggleFolder} selected={selectedPath} onSelect={(n) => setSelectedPath(n.path)} />
                </div>
                <div className="min-w-0">
                  <PreviewHeader entry={selectedEntry} />
                  <FilePreview entry={selectedEntry} />
                </div>
              </div>
            )}

            {/* ── Tabs view ── */}
            {view === "tabs" && (
              <div className="space-y-3">
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar rounded-control border border-border bg-surface/40 p-1.5">
                  {files.map((f) => {
                    const { Icon, color } = fileVisual(f.path);
                    return (
                      <button
                        key={f.path}
                        onClick={() => setSelectedPath(f.path)}
                        title={f.path}
                        className={cn(
                          "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                          selectedPath === f.path ? "bg-surface-strong text-foreground" : "text-foreground-muted hover:bg-surface-hover"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                        <span className="max-w-[180px] truncate">{f.path.split("/").pop()}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="min-w-0">
                  <PreviewHeader entry={selectedEntry} />
                  <FilePreview entry={selectedEntry} />
                </div>
              </div>
            )}

            {/* ── Explorer view ── */}
            {view === "explorer" && cwdNode && (
              <div className="space-y-3">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center gap-1 text-sm">
                  <button onClick={() => setCwd("")} className="flex items-center gap-1 rounded-md px-2 py-1 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors">
                    <Home className="h-3.5 w-3.5" /> {zipName}
                  </button>
                  {breadcrumb.map((part, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <ChevronRight className="h-3.5 w-3.5 text-foreground-faint" />
                      <button
                        onClick={() => setCwd(breadcrumb.slice(0, i + 1).join("/"))}
                        className="rounded-md px-2 py-1 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                      >
                        {part}
                      </button>
                    </span>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  {/* Current folder contents */}
                  <div className="max-h-[520px] overflow-auto custom-scrollbar rounded-panel border border-border bg-surface/40 p-2">
                    {cwdNode.children.length === 0 ? (
                      <p className="p-4 text-center text-sm text-foreground-faint">Carpeta vacía.</p>
                    ) : (
                      cwdNode.children.map((child) => {
                        const { Icon, color } = child.dir ? FOLDER_VISUAL : fileVisual(child.path);
                        return (
                          <button
                            key={child.path}
                            onClick={() => (child.dir ? setCwd(child.path) : setSelectedPath(child.path))}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                              !child.dir && selectedPath === child.path ? "bg-surface-hover" : "hover:bg-surface-hover"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                            <span className="truncate text-sm text-foreground">{child.name}</span>
                            <span className="ml-auto shrink-0 text-[11px] text-foreground-faint">
                              {child.dir ? `${child.children.length} elem.` : formatBytes(child.size)}
                            </span>
                            {child.dir && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground-faint" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {/* Preview */}
                  <div className="min-w-0">
                    <PreviewHeader entry={selectedEntry} />
                    <FilePreview entry={selectedEntry} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </ToolLayout>
  );
}

// Small header above a preview: the file's icon, path and a download button.
function PreviewHeader({ entry }: { entry: Entry | null }) {
  if (!entry) return <div className="mb-2 flex h-8 items-center" />;
  const { Icon, color } = fileVisual(entry.path);
  return (
    <div className="mb-2 flex h-8 items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="truncate font-mono text-xs text-foreground">{entry.path}</span>
        <span className="shrink-0 text-[11px] text-foreground-faint">{formatBytes(entry.size)}</span>
      </span>
      <button onClick={() => downloadEntry(entry)} className="shrink-0 text-foreground-faint hover:text-foreground transition-colors" title="Descargar">
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
