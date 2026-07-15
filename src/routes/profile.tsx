/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Pencil, LogOut, ChevronRight, Camera } from "lucide-react";
import jeep from "@/assets/jeep.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { en, driver, apps, handleLogout } = useSession();

  const initials = driver?.name ? driver.name.slice(0, 2).toUpperCase() : "??";
  const active = apps.length;
  const approved = apps.filter(
    (a: any) => a.status === "approved" || a.status === "claimed",
  ).length;

  function doLogout() {
    handleLogout();
    navigate({ to: "/" });
  }

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar title={en ? "My Profile" : "Aking Pagkakakilanlan"} />

      <div className="relative px-5 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1b2b4b] p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
          <img
            src={jeep}
            alt="Jeepney"
            className="absolute -bottom-8 -right-10 z-10 w-[200px] object-contain opacity-90 drop-shadow-2xl"
          />

          <div className="relative z-20 flex items-center gap-4">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#f5a623] text-2xl font-black text-[#1b2b4b] shadow-xl">
                {initials}
              </div>
              <button
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-white text-[#1b2b4b] shadow-lg"
                disabled
                title={en ? "Not available yet" : "Hindi pa magagamit"}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="text-[18px] font-extrabold">
                {driver?.name || (en ? "Driver" : "Tsuper")}
              </p>
              <p className="text-[11px] font-medium text-white/70">
                {driver?.denomination || (en ? "PUV Driver" : "Tsuper ng PUV")}
              </p>
              {driver?.verification_status === "verified" && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />{" "}
                  {en ? "Verified Driver" : "Kumpirmadong Tsuper"}
                </div>
              )}
              {driver?.verification_status === "unverified" && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/20 px-2.5 py-1 text-[10px] font-bold text-white">
                  {en ? "Verification pending" : "Naghihintay ng Pagpapatunay"}
                </div>
              )}
              {driver?.verification_status === "rejected" && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/20 px-2.5 py-1 text-[10px] font-bold text-white">
                  {en ? "Verification rejected" : "Tinanggihan ang Pagpapatunay"}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/10 pt-5 text-center">
            <div>
              <p className="text-[16px] font-extrabold">{active}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                {en ? "Applications" : "Mga Aplikasyon"}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-extrabold">{approved}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                {en ? "Approved" : "Naaprubahan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 px-5 pb-10">
        <button
          onClick={() => navigate({ to: "/edit" })}
          className="flex w-full items-center gap-4 rounded-[24px] border border-[#f0f0f0] bg-white p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f8f9fa] text-[#1b2b4b]">
            <Pencil className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-[#1b2b4b]">
              {en ? "Edit my information" : "Baguhin ang aking impormasyon"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
        </button>

        <button
          onClick={doLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[24px] border-2 border-red-100 bg-red-50 py-4 text-[13px] font-extrabold text-red-600 transition-all hover:bg-red-100 active:scale-95"
        >
          <LogOut className="h-4 w-4" /> {en ? "Log out" : "Lumabas"}
        </button>
      </div>
    </MobileShell>
  );
}