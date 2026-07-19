import { describe, it, expect } from "vitest";
import { GLYPH_GROUPS } from "@/lib/symbols";

const allGlyphs = GLYPH_GROUPS.flatMap((g) => g.glyphs);

describe("GLYPH_GROUPS — data integrity", () => {
  it("ships a substantial dictionary (the searchable picker relies on breadth)", () => {
    expect(allGlyphs.length).toBeGreaterThan(900);
  });

  it("has unique, non-empty group ids and labels", () => {
    const ids = GLYPH_GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of GLYPH_GROUPS) {
      expect(g.id.trim()).not.toBe("");
      expect(g.label.trim()).not.toBe("");
      expect(g.glyphs.length).toBeGreaterThan(0);
    }
  });

  it("every glyph has a non-empty char and searchable name", () => {
    for (const { char, name } of allGlyphs) {
      expect(char.length).toBeGreaterThan(0);
      // name feeds keyword search, so it must carry real words, not just the glyph
      expect(name.trim().length).toBeGreaterThan(1);
    }
  });

  it("has no duplicate glyphs within a single group", () => {
    for (const g of GLYPH_GROUPS) {
      const chars = g.glyphs.map((x) => x.char);
      expect(new Set(chars).size, `group "${g.id}" has duplicates`).toBe(chars.length);
    }
  });

  it("keyword search by name resolves to the expected glyph", () => {
    const find = (term: string) =>
      allGlyphs.filter((x) => x.name.toLowerCase().includes(term.toLowerCase()));
    expect(find("flecha derecha").some((x) => x.char === "→")).toBe(true);
    expect(find("corazon").length + find("corazón").length).toBeGreaterThan(0);
  });
});
