/**
 * Minimal ICO encoder. A modern .ico is a small directory of images; since
 * Windows Vista each entry may itself be a PNG, so we pack PNG-encoded frames
 * (rendered on a canvas by the caller) rather than raw bitmaps. That keeps this
 * tiny and produces crisp, alpha-correct favicons.
 */

export type IcoFrame = { size: number; png: Uint8Array };

export function buildIco(frames: IcoFrame[]): Blob {
  const count = frames.length;
  const headerSize = 6;
  const dirSize = 16 * count;
  let offset = headerSize + dirSize;

  const header = new Uint8Array(headerSize);
  const hv = new DataView(header.buffer);
  hv.setUint16(0, 0, true); // reserved
  hv.setUint16(2, 1, true); // type: icon
  hv.setUint16(4, count, true);

  const dir = new Uint8Array(dirSize);
  const dv = new DataView(dir.buffer);
  frames.forEach((f, i) => {
    const base = i * 16;
    dir[base] = f.size >= 256 ? 0 : f.size; // width (0 = 256)
    dir[base + 1] = f.size >= 256 ? 0 : f.size; // height
    dir[base + 2] = 0; // color palette
    dir[base + 3] = 0; // reserved
    dv.setUint16(base + 4, 1, true); // color planes
    dv.setUint16(base + 6, 32, true); // bits per pixel
    dv.setUint32(base + 8, f.png.length, true); // size of image data
    dv.setUint32(base + 12, offset, true); // offset of image data
    offset += f.png.length;
  });

  const parts: BlobPart[] = [header as BlobPart, dir as BlobPart, ...frames.map((f) => f.png as BlobPart)];
  return new Blob(parts, { type: "image/x-icon" });
}

export const ICO_SIZES = [16, 32, 48, 64] as const;
