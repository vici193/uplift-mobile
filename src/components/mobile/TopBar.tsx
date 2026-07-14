import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopBar({
  title,
  subtitle,
  right,
  variant = "light",
  onBack,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  variant?: "light" | "dark";
  onBack?: () => void;
}) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/home" });
    }
  };
  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-lg",
        variant === "light"
          ? "bg-background/80 text-foreground border-b border-border/60"
          : "bg-primary/80 text-white",
      )}
    >
      <button
        type="button"
        onClick={handleBack}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full transition-all active:scale-90",
          variant === "light"
            ? "bg-secondary hover:bg-accent-soft"
            : "bg-white/10 hover:bg-white/20",
        )}
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-base font-bold leading-tight">{title}</h1>}
        {subtitle && (
          <p className={cn("truncate text-xs", variant === "light" ? "text-muted-foreground" : "text-white/70")}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}