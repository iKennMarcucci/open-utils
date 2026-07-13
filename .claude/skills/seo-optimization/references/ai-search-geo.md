# AI Search / GEO (Generative Engine Optimization)

Los buscadores generativos (Google AI Overviews / AI Mode, ChatGPT Search,
Perplexity, Copilot, Gemini) responden directamente y **citan fuentes**. Aparecer
como fuente citada es el nuevo objetivo, además del ranking clásico. Esto se llama
GEO (Generative Engine Optimization) o AEO (Answer Engine Optimization).

El SEO clásico sigue siendo la base: estos motores se apoyan en gran medida en
contenido que ya rankea y es rastreable. GEO **amplía** el SEO, no lo reemplaza.

## Qué priorizan los motores generativos

1. **Contenido citable**: información clara, verificable y autocontenida que el
   modelo pueda extraer y atribuir.
2. **Respuestas directas**: definiciones y respuestas explícitas cerca del
   encabezado que plantea la pregunta.
3. **Datos y fuentes**: estadísticas concretas, fechas, cifras y citas a fuentes
   autorizadas aumentan la probabilidad de ser citado.
4. **Estructura clara**: encabezados que son preguntas, listas, tablas y pasos
   son fáciles de parsear y reutilizar.
5. **Autoridad y confianza** (E-E-A-T): las IAs favorecen fuentes con reputación.
6. **Frescura**: contenido actualizado con fechas visibles.

## Tácticas accionables

- **Estructura pregunta-respuesta**: usa encabezados en forma de pregunta
  ("¿Qué es el SEO técnico?") seguidos de una respuesta directa de 2-3 frases
  antes de ampliar. Facilita la extracción.
- **Resúmenes y TL;DR**: bloques que sintetizan la respuesta clave.
- **Datos originales**: encuestas, estudios y cifras propias son muy citables
  (nadie más las tiene).
- **Structured data**: `FAQPage`, `HowTo`, `Article`, `Product` ayudan a las IAs
  a interpretar el contenido (ver `structured-data.md`).
- **Entidades claras**: define de qué/quién hablas sin ambigüedad; conecta con
  entidades conocidas (Wikipedia, Wikidata) cuando aplique.
- **Presencia multi-fuente**: las IAs sintetizan varias fuentes; menciones y
  enlaces desde sitios de referencia aumentan tu probabilidad de aparecer.

## llms.txt

Estándar emergente (análogo a robots.txt) para orientar a los agentes de IA sobre
el contenido más relevante de tu sitio. Es un archivo Markdown en la raíz
(`/llms.txt`) con enlaces a tus páginas y documentación clave.

> Adopción aún parcial y en evolución: no todos los motores lo respetan. Impleméntalo
> como complemento de bajo coste, no como reemplazo del SEO técnico. Verifica el
> estado del estándar antes de prometer resultados.

Estructura mínima:

```markdown
# Nombre del sitio

> Descripción breve de qué ofrece el sitio.

## Documentación
- [Guía de SEO técnico](https://dominio.com/seo-tecnico): cómo optimizar el rastreo.
- [Precios](https://dominio.com/precios): planes y tarifas.

## Recursos
- [Blog](https://dominio.com/blog): artículos actualizados sobre SEO.
```

## Control de rastreo de bots de IA

Puedes permitir o bloquear rastreadores de IA en `robots.txt` según tu estrategia
(algunos entrenan modelos, otros solo citan en tiempo real). Bloquear el rastreo
para citación reduce tu visibilidad en esos motores; decídelo conscientemente.

```
# Ejemplo: permitir citación pero controlar entrenamiento (revisa nombres actuales)
User-agent: GPTBot
Disallow: /

User-agent: OAI-SearchBot
Allow: /
```

> Los nombres de user-agents de IA cambian con frecuencia. Verifica la lista
> vigente de cada proveedor antes de configurar.

## Medición

- **Search Console**: el tráfico desde AI Overviews aparece mezclado en el
  informe de rendimiento; vigila impresiones/clics en consultas informacionales.
- **Menciones en IA**: prueba manualmente tus keywords en ChatGPT, Perplexity,
  Gemini y observa si te citan. Existen herramientas específicas de seguimiento de
  visibilidad en IA en aparición constante.
- **Tráfico de referencia**: revisa referrals desde dominios de asistentes de IA
  en tu analytics.

## Realismo

GEO es un campo joven y volátil (2025-2026). Las mejores prácticas evolucionan
rápido y la atribución es imperfecta. Prioriza los fundamentos (contenido útil,
estructurado, confiable y rastreable): es lo que consistentemente funciona tanto
para SEO clásico como para IA. Evita "hacks" no verificados.
