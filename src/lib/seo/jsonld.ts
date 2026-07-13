/**
 * JSON-LD graph builders.
 *
 * Rules enforced here, deliberately:
 * - No `aggregateRating` / `review`: there are no real ratings. Self-serving
 *   review markup is a manual-action offence.
 * - No `SearchAction`: there is no site search. Marking one up would be lying.
 * - FAQ text comes from `TOOLS_SEO[...].faqs`, the same constant the visible FAQ
 *   renders from, so markup and page content cannot drift apart.
 */
import {
  SITE_URL,
  SITE_NAME,
  SITE_LANG,
  REPO_URL,
  AUTHOR_NAME,
  AUTHOR_URL,
  LICENSE_URL,
  ORG_ID,
  PERSON_ID,
  WEBSITE_ID,
  absoluteUrl,
} from "./site";
import { ALL_TOOLS, HOME_FAQS, type Faq, type ToolSeo } from "./tools";

const faqPage = (id: string, faqs: Faq[]) => ({
  "@type": "FAQPage",
  "@id": id,
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

/** Organization + Person + WebSite. Emitted once, from the root layout. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.png"),
          width: 512,
          height: 512,
        },
        description:
          "Open Utils es una colección de utilidades de archivos de código abierto que se ejecutan íntegramente en el navegador: los archivos no se suben a ningún servidor.",
        founder: { "@id": PERSON_ID },
        sameAs: [REPO_URL],
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: AUTHOR_NAME,
        url: AUTHOR_URL,
        sameAs: [AUTHOR_URL],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: absoluteUrl("/"),
        name: SITE_NAME,
        description:
          "Utilidades de archivos gratuitas y privadas que funcionan en tu navegador, sin subir nada a ningún servidor.",
        publisher: { "@id": ORG_ID },
        inLanguage: SITE_LANG,
        license: LICENSE_URL,
        // No SearchAction: the site has no search feature.
      },
    ],
  };
}

/** Home: the tool catalogue as an ItemList, plus the site-level FAQ. */
export function homeGraph() {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "Utilidades de archivos online y privadas",
        description:
          "Edita, convierte, une y divide PDF, imágenes y video desde el navegador, sin subir tus archivos a ningún servidor.",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: SITE_LANG,
      },
      {
        "@type": "ItemList",
        "@id": `${url}#tools`,
        name: "Herramientas de Open Utils",
        itemListElement: ALL_TOOLS.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: tool.name,
          url: absoluteUrl(`/${tool.slug}`),
        })),
      },
      faqPage(`${url}#faq`, HOME_FAQS),
    ],
  };
}

/** A tool page: the app itself, its breadcrumb, its FAQ and its how-to. */
export function toolGraph(tool: ToolSeo) {
  const url = absoluteUrl(`/${tool.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Both types: it is software, and it runs in the browser.
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${url}#app`,
        name: tool.name,
        url,
        description: tool.description,
        applicationCategory: tool.applicationCategory,
        applicationSubCategory: tool.applicationSubCategory,
        operatingSystem: "Any",
        browserRequirements: tool.browserRequirements,
        permissions:
          "No requiere permisos ni registro. Los archivos no se suben a ningún servidor.",
        isAccessibleForFree: true,
        inLanguage: SITE_LANG,
        license: LICENSE_URL,
        featureList: tool.features,
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": WEBSITE_ID },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        // No aggregateRating / review: there are no real ratings to report.
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: `Cómo usar ${tool.name}`,
        description: tool.description,
        totalTime: "PT2M",
        // Free, and requires no supplies — say so rather than inventing a cost.
        estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
        step: tool.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${url}#como-funciona`,
        })),
      },
      faqPage(`${url}#faq`, tool.faqs),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: absoluteUrl("/"),
          },
          // The last item carries no `item`: it is the current page.
          { "@type": "ListItem", position: 2, name: tool.name },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: tool.title,
        description: tool.description,
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#app` },
        inLanguage: SITE_LANG,
      },
    ],
  };
}

export { SITE_URL };
