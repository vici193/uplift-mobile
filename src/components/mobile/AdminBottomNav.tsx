import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, FileStack, ShieldCheck, MessagesSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  to: string; // Relaxed to string to allow all defined routes
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/applications", label: "Applications", icon: FileStack },
  { to: "/admin/verify", label: "Verify", icon: ShieldCheck },
  { to: "/admin/support", label: "Support", icon: MessagesSquare },
  { to: "/admin/profile", label: "Profile", icon: User },
];

export function AdminBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="pointer-events-none sticky bottom-0 z-40 mx-auto w-full max-w-[440px] px-3 pb-4">
      <div className="pointer-events-auto flex items-center justify-between rounded-3xl bg-primary px-2 py-2 shadow-glow">
        {items.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to as any} // Forced cast to bypass strict route checking for now
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[9px] font-medium transition-all",
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
