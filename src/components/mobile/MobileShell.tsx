import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile-first shell. On desktop we still render at full mobile width
 * so the design feels like an actual phone app in the browser preview.
 */
export function MobileShell({
  children,
  className,
  bottomNav,
}: {
  children: ReactNode;
  className?: string;
  bottomNav?: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-secondary to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-background shadow-soft">
        <main
          className={cn(
            "flex-1 overflow-x-hidden pb-10",
            className,
          )}
        >
          {children}
        </main>
        {bottomNav}
      </div>
    </div>
  );
}