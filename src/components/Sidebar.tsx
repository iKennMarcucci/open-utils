"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, Video, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Independent toggle state just for the sidebar visual title
  const [pdfToolMode, setPdfToolMode] = useState<"pdf-to-img" | "img-to-pdf">("pdf-to-img");
  const [videoToolMode, setVideoToolMode] = useState<"video-to-gif" | "gif-to-video">("video-to-gif");

  const pathname = usePathname();

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

  const navItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutGrid,
      href: "/",
      matchPath: "/",
      hasToggle: false,
    },
    {
      id: "pdf-converter",
      name: pdfToolMode === "pdf-to-img" ? "PDF to IMG" : "IMG to PDF",
      icon: FileText,
      href: `/pdf-converter?mode=${pdfToolMode}`,
      matchPath: "/pdf-converter",
      hasToggle: true,
      onToggle: handleTogglePdfMode,
      isActiveState: pdfToolMode,
    },
    {
      id: "video-converter",
      name: videoToolMode === "video-to-gif" ? "Video to GIF" : "GIF to Video",
      icon: Video,
      href: `/video-converter?mode=${videoToolMode}`,
      matchPath: "/video-converter",
      hasToggle: true,
      onToggle: handleToggleVideoMode,
      isActiveState: videoToolMode,
    },
    {
      id: "merge-pdf",
      name: "Unir a PDF",
      icon: Layers,
      href: "/merge-pdf",
      matchPath: "/merge-pdf",
      hasToggle: false,
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white"
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
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ width: 280 }}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full bg-neutral-950 border-r border-neutral-800/50 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-neutral-800/50 shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-lg whitespace-nowrap overflow-hidden text-neutral-200"
              >
                Converters
              </motion.span>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.matchPath;
            return (
              <Link
                href={item.href}
                key={item.id}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsMobileOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-neutral-500"
                    )}
                  />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap font-medium text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {!isCollapsed && item.hasToggle && (
                  <button
                    onClick={item.onToggle}
                    className={cn(
                      "p-1.5 rounded-md hover:bg-black/30 transition-colors shrink-0",
                      isActive
                        ? "text-white hover:text-neutral-300"
                        : "text-neutral-500 hover:text-white"
                    )}
                    title="Switch Name"
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4 transition-transform duration-500",
                        item.isActiveState === "img-to-pdf" && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800/50 shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-neutral-600 text-center whitespace-nowrap overflow-hidden"
              >
                Private & Local
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
