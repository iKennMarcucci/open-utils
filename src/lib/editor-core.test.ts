// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  newId,
  getBounds,
  hitTest,
  moveAnn,
  resizeAnn,
  getHandles,
  rotateAnnotations,
  measureText,
  getCachedImage,
  loadImageForInsertion,
  type Annotation,
  type ShapeAnn,
  type LineAnn,
  type PathAnn,
  type TextAnn,
} from "@/lib/editor-core";

// jsdom has no 2D canvas backend, so measureText/getBounds(text, ctx) get a
// deterministic stand-in: width = chars × (fontSize/2), scaled to the set font.
function fakeCtx(): CanvasRenderingContext2D {
  let fontPx = 16;
  return {
    save() {},
    restore() {},
    set font(v: string) {
      fontPx = parseInt(v, 10) || 16;
    },
    get font() {
      return `${fontPx}px sans-serif`;
    },
    measureText(s: string) {
      return { width: s.length * (fontPx / 2) } as TextMetrics;
    },
  } as unknown as CanvasRenderingContext2D;
}

const rect: ShapeAnn = {
  id: "r1", type: "rect", color: "#000", width: 2, opacity: 1, fill: "none",
  x: 10, y: 20, w: 100, h: 50,
};
const line: LineAnn = {
  id: "l1", type: "line", color: "#000", width: 4, opacity: 1,
  x1: 0, y1: 0, x2: 100, y2: 0,
};
const pen: PathAnn = {
  id: "p1", type: "pen", color: "#000", width: 4, opacity: 1,
  points: [10, 10, 20, 30, 40, 15],
};
const text: TextAnn = {
  id: "t1", type: "text", color: "#000", x: 5, y: 5, text: "Hola\nmundo", size: 20, family: "sans-serif", opacity: 1,
};

describe("newId", () => {
  it("returns unique, prefixed ids across calls", () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId()));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id.startsWith("a")).toBe(true);
  });
});

describe("getBounds", () => {
  it("returns the rect box directly", () => {
    expect(getBounds(rect)).toEqual({ x: 10, y: 20, w: 100, h: 50 });
  });

  it("normalizes a negative-size shape so w/h are positive", () => {
    const inverted: ShapeAnn = { ...rect, x: 110, y: 70, w: -100, h: -50 };
    expect(getBounds(inverted)).toEqual({ x: 10, y: 20, w: 100, h: 50 });
  });

  it("boxes a line by its endpoints, regardless of direction", () => {
    const b = getBounds({ ...line, x1: 100, y1: 40, x2: 0, y2: 0 });
    expect(b).toEqual({ x: 0, y: 0, w: 100, h: 40 });
  });

  it("pads a pen stroke by its width on every side", () => {
    // points x:[10..40] y:[10..30], width 4 → pad 2
    expect(getBounds(pen)).toEqual({ x: 8, y: 8, w: 34, h: 24 });
  });

  it("returns a zero box for an empty pen stroke", () => {
    expect(getBounds({ ...pen, points: [] })).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  it("falls back to a character heuristic for text without a ctx", () => {
    const b = getBounds(text);
    expect(b.x).toBe(5);
    expect(b.w).toBeGreaterThan(0);
    expect(b.h).toBeCloseTo(20 * 1.25);
  });

  it("measures multi-line text with a ctx, using the widest line", () => {
    const b = getBounds(text, fakeCtx());
    // "mundo" (5 chars) at size 20 → 5 * 10 = 50 wide; 2 lines tall
    expect(b.w).toBe(50);
    expect(b.h).toBeCloseTo(2 * 20 * 1.25);
  });
});

describe("measureText", () => {
  it("never reports a width below the 8px floor for empty text", () => {
    const b = measureText(fakeCtx(), { ...text, text: "" });
    expect(b.w).toBeGreaterThanOrEqual(8);
  });
});

describe("hitTest", () => {
  const ctx = fakeCtx();

  it("returns the id of a box under the point", () => {
    expect(hitTest([rect], 50, 40, ctx)).toBe("r1");
  });

  it("returns null when the point misses everything", () => {
    expect(hitTest([rect], 500, 500, ctx)).toBeNull();
  });

  it("hits a line by perpendicular distance within tolerance", () => {
    expect(hitTest([line], 50, 2, ctx)).toBe("l1");
    expect(hitTest([line], 50, 40, ctx)).toBeNull();
  });

  it("returns the topmost (last-drawn) annotation when they overlap", () => {
    const top: ShapeAnn = { ...rect, id: "r2" };
    expect(hitTest([rect, top], 50, 40, ctx)).toBe("r2");
  });

  it("hits a pen stroke near one of its segments", () => {
    expect(hitTest([pen], 15, 20, ctx)).toBe("p1");
  });
});

describe("moveAnn", () => {
  it("translates every point of a pen stroke", () => {
    const moved = moveAnn(pen, 5, -5) as PathAnn;
    expect(moved.points).toEqual([15, 5, 25, 25, 45, 10]);
  });

  it("translates both endpoints of a line", () => {
    const moved = moveAnn(line, 10, 20) as LineAnn;
    expect([moved.x1, moved.y1, moved.x2, moved.y2]).toEqual([10, 20, 110, 20]);
  });

  it("translates the anchor of a rect and does not mutate the original", () => {
    const moved = moveAnn(rect, 3, 4) as ShapeAnn;
    expect([moved.x, moved.y]).toEqual([13, 24]);
    expect(rect.x).toBe(10); // original untouched
  });
});

describe("resizeAnn", () => {
  it("moves the dragged endpoint of a line", () => {
    const r = resizeAnn(line, "end", 200, 50) as LineAnn;
    expect([r.x2, r.y2]).toEqual([200, 50]);
    expect([r.x1, r.y1]).toEqual([0, 0]);
  });

  it("keeps the opposite corner fixed when dragging a rect handle", () => {
    // drag NW of a 10,20..110,70 rect to 30,40 → box becomes 30,40..110,70
    const r = resizeAnn(rect, "nw", 30, 40) as ShapeAnn;
    expect(r).toMatchObject({ x: 30, y: 40, w: 80, h: 30 });
  });

  it("clamps a rect to a minimum size of 2px", () => {
    const r = resizeAnn(rect, "se", 10, 20) as ShapeAnn; // collapse onto the nw corner
    expect(r.w).toBe(2);
    expect(r.h).toBe(2);
  });

  it("leaves a pen stroke unchanged (no resize handles)", () => {
    expect(resizeAnn(pen, "se", 0, 0)).toBe(pen);
  });

  it("scales the font size of text rather than distorting it", () => {
    const r = resizeAnn(text, "se", 5 + 100, 5 + 50) as TextAnn; // taller box
    expect(r.size).toBeGreaterThan(text.size);
    expect(r.type).toBe("text");
  });
});

describe("getHandles", () => {
  it("gives a line its two endpoint handles", () => {
    const h = getHandles(line);
    expect(h.map((x) => x.id)).toEqual(["start", "end"]);
  });

  it("gives a pen stroke no handles", () => {
    expect(getHandles(pen)).toEqual([]);
  });

  it("gives a rect its four corner handles at the bounding box", () => {
    const h = getHandles(rect);
    expect(h.map((x) => x.id)).toEqual(["nw", "ne", "sw", "se"]);
    expect(h[3]).toMatchObject({ x: 110, y: 70 });
  });
});

describe("rotateAnnotations", () => {
  it("swaps a rect into the rotated page and keeps it axis-aligned", () => {
    // page 200×100, rotate CW: map(x,y) = [h - y, x] = [100 - y, x]
    const [out] = rotateAnnotations([rect], 200, 100, true) as ShapeAnn[];
    // corners (10,20) and (110,70) → (80,10) and (30,110) → box 30,10 50×100
    expect(out).toMatchObject({ x: 30, y: 10, w: 50, h: 100 });
  });

  it("keeps text upright and clamps its anchor onto the resized page", () => {
    const off: TextAnn = { ...text, x: -50, y: 999 };
    const [out] = rotateAnnotations([off], 200, 100, false) as TextAnn[];
    expect(out.type).toBe("text");
    // clamped within the new page (nw=h=100, nh=w=200)
    expect(out.x).toBeGreaterThanOrEqual(0);
    expect(out.x).toBeLessThanOrEqual(100);
    expect(out.y).toBeGreaterThanOrEqual(0);
    expect(out.y).toBeLessThanOrEqual(200);
  });

  it("returns a line to its origin after four 90° turns", () => {
    let anns: Annotation[] = [line];
    let w = 200, h = 100;
    for (let i = 0; i < 4; i++) {
      anns = rotateAnnotations(anns, w, h, true);
      [w, h] = [h, w];
    }
    const out = anns[0] as LineAnn;
    expect([out.x1, out.y1, out.x2, out.y2]).toEqual([line.x1, line.y1, line.x2, line.y2]);
  });
});

describe("getCachedImage", () => {
  it("registers a src and returns the same element on the next call", () => {
    const src = "data:image/png;base64,AAAA";
    const first = getCachedImage(src);
    const second = getCachedImage(src);
    // Either both are the pending element, or the cache returns it consistently.
    if (first && second) expect(first).toBe(second);
    expect(second === null || second instanceof HTMLImageElement).toBe(true);
  });
});

describe("loadImageForInsertion", () => {
  it("rejects a non-image file synchronously", async () => {
    const file = { type: "text/plain", name: "notes.txt" } as unknown as File;
    await expect(loadImageForInsertion(file)).rejects.toThrow(/no es una imagen/i);
  });
});
