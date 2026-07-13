import Link from "next/link";
import { HomeView } from "@/components/HomeView";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeGraph } from "@/lib/seo/jsonld";
import { HOME_FAQS } from "@/lib/seo/tools";
import { REPO_URL } from "@/lib/seo/site";

export default function Home() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <HomeView />
      <HomeContent />
    </>
  );
}

/**
 * Server-rendered prose. The bento grid above is a navigation surface; this is
 * the part that actually says what the site is and why it exists, so it has to
 * be in the initial HTML — AI crawlers never run the JS that renders the grid.
 */
function HomeContent() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-4xl px-6 py-14 md:px-10 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          ¿Por qué importa que no se suban tus archivos?
        </h2>
        <div className="mt-5 space-y-4 text-base text-foreground-subtle leading-relaxed text-pretty">
          <p>
            La mayoría de conversores y editores de PDF gratuitos siguen el mismo patrón: eliges
            el archivo, se sube a sus servidores, se procesa allí y descargas el resultado.
            Funciona, pero implica tres cosas que casi nadie lee en los términos de servicio: tu
            archivo se copia a una máquina que no controlas, permanece ahí durante un tiempo y, en
            la práctica, estás confiando tu documento a un tercero.
          </p>
          <p>
            Para una foto de vacaciones da igual. Para un contrato firmado, una factura con tus
            datos fiscales, un historial médico o documentación de un cliente, no da igual — y en
            muchos entornos profesionales incumple directamente la política interna.
          </p>
          <p>
            Open Utils elimina el problema de raíz en lugar de prometer que borrará bien los
            archivos. Los navegadores modernos ya son capaces de leer y reescribir un PDF,
            redimensionar una imagen o recodificar un video sin ayuda de un servidor; Open Utils
            simplemente usa esa capacidad. Sin subida no hay copia, sin copia no hay retención, y
            sin retención no hay nada que confiar a nadie.
          </p>
        </div>

        <h2 className="mt-14 text-2xl font-semibold tracking-tight text-foreground">
          Cómo funciona
        </h2>
        <div className="mt-5 space-y-4 text-base text-foreground-subtle leading-relaxed text-pretty">
          <p>
            Al abrir cualquier herramienta, el navegador descarga una vez el código que la hace
            funcionar. A partir de ahí, cuando arrastras un archivo, el navegador lo lee desde el
            disco a su propia memoria y trabaja sobre él ahí mismo. Al terminar, genera el
            resultado y lo guarda en tu carpeta de descargas. En ningún momento de ese recorrido
            hay una petición de red que contenga tu documento.
          </p>
          <p>
            Puedes verificarlo sin fiarte de nuestra palabra: abre las herramientas de desarrollo
            del navegador, entra en la pestaña Red, usa cualquier herramienta y comprueba que no
            sale ninguna petición con tu archivo. Y como el proyecto es de código abierto, el
            código que se ejecuta en tu navegador está publicado íntegro en{" "}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-text underline-offset-4 hover:underline"
            >
              GitHub
            </a>{" "}
            y cualquiera puede auditarlo.
          </p>
          <p>
            Para ser exactos: sí verás un par de peticiones, las de una medición anónima y sin
            cookies que cuenta cuántas veces se abre cada herramienta y cuánto tarda la página en
            cargar. No identifica a nadie, no crea un perfil y, sobre todo, no toca tus archivos:
            ellos no salen de tu equipo.
          </p>
          <p>
            El efecto secundario agradable es la velocidad: sin subida ni cola de espera, el
            resultado es prácticamente inmediato.
          </p>
        </div>

        <h2
          id="faq"
          className="mt-14 scroll-mt-8 text-2xl font-semibold tracking-tight text-foreground"
        >
          Preguntas frecuentes
        </h2>
        <div className="mt-5 divide-y divide-border border-y border-border">
          {HOME_FAQS.map((faq) => (
            <div key={faq.q} className="py-5">
              <h3 className="text-base font-medium text-foreground">{faq.q}</h3>
              <p className="mt-2 text-sm text-foreground-subtle leading-relaxed text-pretty">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* The bento cards link by tool name; these link by what people actually
            type into Google. Both matter — this is the descriptive anchor text. */}
        <p className="mt-10 text-sm text-foreground-subtle leading-relaxed">
          ¿Buscas algo concreto? Puedes{" "}
          <Link href="/editor-pdf" className="text-accent-text underline-offset-4 hover:underline">
            editar un PDF sin marca de agua
          </Link>
          ,{" "}
          <Link
            href="/pdf-a-imagen"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            convertir un PDF a JPG o PNG
          </Link>
          ,{" "}
          <Link href="/unir-pdf" className="text-accent-text underline-offset-4 hover:underline">
            unir varios PDF en uno
          </Link>
          ,{" "}
          <Link href="/dividir-pdf" className="text-accent-text underline-offset-4 hover:underline">
            dividir un PDF y separar sus páginas
          </Link>
          ,{" "}
          <Link href="/video-a-gif" className="text-accent-text underline-offset-4 hover:underline">
            convertir un video a GIF
          </Link>
          ,{" "}
          <Link
            href="/editor-imagen"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            dibujar y escribir sobre una imagen
          </Link>{" "}
          o{" "}
          <Link
            href="/formato-json"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            formatear y validar JSON
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
