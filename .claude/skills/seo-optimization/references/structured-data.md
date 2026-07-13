# Structured Data (Schema.org / JSON-LD)

Los datos estructurados ayudan a Google a entender el contenido y habilitan
**rich results** (estrellas, FAQ desplegables, breadcrumbs, precios, etc.), que
mejoran visibilidad y CTR. Plantillas listas en
`assets/structured-data-templates.json`.

## Reglas fundamentales

1. **Usa JSON-LD** (formato recomendado por Google). Va en un `<script>` en el
   `<head>` o `<body>`. Más fácil de mantener que microdata/RDFa.
2. **Refleja contenido visible**: el markup debe describir lo que el usuario ve.
   Marcar datos ocultos o falsos → acción manual por spam.
3. **Elige el tipo correcto** según la página (ver catálogo abajo).
4. **Valida siempre**: `scripts/validate_structured_data.py` + Rich Results Test
   oficial de Google + validador de Schema.org.
5. Rellena las propiedades **requeridas y recomendadas** de cada tipo; a más
   completitud, más probabilidad de rich result.
6. Puedes tener **varios bloques** JSON-LD por página (ej: Organization + Article
   + BreadcrumbList) o combinarlos con `@graph`.

## Estructura base

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TIPO",
  "propiedad": "valor"
}
</script>
```

## Catálogo de tipos por caso de uso

### Organization (toda la web, en home)
Identidad de la marca. Habilita el panel de conocimiento y logo.
Propiedades clave: `name`, `url`, `logo`, `sameAs` (redes sociales),
`contactPoint`.

### WebSite + SearchAction (home)
Habilita el sitelinks searchbox. Incluye `potentialAction` de tipo `SearchAction`
con el patrón de URL de tu buscador interno.

### Article / BlogPosting / NewsArticle (contenido editorial)
Requeridas/recomendadas: `headline`, `image`, `datePublished`, `dateModified`,
`author` (con `@type: Person` u `Organization`), `publisher`. El `author` real y
verificable es señal de E-E-A-T.

### Product + Offer + AggregateRating (fichas de producto)
Habilita precio, disponibilidad y estrellas en resultados. Incluye `name`,
`image`, `description`, `sku`/`gtin`, `brand`, `offers` (con `price`,
`priceCurrency`, `availability`), y `aggregateRating`/`review` si son **reales y
visibles** (Google endureció las políticas de reviews autoproclamadas).

### LocalBusiness (negocios físicos)
Para SEO local. `name`, `address` (PostalAddress), `geo`, `telephone`,
`openingHoursSpecification`, `priceRange`, `url`. Subtiposcomo `Restaurant`,
`Store`, `Dentist` dan features específicas. Ver `local-international-seo.md`.

### FAQPage (páginas con preguntas frecuentes)
Cada `Question` con su `acceptedAnswer`. Las preguntas/respuestas deben estar
**visibles** en la página. Nota: Google restringió los rich results de FAQ a
sitios gubernamentales y de salud autorizados, pero el markup sigue siendo útil
para comprensión y para AI search.

### HowTo (guías paso a paso)
Pasos con `HowToStep`. Igual que FAQ, los rich results se han reducido, pero
ayuda a la comprensión y a los buscadores con IA.

### BreadcrumbList (migas de pan)
Muestra la jerarquía de navegación en los resultados. Lista de `ListItem` con
`position`, `name` e `item` (URL).

### Recipe (recetas)
`name`, `image`, `author`, `datePublished`, `description`, `recipeIngredient`,
`recipeInstructions`, `nutrition`, `aggregateRating`, `cookTime`, `prepTime`.

### Event (eventos)
`name`, `startDate`, `endDate`, `location`, `offers`, `eventStatus`,
`eventAttendanceMode` (presencial/online/híbrido).

### VideoObject (vídeos)
`name`, `description`, `thumbnailUrl`, `uploadDate`, `duration`, `contentUrl`.

## Ejemplo completo: Article

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Guía de SEO técnico 2026",
  "image": ["https://dominio.com/img/seo-tecnico.jpg"],
  "datePublished": "2026-01-15T08:00:00+01:00",
  "dateModified": "2026-01-20T10:30:00+01:00",
  "author": {
    "@type": "Person",
    "name": "Nombre Apellido",
    "url": "https://dominio.com/autor/nombre"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Marca",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dominio.com/logo.png"
    }
  }
}
</script>
```

## Ejemplo completo: Product

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Zapatillas Running Pro",
  "image": ["https://dominio.com/img/zapatilla.jpg"],
  "description": "Zapatillas ligeras para running de asfalto.",
  "sku": "ZR-1024",
  "brand": { "@type": "Brand", "name": "Marca" },
  "offers": {
    "@type": "Offer",
    "url": "https://dominio.com/zapatillas-running-pro",
    "priceCurrency": "EUR",
    "price": "119.99",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "184"
  }
}
</script>
```

## Combinar con @graph (varios tipos en un bloque)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://dominio.com/#org", "name": "Marca" },
    { "@type": "WebSite", "@id": "https://dominio.com/#web", "publisher": { "@id": "https://dominio.com/#org" } },
    { "@type": "BreadcrumbList", "itemListElement": [ /* ... */ ] }
  ]
}
</script>
```

## Errores comunes

- Marcar datos que no aparecen en la página (spam).
- Reviews inventadas o auto-otorgadas por la propia marca sobre sí misma.
- Fechas de `dateModified` falseadas para simular frescura.
- JSON malformado (comas finales, comillas incorrectas) → valida siempre.
- Usar el tipo equivocado (ej: `Product` en una página que no es de producto).
