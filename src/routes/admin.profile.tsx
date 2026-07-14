import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, KeyRound, Settings, LogOut, ChevronRight, User } from "lucide-react";
import admin from "@/assets/admin.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { TopBar } from "@/components/mobile/TopBar";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

function AdminProfile() {
  const navigate = useNavigate();

  const rows = [
    { icon: ShieldCheck, label: "Roles & permissions", to: "/admin-roles" },
    { icon: KeyRound, label: "Change password", to: "/password" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar title="Admin Profile" />
      
      <div className="relative px-5 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1b2b4b] p-6 text-white shadow-xl transition-all duration-300 hover:bg-[#253960]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
          
          <img 
            src={admin} 
            alt="Admin" 
            className="absolute -right-7 -bottom-3 w-[200px] object-contain drop-shadow-2xl z-10 opacity-90 transition-transform duration-500 hover:scale-105"
          />

          <div className="relative z-20 flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#f5a623] text-2xl font-black text-[#1b2b4b] shadow-xl">
              AR
            </div>
            
            <div>
              <p className="text-[18px] font-extrabold">Admin Reyes</p>
              <p className="text-[11px] text-white/70 font-medium">DOTr Administrator</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
            <div>
              <p className="text-[16px] font-extrabold">1.2k</p>
              <p className="text-[9px] font-bold uppercase text-white/50 tracking-wider">Total Users</p>
            </div>
            <div>
              <p className="text-[16px] font-extrabold">48</p>
              <p className="text-[9px] font-bold uppercase text-white/50 tracking-wider">Active</p>
            </div>
            <div>
              <p className="text-[16px] font-extrabold">5</p>
              <p className="text-[9px] font-bold uppercase text-white/50 tracking-wider">Reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 px-5 pb-10">
        {rows.map((r) => (
          <button 
            key={r.label} 
            onClick={() => navigate({ to: r.to as any })}
            className="flex w-full items-center gap-4 rounded-[24px] bg-white p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0] transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f8f9fa] text-[#1b2b4b]">
              <r.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-extrabold text-[#1b2b4b]">{r.label}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
          </button>
        ))}
        
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[24px] border-2 border-red-100 bg-red-50 py-4 text-[13px] font-extrabold text-red-600 transition-all hover:bg-red-100 active:scale-95"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </MobileShell>
  );
}