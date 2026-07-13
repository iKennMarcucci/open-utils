#!/usr/bin/env python3
"""
seo_audit.py - Auditor SEO on-page para proyectos web.

Analiza archivos HTML/plantillas locales o una URL en vivo y reporta problemas
de SEO on-page: title, meta description, encabezados, canonical, Open Graph,
Twitter Cards, JSON-LD, imágenes sin alt, viewport, meta robots, lang y más.

Uso:
    python seo_audit.py --path ./src            # auditar archivos locales (recursivo)
    python seo_audit.py --path index.html       # auditar un archivo
    python seo_audit.py --url https://sitio.com  # auditar una URL (requiere red)
    python seo_audit.py --path . --json          # salida JSON

Sin dependencias externas obligatorias: usa html.parser de la stdlib.
Si 'requests' está disponible mejora el fetch de URLs; si no, usa urllib.
"""

import argparse
import json
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urlparse

# Umbrales recomendados
TITLE_MIN, TITLE_MAX = 30, 60
DESC_MIN, DESC_MAX = 70, 160

SEVERITY_ORDER = {"critical": 0, "important": 1, "minor": 2}
SEVERITY_LABEL = {"critical": "🔴 CRÍTICO", "important": "🟠 IMPORTANTE", "minor": "🟡 MENOR"}


class SEOParser(HTMLParser):
    """Extrae elementos relevantes para SEO de un documento HTML."""

    def __init__(self):
        super().__init__()
        self.title_parts = []
        self._in_title = False
        self.metas = []          # lista de dicts de atributos de <meta>
        self.links = []          # lista de dicts de atributos de <link>
        self.headings = []       # (nivel, texto)
        self._current_heading = None
        self._heading_text = []
        self.images = []         # dicts de atributos de <img>
        self.jsonld_blocks = []  # strings crudos de JSON-LD
        self._in_jsonld = False
        self._jsonld_buffer = []
        self.html_lang = None
        self.anchor_count = 0

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.metas.append(d)
        elif tag == "link":
            self.links.append(d)
        elif tag == "html":
            self.html_lang = d.get("lang")
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._current_heading = int(tag[1])
            self._heading_text = []
        elif tag == "img":
            self.images.append(d)
        elif tag == "a" and d.get("href"):
            self.anchor_count += 1
        elif tag == "script" and d.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._jsonld_buffer = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self._current_heading:
            self.headings.append((self._current_heading, "".join(self._heading_text).strip()))
            self._current_heading = None
        elif tag == "script" and self._in_jsonld:
            self.jsonld_blocks.append("".join(self._jsonld_buffer).strip())
            self._in_jsonld = False

    def handle_data(self, data):
        if self._in_title:
            self.title_parts.append(data)
        if self._current_heading:
            self._heading_text.append(data)
        if self._in_jsonld:
            self._jsonld_buffer.append(data)

    @property
    def title(self):
        return "".join(self.title_parts).strip()

    def meta_by_name(self, name):
        for m in self.metas:
            if m.get("name", "").lower() == name.lower():
                return m.get("content", "")
        return None

    def meta_by_property(self, prop):
        for m in self.metas:
            if m.get("property", "").lower() == prop.lower():
                return m.get("content", "")
        return None

    def link_by_rel(self, rel):
        for l in self.links:
            if l.get("rel", "").lower() == rel.lower():
                return l.get("href", "")
        return None

    def has_viewport(self):
        return self.meta_by_name("viewport") is not None

    def charset(self):
        for m in self.metas:
            if "charset" in m:
                return m["charset"]
        return None


def analyze(html, source):
    """Devuelve una lista de hallazgos (dicts) para un documento HTML."""
    findings = []

    def add(severity, check, message):
        findings.append({"severity": severity, "check": check, "message": message})

    p = SEOParser()
    try:
        p.feed(html)
    except Exception as e:
        add("critical", "parse", f"No se pudo parsear el HTML: {e}")
        return findings

    # --- Title ---
    title = p.title
    if not title:
        add("critical", "title", "Falta la etiqueta <title>.")
    else:
        n = len(title)
        if n < TITLE_MIN:
            add("important", "title", f"Title corto ({n} car.). Recomendado {TITLE_MIN}-{TITLE_MAX}.")
        elif n > TITLE_MAX:
            add("important", "title", f"Title largo ({n} car.), puede truncarse. Máx recomendado {TITLE_MAX}.")

    # --- Meta description ---
    desc = p.meta_by_name("description")
    if not desc:
        add("important", "meta_description", "Falta la meta description.")
    else:
        n = len(desc)
        if n < DESC_MIN:
            add("minor", "meta_description", f"Meta description corta ({n} car.). Recomendado {DESC_MIN}-{DESC_MAX}.")
        elif n > DESC_MAX:
            add("minor", "meta_description", f"Meta description larga ({n} car.), puede truncarse. Máx {DESC_MAX}.")

    # --- Encabezados ---
    h1s = [t for (lvl, t) in p.headings if lvl == 1]
    if len(h1s) == 0:
        add("critical", "h1", "Falta el <h1>.")
    elif len(h1s) > 1:
        add("important", "h1", f"Hay {len(h1s)} <h1>. Debe haber solo uno por página.")
    # Saltos de jerarquía
    levels = [lvl for (lvl, _) in p.headings]
    prev = 0
    for lvl in levels:
        if prev and lvl > prev + 1:
            add("minor", "heading_hierarchy",
                f"Salto de jerarquía de encabezados (de H{prev} a H{lvl}). Evita saltar niveles.")
            break
        prev = lvl

    # --- Canonical ---
    canonical = p.link_by_rel("canonical")
    if not canonical:
        add("important", "canonical", "Falta <link rel=\"canonical\">.")
    elif not canonical.startswith("http"):
        add("minor", "canonical", "El canonical debería ser una URL absoluta (http/https).")

    # --- Viewport ---
    if not p.has_viewport():
        add("critical", "viewport", "Falta <meta name=\"viewport\">. Imprescindible para mobile-first.")

    # --- charset ---
    if not p.charset():
        add("minor", "charset", "Falta <meta charset>.")

    # --- lang ---
    if not p.html_lang:
        add("minor", "html_lang", "Falta el atributo lang en <html>.")

    # --- Meta robots (noindex accidental) ---
    robots = p.meta_by_name("robots")
    if robots and "noindex" in robots.lower():
        add("critical", "robots_noindex",
            f"La página tiene 'noindex' (robots=\"{robots}\"). Verifica que no sea un descuido de staging.")

    # --- meta keywords (obsoleto) ---
    if p.meta_by_name("keywords") is not None:
        add("minor", "meta_keywords", "Existe <meta name=\"keywords\">, obsoleto e ignorado por Google. Elimínalo.")

    # --- Open Graph ---
    og_missing = [tag for tag in ("og:title", "og:description", "og:image", "og:url", "og:type")
                  if not p.meta_by_property(tag)]
    if len(og_missing) == 5:
        add("minor", "open_graph", "No hay etiquetas Open Graph. Afecta cómo se ve al compartir en redes.")
    elif og_missing:
        add("minor", "open_graph", f"Faltan etiquetas Open Graph: {', '.join(og_missing)}.")

    # --- Twitter Card ---
    if not p.meta_by_name("twitter:card"):
        add("minor", "twitter_card", "Falta <meta name=\"twitter:card\">.")

    # --- Imágenes sin alt ---
    imgs_no_alt = [img for img in p.images if "alt" not in img]
    if imgs_no_alt:
        add("important", "img_alt",
            f"{len(imgs_no_alt)} de {len(p.images)} imágenes sin atributo alt.")
    imgs_no_dim = [img for img in p.images if not ("width" in img and "height" in img)]
    if imgs_no_dim and p.images:
        add("minor", "img_dimensions",
            f"{len(imgs_no_dim)} de {len(p.images)} imágenes sin width/height (riesgo de CLS).")

    # --- JSON-LD ---
    if not p.jsonld_blocks:
        add("minor", "structured_data", "No se detectó structured data (JSON-LD).")
    else:
        for i, block in enumerate(p.jsonld_blocks):
            try:
                json.loads(block)
            except json.JSONDecodeError as e:
                add("important", "structured_data", f"Bloque JSON-LD #{i+1} inválido: {e}.")

    # --- Enlaces internos (heurístico) ---
    if p.anchor_count == 0:
        add("minor", "internal_links", "No se detectaron enlaces <a href>. Revisa el enlazado interno.")

    return findings, {
        "title": title,
        "title_len": len(title) if title else 0,
        "description": desc,
        "description_len": len(desc) if desc else 0,
        "h1_count": len(h1s),
        "headings": len(p.headings),
        "images": len(p.images),
        "images_no_alt": len(imgs_no_alt),
        "jsonld_blocks": len(p.jsonld_blocks),
        "canonical": canonical,
        "lang": p.html_lang,
    }


def fetch_url(url):
    """Descarga el HTML de una URL. Usa requests si está, si no urllib."""
    try:
        import requests  # type: ignore
        r = requests.get(url, timeout=20, headers={"User-Agent": "SEO-Audit-Skill/1.0"})
        r.raise_for_status()
        return r.text
    except ImportError:
        from urllib.request import Request, urlopen
        req = Request(url, headers={"User-Agent": "SEO-Audit-Skill/1.0"})
        with urlopen(req, timeout=20) as resp:  # noqa: S310
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.read().decode(charset, errors="replace")


def collect_html_files(path):
    """Devuelve la lista de archivos HTML/plantilla bajo path."""
    exts = (".html", ".htm", ".astro", ".vue", ".jsx", ".tsx", ".php", ".ejs", ".hbs", ".liquid")
    if os.path.isfile(path):
        return [path]
    files = []
    skip_dirs = {"node_modules", ".git", "dist", "build", ".next", ".astro", "vendor"}
    for root, dirs, names in os.walk(path):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for name in names:
            if name.endswith(exts):
                files.append(os.path.join(root, name))
    return files


def print_report(results, as_json):
    if as_json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
        return

    total_findings = sum(len(r["findings"]) for r in results)
    print("\n" + "=" * 70)
    print(f"  AUDITORÍA SEO — {len(results)} documento(s), {total_findings} hallazgo(s)")
    print("=" * 70)

    # Agregado por severidad
    counts = {"critical": 0, "important": 0, "minor": 0}
    for r in results:
        for f in r["findings"]:
            counts[f["severity"]] = counts.get(f["severity"], 0) + 1
    print(f"  🔴 Críticos: {counts['critical']}   "
          f"🟠 Importantes: {counts['important']}   "
          f"🟡 Menores: {counts['minor']}\n")

    for r in results:
        print("-" * 70)
        print(f"📄 {r['source']}")
        s = r["summary"]
        print(f"   title: \"{(s['title'] or '—')[:70]}\" ({s['title_len']} car.) | "
              f"H1: {s['h1_count']} | imgs: {s['images']} (sin alt: {s['images_no_alt']}) | "
              f"JSON-LD: {s['jsonld_blocks']}")
        if not r["findings"]:
            print("   ✅ Sin problemas detectados.")
            continue
        ordered = sorted(r["findings"], key=lambda f: SEVERITY_ORDER[f["severity"]])
        for f in ordered:
            print(f"   {SEVERITY_LABEL[f['severity']]}  [{f['check']}] {f['message']}")
    print("-" * 70)
    print("\nSiguiente paso: prioriza los 🔴 críticos, luego 🟠. Valida structured")
    print("data en el Rich Results Test y Core Web Vitals en PageSpeed Insights.\n")


def main():
    ap = argparse.ArgumentParser(description="Auditor SEO on-page.")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--path", help="Archivo o directorio a auditar (recursivo).")
    g.add_argument("--url", help="URL en vivo a auditar (requiere red).")
    ap.add_argument("--json", action="store_true", help="Salida en formato JSON.")
    args = ap.parse_args()

    results = []

    if args.url:
        parsed = urlparse(args.url)
        if not parsed.scheme:
            print("Error: la URL debe incluir el esquema (https://).", file=sys.stderr)
            sys.exit(1)
        try:
            html = fetch_url(args.url)
        except Exception as e:
            print(f"Error al descargar {args.url}: {e}", file=sys.stderr)
            sys.exit(1)
        findings, summary = analyze(html, args.url)
        results.append({"source": args.url, "findings": findings, "summary": summary})
    else:
        files = collect_html_files(args.path)
        if not files:
            print(f"No se encontraron archivos HTML/plantilla en: {args.path}", file=sys.stderr)
            sys.exit(1)
        for fp in files:
            try:
                with open(fp, "r", encoding="utf-8", errors="replace") as fh:
                    html = fh.read()
            except Exception as e:
                results.append({"source": fp, "findings": [
                    {"severity": "critical", "check": "read", "message": f"No se pudo leer: {e}"}],
                    "summary": {"title": None, "title_len": 0, "description": None,
                                "description_len": 0, "h1_count": 0, "headings": 0,
                                "images": 0, "images_no_alt": 0, "jsonld_blocks": 0,
                                "canonical": None, "lang": None}})
                continue
            findings, summary = analyze(html, fp)
            results.append({"source": fp, "findings": findings, "summary": summary})

    print_report(results, args.json)


if __name__ == "__main__":
    main()
