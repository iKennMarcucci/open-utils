"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { GithubIcon } from "@/components/GithubIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { REPO_URL } from "@/lib/seo/site";
import { ALL_CATEGORIES } from "@/lib/seo/categories";
import { toolsInCategory, type CategoryId } from "@/lib/seo/tools";
import { CATEGORY_VISUALS, TOOL_ICONS, TOOL_FALLBACK_ICON } from "@/lib/catalog";

const RAIL_WIDTH = 72;
const PANEL_WIDTH = 272;

// The flyout is measured and repositioned before paint to keep it inside the
// viewport; useLayoutEffect on the client, useEffect on the server (no warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hover flyout. A category row opens a floating panel listing its tools. It is
  // a fixed sibling of the <aside> so it escapes the sidebar's overflow-hidden,
  // and we store only the category id + vertical anchor; the tools are looked up
  // at render time. A short close timer lets the pointer travel into the panel.
  const [flyout, setFlyout] = useState<{ id: string; top: number } | null>(null);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Resolved top-left corner after clamping the panel inside the viewport.
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelTop, setPanelTop] = useState<number | null>(null);

  const pathname = usePathname();
  const sidebarWidth = isCollapsed ? RAIL_WIDTH : PANEL_WIDTH;

  const clearFlyoutTimer = () => {
    if (flyoutTimer.current) {
      clearTimeout(flyoutTimer.current);
      flyoutTimer.current = null;
    }
  };
  const openFlyout = (id: string, el: HTMLElement) => {
    clearFlyoutTimer();
    const rect = el.getBoundingClientRect();
    setFlyout({ id, top: rect.top + rect.height / 2 });
  };
  const scheduleCloseFlyout = () => {
    clearFlyoutTimer();
    flyoutTimer.current = setTimeout(() => setFlyout(null), 140);
  };

  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  // A category row is active when its own page or any of its tools is open.
  const isCategoryActive = (id: CategoryId) =>
    pathname === `/${id}` || toolsInCategory(id).some((t) => pathname === `/${t.slug}`);

  const flyoutCategory = flyout ? ALL_CATEGORIES.find((c) => c.id === flyout.id) : null;

  // Center the panel on the hovered row, then clamp so it never spills past the
  // top or bottom of the viewport (tall categories near the top were clipped).
  useIsoLayoutEffect(() => {
    if (!flyout || !panelRef.current) {
      setPanelTop(null);
      return;
    }
    const margin = 12;
    const h = panelRef.current.offsetHeight;
    const max = Math.max(margin, window.innerHeight - h - margin);
    setPanelTop(Math.min(Math.max(flyout.top - h / 2, margin), max));
  }, [flyout]);

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
        animate={{ width: sidebarWidth }}
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
          {/* Inicio */}
          <Link
            href="/"
            onClick={closeOnMobile}
            onMouseEnter={() => scheduleCloseFlyout()}
            className={cn(
              "group relative flex items-center h-10 rounded-control transition-colors duration-200",
              isCollapsed ? "justify-center px-0" : "px-3 gap-3",
              pathname === "/"
                ? "bg-surface-hover text-foreground"
                : "text-foreground-muted hover:bg-surface hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap font-medium text-sm">Inicio</span>}
          </Link>

          <p
            className={cn(
              "ou-label px-3 pt-3 pb-1.5 whitespace-nowrap transition-opacity duration-150",
              isCollapsed && "opacity-0 pointer-events-none h-0 p-0 overflow-hidden"
            )}
          >
            Categorías
          </p>

          {ALL_CATEGORIES.map((category) => {
            const { icon: Icon, accent } = CATEGORY_VISUALS[category.id];
            const active = isCategoryActive(category.id);
            return (
              <Link
                href={`/${category.id}`}
                key={category.id}
                onClick={closeOnMobile}
                onMouseEnter={(e) => openFlyout(category.id, e.currentTarget)}
                onMouseLeave={scheduleCloseFlyout}
                className={cn(
                  "group relative flex items-center h-11 rounded-control transition-colors duration-200",
                  isCollapsed ? "justify-center px-0" : "px-3 gap-3",
                  active
                    ? "bg-surface-hover text-foreground"
                    : "text-foreground-muted hover:bg-surface hover:text-foreground"
                )}
              >
                {active && !isCollapsed && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent"
                  />
                )}
                <Icon
                  className="w-[18px] h-[18px] shrink-0 transition-colors"
                  style={{ color: active ? accent : undefined }}
                />
                {!isCollapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate whitespace-nowrap font-medium text-sm leading-tight">
                      {category.label}
                    </span>
                    <span className="block truncate text-[11px] leading-tight text-foreground-faint">
                      {toolsInCategory(category.id).length} herramientas
                    </span>
                  </span>
                )}
                {!isCollapsed && (
                  <ChevronRight className="w-4 h-4 shrink-0 text-foreground-faint transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — trust badge when expanded, expand control when collapsed */}
        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <ThemeToggle collapsed={isCollapsed} />
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
                <p className="text-[11px] text-foreground-faint">Tus archivos no salen de aquí</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Hover flyout: the category's tools, as a floating panel (fixed sibling so
          it isn't clipped by the sidebar). Works collapsed and expanded. */}
      <AnimatePresence>
        {flyoutCategory && (
          <motion.div
            key={flyoutCategory.id}
            ref={panelRef}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: panelTop ?? flyout!.top, left: sidebarWidth }}
            onMouseEnter={clearFlyoutTimer}
            onMouseLeave={scheduleCloseFlyout}
            className={cn(
              "fixed z-60 hidden max-h-[calc(100dvh-1.5rem)] lg:block pl-2",
              panelTop === null && "-translate-y-1/2"
            )}
          >
            <div className="flex max-h-[calc(100dvh-1.5rem)] w-64 flex-col overflow-hidden rounded-panel border border-border-strong bg-surface-strong shadow-xl">
              {/* Header links to the category landing page */}
              <Link
                href={`/${flyoutCategory.id}`}
                onClick={() => {
                  setFlyout(null);
                  closeOnMobile();
                }}
                className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5 hover:bg-surface-hover transition-colors focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {flyoutCategory.label}
                  </span>
                  <span className="block truncate text-[11px] text-foreground-faint">
                    {flyoutCategory.tagline}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground-faint" />
              </Link>

              <ul className="min-h-0 flex-1 overflow-y-auto custom-scrollbar p-1.5">
                {toolsInCategory(flyoutCategory.id).map((tool) => {
                  const ToolIcon = TOOL_ICONS[tool.slug] ?? TOOL_FALLBACK_ICON;
                  const active = pathname === `/${tool.slug}`;
                  return (
                    <li key={tool.slug}>
                      <Link
                        href={`/${tool.slug}`}
                        onClick={() => {
                          setFlyout(null);
                          closeOnMobile();
                        }}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-surface-hover text-foreground"
                            : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                        )}
                      >
                        <ToolIcon className="h-4 w-4 shrink-0 text-foreground-faint" />
                        <span className="truncate">{tool.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
