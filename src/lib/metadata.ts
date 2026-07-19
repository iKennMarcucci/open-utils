/**
 * File metadata readers, all local.
 *
 * - Images: dimensions plus a best-effort EXIF read of the most useful tags
 *   (camera, date taken, orientation, exposure). EXIF parsing is wrapped so a
 *   malformed or absent block simply yields no EXIF rather than an error.
 * - PDF: document info and page geometry via pdf-lib (already a dependency).
 */
import { PDFDocument } from "pdf-lib";

export type MetaRow = { label: string; value: string };

export const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

// ── EXIF (compact, best-effort) ──────────────────────────────────────────────

const EXIF_TAGS: Record<number, string> = {
  0x010f: "Cámara (marca)",
  0x0110: "Cámara (modelo)",
  0x0112: "Orientación",
  0x0132: "Fecha de modificación",
  0x8769: "__exifPointer",
  0x9003: "Fecha de captura",
  0x829a: "Tiempo de exposición",
  0x829d: "Apertura (f)",
  0x8827: "ISO",
  0x920a: "Distancia focal",
};

const ORIENTATION: Record<number, string> = {
  1: "Normal", 3: "180°", 6: "90° horario", 8: "90° antihorario",
};

function readExif(buf: ArrayBuffer): MetaRow[] {
  try {
    const view = new DataView(buf);
    if (view.getUint16(0) !== 0xffd8) return []; // not a JPEG
    let offset = 2;
    // Find APP1 (Exif) marker.
    while (offset < view.byteLength) {
      if (view.getUint16(offset) === 0xffe1) break;
      if ((view.getUint16(offset) & 0xff00) !== 0xff00) return [];
      offset += 2 + view.getUint16(offset + 2);
    }
    if (offset >= view.byteLength) return [];
    const app1 = offset + 4;
    if (view.getUint32(app1) !== 0x45786966) return []; // "Exif"
    const tiff = app1 + 6;
    const little = view.getUint16(tiff) === 0x4949;
    const u16 = (o: number) => view.getUint16(o, little);
    const u32 = (o: number) => view.getUint32(o, little);

    const rows: MetaRow[] = [];
    const readIfd = (start: number) => {
      const count = u16(start);
      for (let i = 0; i < count; i++) {
        const entry = start + 2 + i * 12;
        const tag = u16(entry);
        const type = u16(entry + 2);
        const valOffset = entry + 8;
        const name = EXIF_TAGS[tag];
        if (!name) continue;
        if (name === "__exifPointer") {
          readIfd(tiff + u32(valOffset));
          continue;
        }
        let value = "";
        if (type === 2) {
          const len = u32(entry + 4);
          const strOff = len > 4 ? tiff + u32(valOffset) : valOffset;
          let s = "";
          for (let c = 0; c < len - 1; c++) s += String.fromCharCode(view.getUint8(strOff + c));
          value = s.trim();
        } else if (type === 3) {
          value = String(u16(valOffset));
          if (tag === 0x0112) value = ORIENTATION[u16(valOffset)] ?? value;
        } else if (type === 4) {
          value = String(u32(valOffset));
        } else if (type === 5) {
          const off = tiff + u32(valOffset);
          const num = u32(off);
          const den = u32(off + 4);
          if (tag === 0x829a) value = den ? `${num}/${den} s` : "";
          else if (tag === 0x920a) value = `${(num / den).toFixed(0)} mm`;
          else if (tag === 0x829d) value = `f/${(num / den).toFixed(1)}`;
          else value = den ? String(num / den) : "";
        }
        if (value) rows.push({ label: name, value });
      }
    };
    readIfd(tiff + u32(tiff + 4));
    return rows;
  } catch {
    return [];
  }
}

export async function readImageMetadata(file: File): Promise<MetaRow[]> {
  const url = URL.createObjectURL(file);
  const dims = await new Promise<{ w: number; h: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const rows: MetaRow[] = [
    { label: "Nombre", value: file.name },
    { label: "Tipo", value: file.type || "desconocido" },
    { label: "Tamaño", value: formatBytes(file.size) },
  ];
  if (dims.w) {
    rows.push({ label: "Dimensiones", value: `${dims.w} × ${dims.h} px` });
    rows.push({ label: "Megapíxeles", value: `${((dims.w * dims.h) / 1e6).toFixed(1)} MP` });
    rows.push({ label: "Proporción", value: aspectRatio(dims.w, dims.h) });
  }
  if (file.lastModified) rows.push({ label: "Modificado", value: new Date(file.lastModified).toISOString() });

  if (/jpe?g/i.test(file.type)) {
    const exif = readExif(await file.arrayBuffer());
    return [...rows, ...exif];
  }
  return rows;
}

function aspectRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

export async function readPdfMetadata(file: File): Promise<MetaRow[]> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const rows: MetaRow[] = [
    { label: "Nombre", value: file.name },
    { label: "Tamaño", value: formatBytes(file.size) },
    { label: "Páginas", value: String(doc.getPageCount()) },
  ];
  const first = doc.getPage(0);
  const { width, height } = first.getSize();
  rows.push({ label: "Tamaño de página", value: `${width.toFixed(0)} × ${height.toFixed(0)} pt` });

  const info: [string, string | undefined][] = [
    ["Título", doc.getTitle()],
    ["Autor", doc.getAuthor()],
    ["Asunto", doc.getSubject()],
    ["Palabras clave", doc.getKeywords()],
    ["Creador", doc.getCreator()],
    ["Productor", doc.getProducer()],
  ];
  for (const [label, value] of info) if (value) rows.push({ label, value });

  try {
    const created = doc.getCreationDate();
    if (created) rows.push({ label: "Creado", value: created.toISOString() });
    const modified = doc.getModificationDate();
    if (modified) rows.push({ label: "Modificado", value: modified.toISOString() });
  } catch {
    /* dates optional */
  }
  return rows;
}
