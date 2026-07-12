import Link from "next/link";
import { FileText, ArrowRight, Video, Code, Layers } from "lucide-react";

export default function Home() {
  return (
    <main className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full min-h-full">
      <div className="mb-10 lg:mt-8">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Dashboard</h1>
        <p className="text-neutral-400">Selecciona una herramienta para comenzar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[200px]">
        {/* Main Active Tool */}
        <Link 
          href="/pdf-converter"
          className="group relative col-span-1 md:col-span-2 row-span-2 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors p-6 md:p-8 flex flex-col justify-end"
        >
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-neutral-300 group-hover:text-white transition-colors" />
          </div>
          
          <div className="relative z-10 mt-auto">
            <h2 className="text-3xl font-bold text-white mb-3">PDF ⇄ IMG</h2>
            <p className="text-neutral-400 max-w-md mb-6 md:mb-8 text-sm md:text-base">
              Convierte archivos PDF a imágenes de alta calidad o transforma múltiples imágenes en un solo documento PDF. Procesamiento completo en tu navegador.
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-white bg-white/10 px-4 py-2 rounded-full backdrop-blur-md group-hover:bg-white/20 transition-colors">
              Abrir herramienta <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Coming Soon Tools - Bento Filler */}
        <Link 
          href="/video-converter"
          className="group relative col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors p-6 flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6 text-neutral-300 group-hover:text-white transition-colors" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white group-hover:text-neutral-200 transition-colors">Video ⇄ GIF</h3>
            <p className="text-sm text-neutral-400 mt-1 text-xs">Convierte videos a GIF o crea videos desde imágenes</p>
          </div>
        </Link>

        <Link
          href="/merge-pdf"
          className="group relative col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors p-6 flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6 text-neutral-300 group-hover:text-white transition-colors" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white group-hover:text-neutral-200 transition-colors">Unir a PDF</h3>
            <p className="text-sm text-neutral-400 mt-1 text-xs">Combina varios PDFs e imágenes en un solo PDF paginado</p>
          </div>
        </Link>

        <div className="col-span-1 md:col-span-2 lg:col-span-1 rounded-3xl bg-neutral-900/50 border border-neutral-800/50 border-dashed p-6 flex flex-col justify-between opacity-50 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
            <Code className="w-6 h-6 text-neutral-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-300">Formato JSON</h3>
            <p className="text-sm text-neutral-600 mt-1 uppercase tracking-widest font-semibold">Próximamente</p>
          </div>
        </div>
      </div>
    </main>
  );
}
