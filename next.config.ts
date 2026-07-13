import type { NextConfig } from "next";

/**
 * The English routes shipped first, and the three dual tools lived behind a
 * `?mode=` query param — so six tools shared three URLs and none of them could
 * rank for its own query. Each mode is now its own Spanish, keyword-bearing
 * route, and the old URLs redirect permanently (308). A 307 tells Google the
 * move is temporary and it will not pass authority to the new URL.
 *
 * Query-param variants are matched with `has` so `/pdf-converter?mode=img-to-pdf`
 * lands on the image→PDF page rather than the default one. Order matters: the
 * specific rules must come before the catch-alls.
 */
const legacyRedirects = [
  {
    source: "/pdf-converter",
    has: [{ type: "query" as const, key: "mode", value: "img-to-pdf" }],
    destination: "/imagen-a-pdf",
    permanent: true,
  },
  {
    source: "/video-converter",
    has: [{ type: "query" as const, key: "mode", value: "gif-to-video" }],
    destination: "/gif-a-video",
    permanent: true,
  },
  {
    source: "/pdf-organizer",
    has: [{ type: "query" as const, key: "mode", value: "split" }],
    destination: "/dividir-pdf",
    permanent: true,
  },
  { source: "/pdf-editor", destination: "/editor-pdf", permanent: true },
  { source: "/image-editor", destination: "/editor-imagen", permanent: true },
  { source: "/pdf-converter", destination: "/pdf-a-imagen", permanent: true },
  { source: "/video-converter", destination: "/video-a-gif", permanent: true },
  { source: "/pdf-organizer", destination: "/unir-pdf", permanent: true },
  { source: "/merge-pdf", destination: "/unir-pdf", permanent: true },
  { source: "/pdf-splitter", destination: "/dividir-pdf", permanent: true },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects;
  },

  async headers() {
    return [
      {
        // The FFmpeg core is a ~32 MB wasm binary served from our own origin and
        // versioned with the deploy. The default `max-age=0, must-revalidate`
        // made every visit to the video tools re-check all 32 MB of it.
        source: "/ffmpeg/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];

    // The global COEP `require-corp` + COOP `same-origin` pair was removed. Those
    // headers exist to unlock SharedArrayBuffer, which only the *multi-threaded*
    // FFmpeg build needs; `scripts/copy-ffmpeg.mjs` ships the single-thread core
    // (`@ffmpeg/core/dist/umd`), which does not use it. Applied to `/(.*)`, they
    // blocked every third-party resource site-wide — analytics, Search Console
    // verification, embeds — for no benefit.
  },
};

export default nextConfig;
