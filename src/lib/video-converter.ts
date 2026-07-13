import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
    if (ffmpeg) return ffmpeg;
    ffmpeg = new FFmpeg();
    // Self-hosted core — served same-origin from `public/ffmpeg/` (see
    // scripts/copy-ffmpeg.mjs). No CDN request is ever made: 100% local.
    //
    // The URLs are passed straight through rather than via `toBlobURL`. That
    // helper exists to load a core from a *different* origin; here it only
    // forced the whole 32 MB wasm into a Blob first, doubling peak memory and
    // preventing the browser from stream-compiling it as it downloads.
    const baseURL = "/ffmpeg";
    await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
    return ffmpeg;
};

export type VideoConversionMode = "video-to-gif" | "gif-to-video";
export type QualityPreset = "light" | "normal" | "high";

export interface VideoConversionParams {
  file: File;
  startTime: number;
  endTime: number;
  mode: VideoConversionMode;
  quality: QualityPreset;
  onProgress?: (progress: number) => void;
}

const QUALITY_SETTINGS = {
  "video-to-gif": {
    light:  { fps: 10, scale: "480:-1", dither: "bayer"        },
    normal: { fps: 18, scale: "720:-1", dither: "sierra2"      },
    high:   { fps: 24, scale: "iw:-1",  dither: "sierra2_4a"   },
  },
  "gif-to-video": {
    light:  { crf: 32, preset: "ultrafast" },
    normal: { crf: 22, preset: "ultrafast" },
    high:   { crf: 16, preset: "ultrafast" },
  },
} as const;

export const convertMedia = async ({
  file,
  startTime,
  endTime,
  mode,
  quality,
  onProgress,
}: VideoConversionParams): Promise<string> => {
  const ffmpeg = await loadFFmpeg();

  // FFmpeg emits hundreds of log lines per conversion. They're kept in memory so
  // a failure can report the tail (see below), but they are not echoed to the
  // console in production — that was flooding it and costing real time.
  const logs: string[] = [];
  ffmpeg.on("log", ({ message }) => {
    logs.push(message);
    if (process.env.NODE_ENV !== "production") console.log("[FFmpeg]", message);
  });

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.min(progress * 100, 100));
    });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || "mp4";
  const inputName = `input.${ext}`;
  const outputName = mode === "video-to-gif" ? "output.gif" : "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const duration = endTime - startTime;

  try {
    if (mode === "video-to-gif") {
      const q = QUALITY_SETTINGS["video-to-gif"][quality];

      // Paso 1: Generar paleta
      await ffmpeg.exec([
        "-y",
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-i", inputName,
        "-vf", `fps=${q.fps},scale=${q.scale}:flags=lanczos,palettegen=max_colors=256:stats_mode=diff`,
        "palette.png"
      ]);

      const paletteData = await ffmpeg.readFile("palette.png").catch(() => null);
      if (!paletteData || paletteData.length === 0) {
        throw new Error("Falló la generación de la paleta.");
      }

      // Paso 2: Generar GIF con paleta
      await ffmpeg.exec([
        "-y",
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-i", inputName,
        "-i", "palette.png",
        "-lavfi", `fps=${q.fps},scale=${q.scale}:flags=lanczos[x];[x][1:v]paletteuse=dither=${q.dither}`,
        outputName
      ]);

    } else {
      const q = QUALITY_SETTINGS["gif-to-video"][quality];

      // A GIF can't be loaded by a <video> element, so there is no reliable
      // in-browser duration to trim against — convert the whole GIF. libx264
      // needs even dimensions (yuv420p), hence the scale filter.
      await ffmpeg.exec([
        "-y",
        "-i", inputName,
        "-movflags", "+faststart",
        "-pix_fmt", "yuv420p",
        "-c:v", "libx264",
        "-crf", q.crf.toString(),
        "-preset", q.preset,
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        outputName
      ]);
    }

    const data = await ffmpeg.readFile(outputName);

    if (!data || data.length === 0) {
      const lastLogs = logs.slice(-20).join("\n");
      throw new Error(`El archivo de salida está vacío.\n\nLogs:\n${lastLogs}`);
    }

    const uint8 = data as Uint8Array;
    const arrayBuffer = new ArrayBuffer(uint8.byteLength);
    new Uint8Array(arrayBuffer).set(uint8);

    const blob = new Blob([arrayBuffer], {
      type: mode === "video-to-gif" ? "image/gif" : "video/mp4"
    });

    try { await ffmpeg.deleteFile(inputName); } catch(_) {}
    try { await ffmpeg.deleteFile(outputName); } catch(_) {}
    try { await ffmpeg.deleteFile("palette.png"); } catch(_) {}

    return URL.createObjectURL(blob);

  } catch (err) {
    try { await ffmpeg.deleteFile(inputName); } catch(_) {}
    try { await ffmpeg.deleteFile(outputName); } catch(_) {}
    try { await ffmpeg.deleteFile("palette.png"); } catch(_) {}
    console.error("FFmpeg error. Últimos logs:", logs.slice(-30).join("\n"));
    throw err;
  }
};