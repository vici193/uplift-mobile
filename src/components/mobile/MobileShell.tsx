import type { ReactNode } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";

/**
 * Mobile-first shell. On desktop we still render at full mobile width
 * so the design feels like an actual phone app in the browser preview.
 *
 * Includes a persistent language toggle (EN/FIL) in the bottom-left corner,
 * available on every page that uses MobileShell. It sits bottom-left (not
 * top-left) specifically because TopBar renders its own back-arrow button
 * in the top-left corner on every page that uses it — placing the toggle
 * there too caused it to visually overlap that back button.
 *
 * The frame div below has `[transform:translateZ(0)]` specifically so that
 * the toggle's `fixed` positioning stays contained within the 440px phone
 * frame instead of the full browser viewport — without this, on wide desktop
 * windows the button would float off in the actual corner of the screen,
 * disconnected from the app entirely.
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
  const { en, setLang } = useSession();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-secondary to-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-background shadow-soft [transform:translateZ(0)]">
        <button
          id="global-lang-toggle"
          onClick={() => setLang((l: string) => (l === "en" ? "fil" : "en"))}
          className="fixed bottom-24 left-2.5 z-40 flex items-center gap-1 rounded-full border border-black/10 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-[#1b2b4b] shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-95"
          title={en ? "Switch to Filipino" : "Switch to English"}
        >
          <Languages className="h-3.5 w-3.5" />
          {en ? "EN" : "FIL"}
        </button>
        <main className={cn("flex-1 overflow-x-hidden pb-10", className)}>{children}</main>
        {bottomNav}
      </div>
    </div>
  );
}
