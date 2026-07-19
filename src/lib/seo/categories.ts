/**
 * Content + SEO source of truth for the category landing pages.
 *
 * Each category owns a route at `/{id}` that lists its tools in a grid. The same
 * entry feeds the page `metadata`, the visible copy and the CollectionPage
 * JSON-LD — the same single-source discipline as `tools.ts`, so the markup and
 * the visible text cannot drift apart.
 *
 * The tool → category link lives in `tools.ts` (`ToolSeo.category`); this file
 * only adds the human-facing label, the route copy and the ordering. It reads
 * the tools to build each group, so it must not be imported *by* tools.ts.
 */
import type { CategoryId } from "./tools";

export type CategorySeo = {
  /** Also the route slug: `/{id}`. */
  id: CategoryId;
  /** Human-readable name shown in the sidebar, cards and breadcrumbs. */
  label: string;
  /** One short line under the label (sidebar flyout, cards). */
  tagline: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
};

export const CATEGORIES: Record<CategoryId, CategorySeo> = {
  documentos: {
    id: "documentos",
    label: "PDF y documentos",
    tagline: "Edita, convierte, une y divide PDF",
    title: "Herramientas para PDF gratis y sin subir archivos | Open Utils",
    description:
      "Edita, convierte, une y divide PDF directamente en tu navegador. Gratis, sin marca de agua y sin subir tus documentos a ningún servidor.",
    h1: "Herramientas para PDF y documentos, en tu navegador",
    intro: [
      "Todo lo que necesitas hacer con un PDF sin instalar Acrobat ni pasar por una web que se queda con tu archivo: escribir y firmar encima, convertir páginas a imagen o al revés, y unir o dividir documentos. Cada herramienta se abre al instante y trabaja en local.",
      "Es justo el tipo de archivo con el que la privacidad importa: contratos, nóminas, informes, justificantes. Aquí ninguno de esos documentos sale de tu equipo, porque el procesamiento ocurre dentro del navegador y no hay ninguna subida a un servidor.",
    ],
  },
  "imagen-y-video": {
    id: "imagen-y-video",
    label: "Imagen y video",
    tagline: "Anota imágenes y convierte video y GIF",
    title: "Editar imágenes y convertir video online | Open Utils",
    description:
      "Dibuja y anota sobre tus imágenes, y convierte entre video y GIF sin subir nada. Gratis, sin marca de agua y procesado íntegramente en tu navegador.",
    h1: "Herramientas de imagen y video en tu navegador",
    intro: [
      "Anota una captura de pantalla, exporta en PNG o JPG, recorta un fragmento de video para convertirlo en GIF o pasa un GIF a un MP4 mucho más ligero. Son las tareas rápidas de imagen y video que uno hace a diario, sin abrir un editor pesado.",
      "Las capturas y los vídeos que uno retoca suelen contener lo que no debería salir de la empresa: un panel interno, una conversación, datos de un cliente. Por eso todo se procesa en tu navegador —el video con FFmpeg compilado a WebAssembly— y nada se sube a ningún servidor.",
    ],
  },
  desarrollo: {
    id: "desarrollo",
    label: "Código y datos",
    tagline: "Formatea JSON y codifica Base64",
    title: "Herramientas para programadores online | Open Utils",
    description:
      "Formatea y valida JSON, y codifica o decodifica Base64 al instante. Seguro para datos sensibles: todo se procesa en tu navegador, sin enviar nada a ningún servidor.",
    h1: "Herramientas de código y datos para programadores",
    intro: [
      "Formatea, valida y minifica JSON, y codifica o decodifica Base64 con UTF-8 correcto, todo al instante y sin salir del navegador. Las utilidades de cada día para quien trabaja con APIs, configuraciones y payloads.",
      "Lo que uno pega en estas herramientas casi nunca es inocente: la respuesta de una API de producción, un token, un volcado con datos de clientes. Pegarlo en una web que lo envía a su servidor es filtrar esos datos. Aquí no puede pasar, porque el procesamiento es 100% local.",
    ],
  },
};

/** Canonical order of the categories — drives the sidebar and the home. */
export const CATEGORY_ORDER: CategoryId[] = ["documentos", "imagen-y-video", "desarrollo"];

export const ALL_CATEGORIES: CategorySeo[] = CATEGORY_ORDER.map((id) => CATEGORIES[id]);

export function getCategory(id: string): CategorySeo {
  const category = CATEGORIES[id as CategoryId];
  if (!category) throw new Error(`Unknown category id: ${id}`);
  return category;
}

export function isCategoryId(id: string): id is CategoryId {
  return id in CATEGORIES;
}
