import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteGraph } from "@/lib/seo/jsonld";
import { baseOpenGraph } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const HOME_TITLE = "Utilidades de archivos online y privadas | Open Utils";
const HOME_DESCRIPTION =
  "Edita, convierte, une y divide PDF, imágenes y video desde el navegador. Gratis, sin registro y sin subir tus archivos a ningún servidor externo.";

export const metadata: Metadata = {
  // Resolves the relative canonical/OG URLs below, and points at the production
  // domain even while the app is still served from *.vercel.app — so the signals
  // consolidate on openutils.co from day one instead of on the preview domain.
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    // Pass-through: each page ships a complete, length-tuned title (the brand is
    // already in it). A "%s · Open Utils" template would duplicate the brand.
    template: "%s",
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Kenn Marcucci", url: "https://github.com/iKennMarcucci" }],
  creator: "Kenn Marcucci",
  publisher: SITE_NAME,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    ...baseOpenGraph,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

// Applied before first paint so the theme never flashes: honour a stored choice,
// otherwise fall back to the OS preference. Kept tiny and inlined in <head>.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
        {/* Organization + Person + WebSite, declared once and referenced by @id. */}
        <JsonLd data={siteGraph()} />
        <div className="flex h-screen overflow-hidden w-full">
          <Sidebar />
          <div className="flex-1 overflow-y-auto relative flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </div>
        {/* Anonymous usage + performance telemetry only. These beacons carry the
            page path and Core Web Vitals — never the files, text or data the user
            processes (that is all handled locally and never transmitted, and the
            CSP `connect-src 'self'` in next.config.ts blocks any third-party
            connection). On Vercel both are served same-origin (/_vercel/insights/,
            /_vercel/speed-insights/). Full disclosure lives at /privacidad. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
