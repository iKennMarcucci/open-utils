import JSON5 from "json5";

export type JsonIssue = {
  message: string;
  /** 1-based, for display. */
  line: number;
  column: number;
};

export type JsonResult =
  | { ok: true; output: string }
  | { ok: false; issue: JsonIssue };

/**
 * Finds the offset of the first syntax error.
 *
 * `JSON.parse` stays the authority on *whether* the input is valid, but it is
 * useless for saying *where* the problem is: V8 only reports a position for its
 * "Expected ..." errors. For "Unexpected token" it inlines a truncated snippet
 * and no offset at all, so `{"roto": [1,2,}` yields nothing to point at. This
 * scanner exists to always give the user a line and a column.
 *
 * Returns the offset and what the parser wanted, or null if the text parses.
 */
function locateError(src: string): { offset: number; expected: string } | null {
  let i = 0;

  const ws = () => {
    while (i < src.length && /[\s]/.test(src[i])) i++;
  };

  const fail = (expected: string) => ({ offset: i, expected });

  const parseString = (): { offset: number; expected: string } | null => {
    i++; // opening quote
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === '"') {
        i++;
        return null;
      }
      if (c === "\n") return fail("cerrar la comilla antes del fin de línea");
      i++;
    }
    return fail('una comilla de cierre (")');
  };

  const parseValue = (): { offset: number; expected: string } | null => {
    ws();
    if (i >= src.length) return fail("un valor");
    const c = src[i];

    if (c === '"') return parseString();

    if (c === "{") {
      i++;
      ws();
      if (src[i] === "}") {
        i++;
        return null;
      }
      for (;;) {
        ws();
        if (src[i] !== '"') return fail('el nombre de una propiedad entre comillas dobles ("clave")');
        const e1 = parseString();
        if (e1) return e1;
        ws();
        if (src[i] !== ":") return fail("dos puntos (:) después del nombre de la propiedad");
        i++;
        const e2 = parseValue();
        if (e2) return e2;
        ws();
        if (src[i] === ",") {
          i++;
          continue;
        }
        if (src[i] === "}") {
          i++;
          return null;
        }
        return fail("una coma (,) o una llave de cierre (})");
      }
    }

    if (c === "[") {
      i++;
      ws();
      if (src[i] === "]") {
        i++;
        return null;
      }
      for (;;) {
        const e = parseValue();
        if (e) return e;
        ws();
        if (src[i] === ",") {
          i++;
          continue;
        }
        if (src[i] === "]") {
          i++;
          return null;
        }
        return fail("una coma (,) o un corchete de cierre (])");
      }
    }

    for (const lit of ["true", "false", "null"]) {
      if (src.startsWith(lit, i)) {
        i += lit.length;
        return null;
      }
    }

    const num = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) {
      i += num[0].length;
      return null;
    }

    return fail("un valor válido: texto entre comillas, número, true, false, null, { … } o [ … ]");
  };

  const err = parseValue();
  if (err) return err;

  ws();
  if (i < src.length) return { offset: i, expected: "el final del documento" };
  return null;
}

function toLineCol(src: string, offset: number) {
  const before = src.slice(0, Math.min(offset, src.length));
  const line = before.split("\n").length;
  const column = offset - before.lastIndexOf("\n");
  return { line, column };
}

function describe(src: string): JsonIssue {
  const found = locateError(src);

  // JSON.parse rejected it but the scanner agrees it's fine — shouldn't happen,
  // but never claim a position we don't have.
  if (!found) {
    return { message: "El JSON no es válido.", line: 1, column: 1 };
  }

  const { offset, expected } = found;
  const { line, column } = toLineCol(src, offset);
  const at = src[offset];

  const what =
    offset >= src.length
      ? "El JSON termina antes de tiempo"
      : `Se ha encontrado ${JSON.stringify(at)} donde no correspondía`;

  return { message: `${what}. Se esperaba ${expected}.`, line, column };
}

/**
 * `JSON.parse` decides strict validity; when it rejects the input we fall back
 * to JSON5, which accepts the "JavaScript object literal" shape people often
 * paste — unquoted keys (`{ nombre: "x" }`), single quotes, trailing commas and
 * comments. Either way the value is normalised to real JSON on the way out.
 * `describe` still explains where *strict* JSON went wrong when nothing parses.
 */
function parse(input: string): { value: unknown } | { issue: JsonIssue } {
  try {
    return { value: JSON.parse(input) };
  } catch {
    try {
      return { value: JSON5.parse(input) };
    } catch {
      return { issue: describe(input) };
    }
  }
}

export function formatJson(input: string, indent: number): JsonResult {
  if (!input.trim()) return { ok: true, output: "" };
  const r = parse(input);
  if ("issue" in r) return { ok: false, issue: r.issue };
  return { ok: true, output: JSON.stringify(r.value, null, indent) };
}

export function minifyJson(input: string): JsonResult {
  if (!input.trim()) return { ok: true, output: "" };
  const r = parse(input);
  if ("issue" in r) return { ok: false, issue: r.issue };
  return { ok: true, output: JSON.stringify(r.value) };
}

export function validateJson(input: string): JsonIssue | null {
  if (!input.trim()) return null;
  const r = parse(input);
  return "issue" in r ? r.issue : null;
}
