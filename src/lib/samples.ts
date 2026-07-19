/**
 * Generators for example files, so every file-based tool can offer a
 * "Ver ejemplo" that loads real sample content without the user bringing a file.
 * All client-side (canvas / pdf-lib): only call from event handlers.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** A multi-page sample PDF with visible text and metadata. */
export async function samplePdfFile(
  pages = 3,
  name = "ejemplo.pdf",
  title = "Documento de ejemplo"
): Promise<File> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor("Open Utils");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(title, { x: 60, y: 760, size: 26, font: bold, color: rgb(0.1, 0.1, 0.12) });
    page.drawText(`Página ${i + 1} de ${pages}`, { x: 60, y: 720, size: 14, font, color: rgb(0.4, 0.4, 0.45) });
    page.drawText("Este PDF se generó en tu navegador con Open Utils.", { x: 60, y: 680, size: 12, font, color: rgb(0.3, 0.3, 0.35) });
    page.drawRectangle({ x: 60, y: 120, width: 475, height: 520, borderColor: rgb(0.8, 0.8, 0.85), borderWidth: 1 });
  }
  const bytes = await doc.save();
  return new File([bytes as BlobPart], name, { type: "application/pdf" });
}

/** A sample raster image as a PNG File. */
export function sampleImageFile(
  label: string,
  name = "ejemplo.png",
  width = 1000,
  height = 700,
  colors: [string, string] = ["#0ea5e9", "#6d28d9"]
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, colors[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `bold ${Math.round(width / 14)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, width / 2, height / 2);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(new File([blob!], name, { type: "image/png" })), "image/png")
  );
}

/**
 * A short sample video (WebM), recorded from an animated canvas with
 * MediaRecorder. Rejects when the browser can't record (e.g. some Safari
 * versions), so the caller can fall back gracefully.
 */
export function sampleVideoFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === "undefined") {
      reject(new Error("Tu navegador no permite generar un video de ejemplo. Sube tu propio video."));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext("2d")!;
    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, { mimeType: mime });
    } catch (e) {
      reject(e as Error);
      return;
    }
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () =>
      resolve(new File([new Blob(chunks, { type: "video/webm" })], "ejemplo.webm", { type: "video/webm" }));
    const start = performance.now();
    const draw = () => {
      const el = performance.now() - start;
      ctx.fillStyle = `hsl(${(el / 12) % 360} 65% 12%)`;
      ctx.fillRect(0, 0, 480, 270);
      const x = 240 + Math.cos(el / 320) * 150;
      const y = 150 + Math.sin(el / 320) * 70;
      ctx.fillStyle = "#0ea5e9";
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Video de ejemplo", 240, 42);
      if (el < 2200) requestAnimationFrame(draw);
      else rec.stop();
    };
    rec.start();
    requestAnimationFrame(draw);
  });
}
