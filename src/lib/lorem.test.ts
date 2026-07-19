import { describe, it, expect } from "vitest";
import { generateLorem } from "@/lib/lorem";

describe("generateLorem — words", () => {
  it("produces the exact requested word count", () => {
    expect(generateLorem(3, "words").split(" ")).toHaveLength(3);
    expect(generateLorem(1, "words")).toBe("lorem");
    expect(generateLorem(3, "words")).toBe("lorem ipsum dolor");
  });

  it("cycles the word bank for large counts", () => {
    expect(generateLorem(200, "words").split(" ")).toHaveLength(200);
  });
});

describe("generateLorem — sentences", () => {
  it("produces the exact requested sentence count", () => {
    // Each sentence ends in exactly one period; commas never add periods.
    for (const n of [1, 3, 10]) {
      const text = generateLorem(n, "sentences");
      expect((text.match(/\./g) ?? []).length).toBe(n);
    }
  });

  it("capitalizes each sentence and ends with a period", () => {
    const one = generateLorem(1, "sentences");
    expect(one[0]).toBe(one[0].toUpperCase());
    expect(one.endsWith(".")).toBe(true);
  });
});

describe("generateLorem — paragraphs", () => {
  it("produces the exact requested paragraph count", () => {
    for (const n of [1, 2, 5]) {
      expect(generateLorem(n, "paragraphs").split("\n\n")).toHaveLength(n);
    }
  });
});

describe("generateLorem — characters", () => {
  it("never exceeds the requested character count", () => {
    for (const n of [5, 17, 50, 200]) {
      expect(generateLorem(n, "characters").length).toBeLessThanOrEqual(n);
    }
  });

  it("hits the exact count when the boundary is not whitespace", () => {
    expect(generateLorem(5, "characters")).toBe("Lorem");
  });

  it("never leaves a trailing space", () => {
    expect(generateLorem(50, "characters")).not.toMatch(/\s$/);
  });

  it("starts capitalized", () => {
    const text = generateLorem(30, "characters");
    expect(text[0]).toBe("L");
  });
});

describe("generateLorem — clamping", () => {
  it("clamps a zero/negative count up to at least 1", () => {
    expect(generateLorem(0, "words")).toBe("lorem");
    expect(generateLorem(-5, "words")).toBe("lorem");
  });
});
