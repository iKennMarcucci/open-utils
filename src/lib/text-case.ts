/**
 * Text case conversions, done locally with no dependencies.
 *
 * Everything goes through one tokenizer: split the input into words no matter
 * how it was written (spaces, camelCase, PascalCase, snake_case, kebab-case,
 * dot.case, path/case…), then re-join them in the target shape. That is what
 * lets you paste `myVariableName` and get `my-variable-name` back.
 */

export type CaseId =
  | "lower"
  | "upper"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "dot"
  | "path"
  | "header";

export const CASES: { id: CaseId; label: string; example: string }[] = [
  { id: "lower", label: "minúsculas", example: "hola mundo cruel" },
  { id: "upper", label: "MAYÚSCULAS", example: "HOLA MUNDO CRUEL" },
  { id: "title", label: "Title Case", example: "Hola Mundo Cruel" },
  { id: "sentence", label: "Sentence case", example: "Hola mundo cruel" },
  { id: "camel", label: "camelCase", example: "holaMundoCruel" },
  { id: "pascal", label: "PascalCase", example: "HolaMundoCruel" },
  { id: "snake", label: "snake_case", example: "hola_mundo_cruel" },
  { id: "kebab", label: "kebab-case", example: "hola-mundo-cruel" },
  { id: "constant", label: "CONSTANT_CASE", example: "HOLA_MUNDO_CRUEL" },
  { id: "dot", label: "dot.case", example: "hola.mundo.cruel" },
  { id: "path", label: "path/case", example: "hola/mundo/cruel" },
  { id: "header", label: "Header-Case", example: "Hola-Mundo-Cruel" },
];

/** Split any string into lowercase words, respecting existing case boundaries. */
export function words(input: string): string[] {
  return (
    input
      // insert a space at camelCase / PascalCase boundaries and letter↔number
      .replace(/([a-zà-ÿ0-9])([A-ZÀ-Ý])/g, "$1 $2")
      .replace(/([A-ZÀ-Ý]+)([A-ZÀ-Ý][a-zà-ÿ])/g, "$1 $2")
      // any non-alphanumeric run is a separator
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .map((w) => w.toLowerCase())
  );
}

const cap = (w: string) => (w ? w[0].toUpperCase() + w.slice(1) : w);

export function toCase(input: string, id: CaseId): string {
  const w = words(input);
  if (w.length === 0) return "";

  switch (id) {
    case "lower":
      // Preserve the original text, only lowercasing — not a token rejoin.
      return input.toLowerCase();
    case "upper":
      return input.toUpperCase();
    case "title":
      return w.map(cap).join(" ");
    case "sentence":
      return cap(w.join(" "));
    case "camel":
      return w.map((x, i) => (i === 0 ? x : cap(x))).join("");
    case "pascal":
      return w.map(cap).join("");
    case "snake":
      return w.join("_");
    case "kebab":
      return w.join("-");
    case "constant":
      return w.join("_").toUpperCase();
    case "dot":
      return w.join(".");
    case "path":
      return w.join("/");
    case "header":
      return w.map(cap).join("-");
  }
}

export const CASE_EXAMPLE = "convertir_este-texto a MuchosFormatosDistintos";
