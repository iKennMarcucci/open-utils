"use client";

import { useRef, useState } from "react";
import { Archive, FileIcon, Trash2, UploadCloud } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { formatBytes } from "@/lib/canvas";
import { ToolLayout } from "@/components/ToolLayout";
import { ExampleButton } from "@/components/ExampleButton";
import { FileDropzone } from "@/components/FileDropzone";

export function ZipCompressUi() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("archivos");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...incoming.filter((f) => !seen.has(f.name + f.size))];
    });
  };

  const loadExample = () => {
    const readme = new File([`# Proyecto de ejemplo\n\nEste ZIP se generó en el navegador con Open Utils.`], "README.md", { type: "text/markdown" });
    const data = new File([JSON.stringify({ nombre: "ejemplo", items: [1, 2, 3] }, null, 2)], "datos.json", { type: "application/json" });
    const csv = new File(["id,nombre\n1,Ada\n2,Linus\n"], "usuarios.csv", { type: "text/csv" });
    setFiles([readme, data, csv]);
    setName("proyecto-ejemplo");
  };

  const download = async () => {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const zip = new JSZip();
      for (const f of files) zip.file(f.name, f);
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      saveAs(blob, `${name || "archivos"}.zip`);
    } finally {
      setBusy(false);
    }
  };

  const total = files.reduce((s, f) => s + f.size, 0);

  return (
    <ToolLayout
      slug="comprimir-zip"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => fileRef.current?.click()} className="ou-btn ou-btn-secondary"><UploadCloud className="h-4 w-4" /> Añadir archivos</button>
          <ExampleButton onClick={loadExample} />
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
        </div>
      }
    >
        <FileDropzone
          onFiles={(files) => add(files)}
          multiple
          size="compact"
          title="Arrastra aquí los archivos que quieres comprimir."
        />

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={f.name + i} className="flex items-center gap-3 rounded-control border border-border bg-surface/50 px-3 py-2.5">
                <FileIcon className="h-4 w-4 shrink-0 text-foreground-faint" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
                <span className="shrink-0 text-xs text-foreground-faint">{formatBytes(f.size)}</span>
                <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="shrink-0 text-foreground-faint hover:text-error-text transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label htmlFor="zip-name" className="ou-label mb-1.5 block">Nombre del ZIP</label>
            <div className="flex items-center">
              <input id="zip-name" value={name} onChange={(e) => setName(e.target.value)} className="w-48 rounded-l-control border border-border bg-surface px-3 h-10 text-sm text-foreground outline-none focus:border-border-strong" />
              <span className="rounded-r-control border border-l-0 border-border bg-surface-strong px-3 h-10 flex items-center text-sm text-foreground-faint">.zip</span>
            </div>
          </div>
          <button onClick={download} disabled={files.length === 0 || busy} className="ou-btn ou-btn-accent h-11 px-6 disabled:opacity-50">
            <Archive className="h-4 w-4" />
            {busy ? "Comprimiendo…" : `Descargar ZIP${files.length ? ` (${formatBytes(total)})` : ""}`}
          </button>
        </div>
    </ToolLayout>
  );
}
