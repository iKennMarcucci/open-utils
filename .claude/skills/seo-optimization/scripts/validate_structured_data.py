#!/usr/bin/env python3
"""
validate_structured_data.py - Valida bloques JSON-LD en HTML.

Extrae todos los <script type="application/ld+json"> de un archivo/URL, verifica
que sean JSON válido, que tengan @context y @type, y comprueba las propiedades
recomendadas de los tipos más comunes (Article, Product, LocalBusiness, FAQPage,
BreadcrumbList, Organization, WebSite, Event, Recipe).

NO reemplaza al Rich Results Test oficial de Google; es una comprobación previa
rápida para detectar errores obvios antes de subir cambios.

Uso:
    python validate_structured_data.py --path pagina.html
    python validate_structured_data.py --url https://sitio.com/pagina
    python validate_structured_data.py --json '{"@context":"https://schema.org",...}'
"""

import argparse
import json
import re
import sys

# Propiedades recomendadas por tipo (subconjunto pragmático de Google/Schema.org)
RECOMMENDED = {
    "Article": ["headline", "image", "datePublished", "author", "publisher"],
    "BlogPosting": ["headline", "image", "datePublished", "author", "publisher"],
    "NewsArticle": ["headline", "image", "datePublished", "author", "publisher"],
    "Product": ["name", "image", "offers"],
    "Offer": ["price", "priceCurrency", "availability"],
    "LocalBusiness": ["name", "address", "telephone"],
    "Organization": ["name", "url"],
    "WebSite": ["name", "url"],
    "FAQPage": ["mainEntity"],
    "Question": ["name", "acceptedAnswer"],
    "BreadcrumbList": ["itemListElement"],
    "Event": ["name", "startDate", "location"],
    "Recipe": ["name", "image", "recipeIngredient", "recipeInstructions"],
    "Person": ["name"],
    "VideoObject": ["name", "thumbnailUrl", "uploadDate"],
}

JSONLD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)


def extract_blocks(html):
    return [m.strip() for m in JSONLD_RE.findall(html)]


def get_types(obj):
    """Devuelve la lista de @type presentes en un objeto (maneja string o lista)."""
    t = obj.get("@type")
    if t is None:
        return []
    return t if isinstance(t, list) else [t]


def validate_object(obj, path="root", issues=None):
    if issues is None:
        issues = []
    if not isinstance(obj, dict):
        return issues

    types = get_types(obj)
    for t in types:
        if t in RECOMMENDED:
            for prop in RECOMMENDED[t]:
                if prop not in obj:
                    issues.append(("warn", f"{path} ({t}): falta propiedad recomendada '{prop}'."))

    # Recorre @graph
    if "@graph" in obj and isinstance(obj["@graph"], list):
        for i, node in enumerate(obj["@graph"]):
            validate_object(node, f"{path}.@graph[{i}]", issues)

    # Recorre valores anidados que sean objetos con @type
    for key, val in obj.items():
        if isinstance(val, dict) and "@type" in val:
            validate_object(val, f"{path}.{key}", issues)
        elif isinstance(val, list):
            for i, item in enumerate(val):
                if isinstance(item, dict) and "@type" in item:
                    validate_object(item, f"{path}.{key}[{i}]", issues)
    return issues


def validate_block(raw, index):
    result = {"index": index, "valid_json": False, "issues": []}
    try:
        data = json.loads(raw)
        result["valid_json"] = True
    except json.JSONDecodeError as e:
        result["issues"].append(("error", f"JSON inválido: {e}"))
        return result

    nodes = data if isinstance(data, list) else [data]
    for node in nodes:
        if not isinstance(node, dict):
            result["issues"].append(("error", "El bloque no es un objeto JSON-LD."))
            continue
        if "@context" not in node and "@graph" not in node:
            result["issues"].append(("warn", "Falta @context (debería ser https://schema.org)."))
        if "@type" not in node and "@graph" not in node:
            result["issues"].append(("error", "Falta @type."))
        validate_object(node, f"bloque[{index}]", result["issues"])
    return result


def main():
    ap = argparse.ArgumentParser(description="Valida structured data JSON-LD.")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--path", help="Archivo HTML a analizar.")
    g.add_argument("--url", help="URL a analizar (requiere red).")
    g.add_argument("--json", dest="raw_json", help="Cadena JSON-LD a validar directamente.")
    args = ap.parse_args()

    blocks = []
    if args.raw_json:
        blocks = [args.raw_json]
    elif args.path:
        with open(args.path, "r", encoding="utf-8", errors="replace") as fh:
            blocks = extract_blocks(fh.read())
    else:
        try:
            from urllib.request import Request, urlopen
            req = Request(args.url, headers={"User-Agent": "SEO-Audit-Skill/1.0"})
            with urlopen(req, timeout=20) as resp:  # noqa: S310
                charset = resp.headers.get_content_charset() or "utf-8"
                html = resp.read().decode(charset, errors="replace")
            blocks = extract_blocks(html)
        except Exception as e:
            print(f"Error al descargar {args.url}: {e}", file=sys.stderr)
            sys.exit(1)

    if not blocks:
        print("No se encontró structured data (JSON-LD) en la entrada.")
        sys.exit(0)

    print(f"Se encontraron {len(blocks)} bloque(s) JSON-LD.\n")
    total_errors = 0
    for i, raw in enumerate(blocks):
        res = validate_block(raw, i + 1)
        status = "✅" if res["valid_json"] and not any(s == "error" for s, _ in res["issues"]) else "❌"
        print(f"{status} Bloque #{i + 1}")
        if not res["issues"]:
            print("   Sin problemas detectados.")
        for severity, msg in res["issues"]:
            if severity == "error":
                total_errors += 1
            icon = "🔴" if severity == "error" else "🟡"
            print(f"   {icon} {msg}")
        print()

    print("Recuerda validar también en el Rich Results Test oficial de Google:")
    print("  https://search.google.com/test/rich-results")
    sys.exit(1 if total_errors else 0)


if __name__ == "__main__":
    main()
