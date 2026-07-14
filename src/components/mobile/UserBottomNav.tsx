import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/subsidies", label: "Subsidy", icon: FileText },
  { to: "/updates", label: "Updates", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function UserBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  return (
    <nav className="pointer-events-none sticky bottom-0 z-40 mx-auto w-full max-w-[440px] px-3 pb-4">
      <div className="pointer-events-auto flex items-center justify-between rounded-3xl bg-primary px-2 py-2 shadow-glow">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-medium transition-all",
                active
                  ? "bg-gradient-accent text-primary shadow-soft"
                  : "text-white/70 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}