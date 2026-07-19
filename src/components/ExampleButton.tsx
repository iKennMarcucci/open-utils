"use client";

import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Ver ejemplo" — the same affordance on every tool. Pressing it loads a
 * ready-made example into the widget so the user can see exactly what the tool
 * does without having to bring their own file or type anything. Each tool wires
 * `onClick` to populate its own inputs with a representative sample.
 */
export function ExampleButton({
  onClick,
  className,
  label = "Ver ejemplo",
}: {
  onClick: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Cargar un ejemplo en la herramienta"
      className={cn("ou-btn ou-btn-secondary", className)}
    >
      <Lightbulb className="h-4 w-4 text-amber-400" />
      {label}
    </button>
  );
}
