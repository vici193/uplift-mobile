import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileStack, ShieldCheck, HelpCircle, CheckCircle2, User, CalendarDays, MessagesSquare } from "lucide-react";
import admin from "@/assets/admin.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <div className="relative px-5 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1b2b4b] p-6 text-white shadow-xl transition-all duration-300 hover:bg-[#253960]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
          
          <img 
            src={admin} 
            alt="Admin" 
            className="absolute -right-3 -bottom-7 w-[160px] object-contain drop-shadow-2xl z-10 opacity-100 transition-transform duration-500 hover:scale-105"
          />

          <div className="relative z-20 flex items-start">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white shadow-xl">
                <User className="h-8 w-8 text-[#1b2b4b]" />
              </div>
              <div>
                <p className="text-[11px] text-white/70 font-medium">Good morning,</p>
                <p className="text-[18px] font-extrabold">Admin Reyes</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> DOTr Administrator
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6 px-5 pb-8">
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-extrabold text-[#1b2b4b]">Today's Overview</h2>
            <Link to="/admin/applications" className="text-[11px] font-bold text-[#f5a623] hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending", value: 18, color: "bg-amber-50 text-amber-600", Icon: FileStack },
              { label: "Verified", value: 9, color: "bg-emerald-50 text-emerald-600", Icon: ShieldCheck },
              { label: "Help", value: 5, color: "bg-red-50 text-red-600", Icon: HelpCircle },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} className="group flex flex-col items-center rounded-3xl bg-white p-4 text-center border border-gray-100 shadow-sm transition-all hover:bg-[#f5a623] hover:border-[#f5a623]">
                <div className={`grid h-10 w-10 place-items-center rounded-full ${color} mb-2 transition-colors group-hover:bg-[#1b2b4b]/10`}>
                    <Icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-black text-[#1b2b4b] group-hover:text-[#1b2b4b]">{value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#1b2b4b]/70">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-[14px] font-extrabold text-[#1b2b4b]">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { Icon: CalendarDays, label: "Event", to: "/admin/events" },
              { Icon: FileStack, label: "Applications", to: "/admin/applications" },
              { Icon: ShieldCheck, label: "Verify", to: "/admin/verify" },
              { Icon: MessagesSquare, label: "Support", to: "/admin/support" },
            ].map((q) => (
              <Link key={q.label} to={q.to} className="group flex flex-col items-center rounded-3xl bg-white p-3 text-center shadow-sm border border-gray-100 transition-all hover:bg-[#f5a623] hover:border-[#f5a623] hover:-translate-y-1">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gray-50 mb-2 group-hover:bg-[#1b2b4b]/10">
                    <q.Icon className="h-5 w-5 text-[#1b2b4b]" />
                </div>
                <p className="text-[10px] font-extrabold text-[#1b2b4b] leading-tight">{q.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[14px] font-extrabold text-[#1b2b4b] px-1">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { name: "Juan Santos", desc: "New application submitted", time: "2m ago" },
              { name: "Maria Cruz", desc: "Verification approved", time: "15m ago" },
              { name: "Pedro Dela Cruz", desc: "Requested revision", time: "1h ago" },
            ].map((a) => (
              <Link key={a.name} to="/admin/applications" className="flex items-center gap-4 rounded-[24px] bg-white p-4 shadow-sm border border-gray-100 transition-all hover:bg-gray-50 hover:-translate-y-0.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white">{a.name.split(" ").map(n => n[0]).join("")}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#1b2b4b] truncate">{a.name}</p>
                  <p className="text-[11px] text-[#8c8b88] truncate">{a.desc}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-[#8c8b88]">{a.time}</p>
                    <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}