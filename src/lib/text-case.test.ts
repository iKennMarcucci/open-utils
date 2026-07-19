import { describe, it, expect } from "vitest";
import { words, toCase, CASES, type CaseId } from "@/lib/text-case";

describe("words() tokenizer", () => {
  it("splits camelCase", () => {
    expect(words("myVariableName")).toEqual(["my", "variable", "name"]);
  });

  it("splits PascalCase", () => {
    expect(words("HolaMundoCruel")).toEqual(["hola", "mundo", "cruel"]);
  });

  it("splits an ACRONYM followed by a Word", () => {
    expect(words("ACRONYMWord")).toEqual(["acronym", "word"]);
  });

  it("splits at a letter↔digit-uppercase boundary", () => {
    expect(words("version2Point")).toEqual(["version2", "point"]);
  });

  it("splits on any non-alphanumeric separators", () => {
    expect(words("hola_mundo-cruel.otra/ruta")).toEqual([
      "hola",
      "mundo",
      "cruel",
      "otra",
      "ruta",
    ]);
  });

  it("respects accented characters as letters and lowercases them", () => {
    expect(words("añoNuevo")).toEqual(["año", "nuevo"]);
    expect(words("MAÑANAFría")).toEqual(["mañana", "fría"]);
  });

  it("returns an empty array for separator-only input", () => {
    expect(words("  __ -- ..")).toEqual([]);
  });
});

describe("toCase() for every CaseId", () => {
  const input = "foo bar";
  const expected: Record<CaseId, string> = {
    lower: "foo bar",
    upper: "FOO BAR",
    title: "Foo Bar",
    sentence: "Foo bar",
    camel: "fooBar",
    pascal: "FooBar",
    snake: "foo_bar",
    kebab: "foo-bar",
    constant: "FOO_BAR",
    dot: "foo.bar",
    path: "foo/bar",
    header: "Foo-Bar",
  };

  for (const { id } of CASES) {
    it(`produces ${id}`, () => {
      expect(toCase(input, id)).toBe(expected[id]);
    });
  }

  it("returns empty string when there are no words", () => {
    expect(toCase("___", "camel")).toBe("");
  });

  it("lower/upper preserve original punctuation (not a token rejoin)", () => {
    expect(toCase("foo-bar_baz", "lower")).toBe("foo-bar_baz");
    expect(toCase("foo-bar_baz", "upper")).toBe("FOO-BAR_BAZ");
  });

  it("normalizes messy mixed input into every format", () => {
    const messy = "convertir_este-texto a MuchosFormatosDistintos";
    expect(toCase(messy, "kebab")).toBe(
      "convertir-este-texto-a-muchos-formatos-distintos"
    );
    expect(toCase(messy, "constant")).toBe(
      "CONVERTIR_ESTE_TEXTO_A_MUCHOS_FORMATOS_DISTINTOS"
    );
  });
});

describe("cross-format round trips", () => {
  it("kebab -> camel recovers the original identifier", () => {
    expect(toCase(toCase("myVariableName", "kebab"), "camel")).toBe(
      "myVariableName"
    );
  });

  it("snake -> pascal recovers the original type name", () => {
    expect(toCase(toCase("HolaMundoCruel", "snake"), "pascal")).toBe(
      "HolaMundoCruel"
    );
  });

  it("all case conversions collapse to the same word set", () => {
    const ids: CaseId[] = ["camel", "snake", "kebab", "dot", "path", "constant"];
    const canonical = words("hola mundo cruel");
    for (const id of ids) {
      expect(words(toCase("hola mundo cruel", id))).toEqual(canonical);
    }
  });
});
