"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  ImagePlay,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  Video,
  Layers,
  Scissors,
  ShieldCheck,
  Pencil,
  Brush,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { REPO_URL, GithubIcon } from "@/components/Footer";

const RAIL_WIDTH = 72;

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Independent toggle state just for the sidebar visual title
  const [pdfToolMode, setPdfToolMode] = useState<"pdf-to-img" | "img-to-pdf">("pdf-to-img");
  const [videoToolMode, setVideoToolMode] = useState<"video-to-gif" | "gif-to-video">("video-to-gif");
  const [pdfOrgMode, setPdfOrgMode] = useState<"merge" | "split">("merge");
  const [editorMode, setEditorMode] = useState<"pdf" | "img">("pdf");

  // Tooltip shown when the rail is collapsed. Rendered as a fixed sibling so it
  // escapes the sidebar's `overflow-hidden`. We store only the id + vertical
  // anchor; the item (and its live name) is looked up at render time.
  const [tip, setTip] = useState<{ id: string; top: number } | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();

  const clearTipTimer = () => {
    if (tipTimer.current) {
      clearTimeout(tipTimer.current);
      tipTimer.current = null;
    }
  };
  const openTip = (id: string, el: HTMLElement) => {
    clearTipTimer();
    const rect = el.getBoundingClientRect();
    setTip({ id, top: rect.top + rect.height / 2 });
  };
  const scheduleCloseTip = () => {
    clearTipTimer();
    tipTimer.current = setTimeout(() => setTip(null), 120);
  };

  const handleTogglePdfMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPdfToolMode((prev) => (prev === "pdf-to-img" ? "img-to-pdf" : "pdf-to-img"));
  };

  const handleToggleVideoMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoToolMode((prev) => (prev === "video-to-gif" ? "gif-to-video" : "video-to-gif"));
  };

  const handleTogglePdfOrgMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPdfOrgMode((prev) => (prev === "merge" ? "split" : "merge"));
  };

  const handleToggleEditorMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditorMode((prev) => (prev === "pdf" ? "img" : "pdf"));
  };

  const navItems = [
    {
      id: "dashboard",
      name: "Inicio",
      icon: LayoutGrid,
      href: "/",
      matchPath: "/",
      hasToggle: false,
    },
    {
      id: "editor",
      name: editorMode === "pdf" ? "Editor PDF" : "Editor IMG",
      icon: editorMode === "pdf" ? Pencil : Brush,
      href: editorMode === "pdf" ? "/pdf-editor" : "/image-editor",
      matchPath: editorMode === "pdf" ? "/pdf-editor" : "/image-editor",
      hasToggle: true,
      onToggle: handleToggleEditorMode,
      isFlipped: editorMode === "img",
    },
    {
      id: "pdf-converter",
      name: pdfToolMode === "pdf-to-img" ? "PDF a IMG" : "IMG a PDF",
      // Icon reflects the conversion target: image for PDF→IMG, PDF for IMG→PDF.
      icon: pdfToolMode === "pdf-to-img" ? ImageIcon : FileText,
      href: `/pdf-converter?mode=${pdfToolMode}`,
      matchPath: "/pdf-converter",
      hasToggle: true,
      onToggle: handleTogglePdfMode,
      isFlipped: pdfToolMode === "img-to-pdf",
    },
    {
      id: "video-converter",
      name: videoToolMode === "video-to-gif" ? "Video a GIF" : "GIF a Video",
      // Icon reflects the target: GIF for Video→GIF, video for GIF→Video.
      icon: videoToolMode === "video-to-gif" ? ImagePlay : Video,
      href: `/video-converter?mode=${videoToolMode}`,
      matchPath: "/video-converter",
      hasToggle: true,
      onToggle: handleToggleVideoMode,
      isFlipped: videoToolMode === "gif-to-video",
    },
    {
      id: "pdf-organizer",
      name: pdfOrgMode === "merge" ? "Unificador PDF" : "Separador PDF",
      icon: pdfOrgMode === "merge" ? Layers : Scissors,
      href: `/pdf-organizer?mode=${pdfOrgMode}`,
      matchPath: "/pdf-organizer",
      hasToggle: true,
      onToggle: handleTogglePdfOrgMode,
      isFlipped: pdfOrgMode === "split",
    },
  ];

  const tipItem = tip ? navItems.find((i) => i.id === tip.id) : null;

  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menú"
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-surface border border-border rounded-control text-foreground-muted hover:text-foreground transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? RAIL_WIDTH : 272 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full overflow-hidden bg-background-elevated border-r border-border shadow-lg lg:shadow-none transition-transform duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "relative flex items-center h-16 border-b border-border shrink-0",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <Link
            href="/"
            onClick={closeOnMobile}
            aria-label="Open Utils — Inicio"
            className={cn(
              "flex items-center rounded-control focus-visible:outline-none",
              isCollapsed ? "justify-center" : "gap-2.5 min-w-0"
            )}
          >
            <Logo className="shrink-0" />
            {!isCollapsed && (
              <span className="font-semibold text-[15px] whitespace-nowrap text-foreground tracking-tight">
                Open Utils
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label="Cerrar menú"
                className="lg:hidden p-1.5 rounded-control text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                aria-label="Colapsar barra lateral"
                className="hidden lg:flex p-1.5 rounded-control text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="p-3 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
          <p
            className={cn(
              "ou-label px-3 pt-2 pb-1.5 whitespace-nowrap transition-opacity duration-150",
              isCollapsed && "opacity-0 pointer-events-none h-0 p-0 overflow-hidden"
            )}
          >
            Herramientas
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.matchPath;
            return (
              <Link
                href={item.href}
                key={item.id}
                onClick={closeOnMobile}
                onMouseEnter={(e) => isCollapsed && openTip(item.id, e.currentTarget)}
                onMouseLeave={() => isCollapsed && scheduleCloseTip()}
                className={cn(
                  "group relative flex items-center h-10 rounded-control transition-colors duration-200",
                  isCollapsed ? "justify-center px-0" : "justify-between px-3",
                  isActive
                    ? "bg-surface-hover text-foreground"
                    : "text-foreground-muted hover:bg-surface hover:text-foreground"
                )}
              >
                {/* Active accent bar — only meaningful when expanded */}
                {isActive && !isCollapsed && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent"
                  />
                )}

                <div className={cn("flex items-center min-w-0", !isCollapsed && "gap-3")}>
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-foreground-faint group-hover:text-foreground-muted"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap font-medium text-sm truncate">
                      {item.name}
                    </span>
                  )}
                </div>

                {!isCollapsed && item.hasToggle && (
                  <button
                    onClick={item.onToggle}
                    className="p-1.5 rounded-md text-foreground-faint hover:text-foreground hover:bg-surface-strong transition-colors shrink-0"
                    title="Cambiar conversor"
                  >
                    <RefreshCw
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-500",
                        item.isFlipped && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — trust badge when expanded, expand control when collapsed */}
        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Código fuente en GitHub"
            aria-label="Código fuente en GitHub"
            className={cn(
              "flex items-center h-9 rounded-control text-foreground-muted hover:bg-surface hover:text-foreground transition-colors",
              isCollapsed ? "justify-center px-0" : "gap-3 px-3"
            )}
          >
            <GithubIcon className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap font-medium text-sm">Código fuente</span>
            )}
          </a>
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              aria-label="Expandir barra lateral"
              title="Expandir barra lateral"
              className="flex items-center justify-center w-full h-[52px] rounded-control bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-hover hover:border-border-strong transition-colors"
            >
              <PanelLeftOpen className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5 px-3 h-[52px] rounded-control bg-surface border border-border">
              <ShieldCheck className="w-4 h-4 text-success-text shrink-0" />
              <div className="leading-tight whitespace-nowrap overflow-hidden">
                <p className="text-xs font-medium text-foreground">100% local</p>
                <p className="text-[11px] text-foreground-faint">Nada sale de tu equipo</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Collapsed-rail tooltip (fixed sibling so it isn't clipped by the rail) */}
      <AnimatePresence>
        {isCollapsed && tip && tipItem && (
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: tip.top, left: RAIL_WIDTH }}
            onMouseEnter={clearTipTimer}
            onMouseLeave={scheduleCloseTip}
            className="fixed z-60 hidden lg:flex -translate-y-1/2 pl-2"
          >
            <div className="flex items-stretch rounded-control border border-border-strong bg-surface-strong shadow-lg overflow-hidden">
              {/* Text part → navigates to the tool */}
              <Link
                href={tipItem.href}
                onClick={() => { setTip(null); closeOnMobile(); }}
                className="whitespace-nowrap text-sm font-medium text-foreground px-3 py-2 hover:bg-surface-hover transition-colors focus-visible:outline-none"
              >
                {tipItem.name}
              </Link>
              {/* Reload part → swaps the link to the counterpart tool */}
              {tipItem.hasToggle && (
                <>
                  <span className="w-px self-stretch bg-border" />
                  <button
                    onClick={tipItem.onToggle}
                    title="Cambiar conversor"
                    aria-label="Cambiar conversor"
                    className="flex items-center justify-center w-9 self-stretch text-foreground-faint hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <RefreshCw
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-500",
                        tipItem.isFlipped && "rotate-180"
                      )}
                    />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
