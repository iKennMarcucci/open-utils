/**
 * Classic Lorem Ipsum generator. Deterministic word bank, no randomness source
 * that would break server rendering — the caller passes an index-based seed by
 * varying counts, and word selection cycles through the bank.
 */

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

export type LoremUnit = "paragraphs" | "sentences" | "words" | "characters";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A word by absolute position in an endless, cycling stream. */
function wordAt(i: number): string {
  return WORDS[i % WORDS.length];
}

function sentence(startWord: number, length: number): string {
  const parts: string[] = [];
  for (let i = 0; i < length; i++) parts.push(wordAt(startWord + i));
  let text = parts.join(" ");
  // A comma partway through longer sentences, for a natural rhythm.
  if (length > 6) {
    const comma = Math.floor(length / 2);
    parts[comma] = parts[comma] + ",";
    text = parts.join(" ");
  }
  return cap(text) + ".";
}

function paragraph(startWord: number, sentences: number): string {
  const out: string[] = [];
  let w = startWord;
  for (let s = 0; s < sentences; s++) {
    const len = 8 + ((s * 5 + startWord) % 8); // 8..15 words, varied but stable
    out.push(sentence(w, len));
    w += len;
  }
  return out.join(" ");
}

export function generateLorem(count: number, unit: LoremUnit): string {
  const n = Math.max(1, Math.min(count, unit === "characters" ? 100000 : 5000));

  if (unit === "words") {
    return Array.from({ length: n }, (_, i) => wordAt(i)).join(" ");
  }

  if (unit === "sentences") {
    const out: string[] = [];
    let w = 0;
    for (let s = 0; s < n; s++) {
      const len = 8 + (s % 8);
      out.push(sentence(w, len));
      w += len;
    }
    return out.join(" ");
  }

  if (unit === "paragraphs") {
    const out: string[] = [];
    let w = 0;
    for (let p = 0; p < n; p++) {
      const sentences = 4 + (p % 3); // 4..6 sentences per paragraph
      out.push(paragraph(w, sentences));
      w += sentences * 12;
    }
    return out.join("\n\n");
  }

  // characters: build words until we reach the target, then trim exactly.
  let text = "";
  let i = 0;
  while (text.length < n) {
    text += (i === 0 ? cap(wordAt(i)) : " " + wordAt(i));
    i++;
  }
  text = text.slice(0, n).trimEnd();
  return text;
}
