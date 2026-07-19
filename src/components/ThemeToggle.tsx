"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

/**
 * Light/dark switch. The initial theme is resolved before paint by the inline
 * script in the root layout (which sets the `light`/`dark` class on <html>);
 * this component only reads that class on mount and flips it on click,
 * persisting the choice to localStorage.
 */
export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  const label = theme === "dark" ? "Activar modo claro" : "Activar modo oscuro";

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center h-9 rounded-control text-foreground-muted hover:bg-surface hover:text-foreground transition-colors",
        collapsed ? "justify-center px-0 w-full" : "gap-3 px-3 w-full"
      )}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px] shrink-0" />
      ) : (
        <Moon className="w-[18px] h-[18px] shrink-0" />
      )}
      {!collapsed && (
        <span className="whitespace-nowrap font-medium text-sm">
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </span>
      )}
    </button>
  );
}
