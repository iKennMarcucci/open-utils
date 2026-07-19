import { describe, it, expect } from "vitest";
import { formatBytes } from "@/lib/metadata";

describe("formatBytes", () => {
  it("formats bytes below 1 KB as plain B", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("switches to KB at exactly 1024 bytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("keeps one decimal in the KB range", () => {
    expect(formatBytes(1024 * 512)).toBe("512.0 KB");
    expect(formatBytes(1024 * 1023)).toBe("1023.0 KB");
  });

  it("switches to MB at exactly 1 MiB with two decimals", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.50 MB");
  });

  it("formats large files (hundreds of MB) without scientific notation", () => {
    const out = formatBytes(1024 * 1024 * 350);
    expect(out).toBe("350.00 MB");
    expect(out).not.toMatch(/e/i);
  });
});
