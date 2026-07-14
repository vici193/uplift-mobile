import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Pencil, IdCard, Fingerprint, KeyRound, Settings, LogOut, ChevronRight, Camera } from "lucide-react";
import jeep from "@/assets/jeep.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();

  const rows = [
    { icon: Pencil, label: "Edit my information", to: "/edit" },
    { icon: IdCard, label: "Driver's license", badge: "Verified", to: "/license" },
    { icon: Fingerprint, label: "Link eGov PH", to: "/egov" },
    { icon: KeyRound, label: "Password", to: "/password" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar title="My Profile" />
      
      <div className="relative px-5 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1b2b4b] p-6 text-white shadow-xl transition-all duration-300 hover:bg-[#253960]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
          
          <img 
            src={jeep} 
            alt="Jeepney" 
            className="absolute -right-10 -bottom--20 w-[200px] object-contain drop-shadow-2xl z-10 opacity-90 transition-transform duration-500 hover:scale-105"
          />

          <div className="relative z-20 flex items-center gap-4">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#f5a623] text-2xl font-black text-[#1b2b4b] shadow-xl">
                JS
              </div>
              <button className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-white text-[#1b2b4b] shadow-lg transition-transform hover:scale-105">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <div>
              <p className="text-[18px] font-extrabold">Juan Santos</p>
              <p className="text-[11px] text-white/70 font-medium">PUJ Driver · Metro Manila</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" /> Verified Driver
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
            <div>
              <p className="text-[16px] font-extrabold">3</p>
              <p className="text-[9px] font-bold uppercase text-white/50 tracking-wider">Applications</p>
            </div>
            <div>
              <p className="text-[16px] font-extrabold">1</p>
              <p className="text-[9px] font-bold uppercase text-white/50 tracking-wider">Approved</p>
            </div>
            <div>
              <p className="text-[16px] font-extrabold">₱6.5k</p>
              <p className="text-[9px] font-bold uppercase text-white/50 tracking-wider">Received</p>
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
            {"badge" in r && r.badge && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-700 uppercase">
                {r.badge}
              </span>
            )}
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