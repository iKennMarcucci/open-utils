import { ImageResponse } from "next/og";
import { getTool } from "./tools";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared 1200x630 card renderer for the per-tool Open Graph images.
 *
 * Satori (what `next/og` uses) only supports flexbox — no CSS grid — and needs
 * an explicit `display: flex` on every container with more than one child.
 */
export function renderToolOgImage(slug: string) {
  const tool = getTool(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 80% 8%, rgba(0,112,243,0.22), transparent 55%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 999,
              background: "#ededed",
              color: "#0a0a0a",
              fontSize: 27,
              fontWeight: 700,
            }}
          >
            {">_"}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1a1", fontWeight: 500 }}>
            Open Utils
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#ededed",
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            {tool.h1}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#a1a1a1",
              maxWidth: 940,
            }}
          >
            {tool.description}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["100% local", "Sin marca de agua", "Gratis", "Open source"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                padding: "9px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#ededed",
                fontSize: 22,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE
  );
}
