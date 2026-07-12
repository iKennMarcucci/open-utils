import { cn } from "@/lib/utils";

/**
 * Open Utils logomark — a compact 2×2 "bento" of tiles, echoing the
 * home grid. Monochrome by default so it inherits the surrounding color.
 */
export function Logo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[8px] bg-foreground text-background",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.55" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.55" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
      </svg>
    </span>
  );
}
