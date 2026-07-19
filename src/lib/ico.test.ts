import { describe, it, expect } from "vitest";
import { buildIco, ICO_SIZES, type IcoFrame } from "@/lib/ico";

const frame = (size: number, bytes: number[]): IcoFrame => ({
  size,
  png: new Uint8Array(bytes),
});

async function bytesOf(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

describe("ICO_SIZES", () => {
  it("is exactly [16, 32, 48, 64]", () => {
    expect([...ICO_SIZES]).toEqual([16, 32, 48, 64]);
  });
});

describe("buildIco", () => {
  it("writes the ICONDIR magic header and image count", async () => {
    const blob = buildIco([frame(16, [1, 2, 3]), frame(32, [4, 5])]);
    expect(blob.type).toBe("image/x-icon");
    const b = await bytesOf(blob);
    // ICONDIR: reserved=0, type=1 (icon), count=2 — all little-endian uint16.
    expect(b[0]).toBe(0);
    expect(b[1]).toBe(0);
    expect(b[2]).toBe(1);
    expect(b[3]).toBe(0);
    expect(b[4]).toBe(2); // count low byte
    expect(b[5]).toBe(0); // count high byte
  });

  it("lays out one 16-byte directory entry per frame with correct sizes/offsets", async () => {
    const frames = [frame(16, [10, 11, 12]), frame(48, [20, 21])];
    const b = await bytesOf(buildIco(frames));
    const view = new DataView(b.buffer);

    const headerSize = 6;
    const dirSize = 16 * frames.length;
    let expectedOffset = headerSize + dirSize;

    frames.forEach((f, i) => {
      const base = headerSize + i * 16;
      expect(b[base]).toBe(f.size); // width
      expect(b[base + 1]).toBe(f.size); // height
      expect(view.getUint16(base + 4, true)).toBe(1); // color planes
      expect(view.getUint16(base + 6, true)).toBe(32); // bits per pixel
      expect(view.getUint32(base + 8, true)).toBe(f.png.length); // data size
      expect(view.getUint32(base + 12, true)).toBe(expectedOffset); // data offset
      expectedOffset += f.png.length;
    });

    // Total size = header + directory + all PNG payloads.
    expect(b.length).toBe(dirSize + headerSize + 3 + 2);
  });

  it("stores a 256px frame as width/height 0 (the ICO convention)", async () => {
    const b = await bytesOf(buildIco([frame(256, [1])]));
    expect(b[6]).toBe(0); // first entry width
    expect(b[7]).toBe(0); // first entry height
  });

  it("appends the PNG payloads after the directory", async () => {
    const b = await bytesOf(buildIco([frame(16, [0xaa, 0xbb, 0xcc])]));
    const payloadStart = 6 + 16;
    expect([...b.slice(payloadStart)]).toEqual([0xaa, 0xbb, 0xcc]);
  });
});
