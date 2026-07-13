#!/usr/bin/env python3
"""
generate_sitemap.py - Genera un sitemap.xml válido.

Tres modos de entrada:
  1) --scan DIR --base-url URL : recorre archivos .html locales y construye URLs.
  2) --urls-file FILE          : lee una URL por línea (con --base-url si son rutas).
  3) --urls u1 u2 ...          : URLs pasadas por argumento.

Ejemplos:
    python generate_sitemap.py --scan ./public --base-url https://sitio.com -o sitemap.xml
    python generate_sitemap.py --urls-file urls.txt -o sitemap.xml
    python generate_sitemap.py --urls https://sitio.com/ https://sitio.com/blog -o sitemap.xml

Reglas aplicadas:
  - Solo URLs http/https.
  - Añade <lastmod> (fecha de modificación del archivo en modo --scan, o hoy).
  - Deduplica y ordena.
  - Escapa caracteres XML.
  - Avisa si supera 50.000 URLs (límite por sitemap).
"""

import argparse
import datetime
import os
import sys
from urllib.parse import urljoin, urlparse
from xml.sax.saxutils import escape

MAX_URLS = 50000


def iso_date(ts=None):
    if ts is None:
        return datetime.date.today().isoformat()
    return datetime.date.fromtimestamp(ts).isoformat()


def scan_dir(directory, base_url):
    """Construye URLs a partir de archivos .html/.htm bajo directory."""
    if not base_url:
        print("Error: --scan requiere --base-url.", file=sys.stderr)
        sys.exit(1)
    base_url = base_url.rstrip("/") + "/"
    entries = []
    skip = {"node_modules", ".git", "dist", "build", ".next"}
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in skip]
        for name in files:
            if not name.endswith((".html", ".htm")):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, directory).replace(os.sep, "/")
            # index.html -> ruta de carpeta
            if rel.endswith("index.html"):
                rel = rel[: -len("index.html")]
            url = urljoin(base_url, rel)
            entries.append((url, iso_date(os.path.getmtime(full))))
    return entries


def read_urls_file(path, base_url):
    entries = []
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            u = line.strip()
            if not u or u.startswith("#"):
                continue
            if base_url and not u.startswith("http"):
                u = urljoin(base_url.rstrip("/") + "/", u.lstrip("/"))
            entries.append((u, iso_date()))
    return entries


def build_sitemap(entries):
    # Filtra, deduplica y ordena
    seen = set()
    clean = []
    for url, lastmod in entries:
        p = urlparse(url)
        if p.scheme not in ("http", "https"):
            print(f"  aviso: se omite URL sin http/https: {url}", file=sys.stderr)
            continue
        if url in seen:
            continue
        seen.add(url)
        clean.append((url, lastmod))
    clean.sort()

    if len(clean) > MAX_URLS:
        print(f"  aviso: {len(clean)} URLs superan el límite de {MAX_URLS} por sitemap. "
              f"Divide en varios sitemaps y usa un índice.", file=sys.stderr)

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod in clean:
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(url)}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines), len(clean)


def main():
    ap = argparse.ArgumentParser(description="Genera un sitemap.xml válido.")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--scan", metavar="DIR", help="Directorio a recorrer buscando .html.")
    src.add_argument("--urls-file", metavar="FILE", help="Archivo con una URL/ruta por línea.")
    src.add_argument("--urls", nargs="+", metavar="URL", help="URLs a incluir.")
    ap.add_argument("--base-url", help="URL base (requerida con --scan; opcional con rutas).")
    ap.add_argument("-o", "--output", default="sitemap.xml", help="Archivo de salida.")
    args = ap.parse_args()

    if args.scan:
        entries = scan_dir(args.scan, args.base_url)
    elif args.urls_file:
        entries = read_urls_file(args.urls_file, args.base_url)
    else:
        entries = [(u, iso_date()) for u in args.urls]

    if not entries:
        print("No se encontraron URLs para el sitemap.", file=sys.stderr)
        sys.exit(1)

    xml, count = build_sitemap(entries)
    with open(args.output, "w", encoding="utf-8") as fh:
        fh.write(xml + "\n")

    fname = os.path.basename(args.output)
    domain = (args.base_url or "https://dominio.com").rstrip("/")
    print(f"✅ Sitemap generado: {args.output} ({count} URLs)")
    print(f"   Recuerda: referéncialo en robots.txt (Sitemap: {domain}/{fname})")
    print("   y envíalo en Google Search Console.")


if __name__ == "__main__":
    main()
