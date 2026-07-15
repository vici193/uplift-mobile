import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import logo from "@/assets/uplift-logo.png";
import dotr from "@/assets/dotr.png";
import ltfrb from "@/assets/ltfrb.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { en } = useSession();

  const features = [
    { icon: FileText, label: en ? "Apply" : "Mag-apply" },
    { icon: UserCheck, label: en ? "Verify" : "I-verify" },
    { icon: ShieldCheck, label: en ? "Subsidy" : "Subsidy" },
  ];

  return (
    <MobileShell className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 py-8 text-[#1b2b4b]">
      {/* Toned down the background glows for a softer look */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#f5a623] opacity-[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#1b2b4b] opacity-[0.04] blur-[120px]" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="relative mb-4">
          <img
            src={logo}
            alt="UPLIFT Logo"
            className="h-48 w-48 object-contain drop-shadow-[0_0_15px_rgba(245,166,35,0.2)]"
          />
          <Sparkles className="absolute -right-2 top-0 h-6 w-6 animate-pulse text-[#f5a623]" />
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight text-[#1b2b4b]">
          UP<span className="text-[#f5a623]">LIFT</span>
        </h1>

        <p className="mt-4 max-w-[280px] text-center text-[13px] font-medium leading-relaxed text-[#1b2b4b]/80">
          {en
            ? "Fast-Track Your Benefits: Secure Verification and Direct Subsidy Applications."
            : "Mabilis na Benepisyo: Secure na Verification at Direktang Subsidy Applications."}
        </p>

        <div className="mt-8 flex w-full justify-center gap-3">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex h-[90px] w-[90px] cursor-default select-none flex-col items-center justify-center gap-2.5 rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#f5a623] hover:bg-[#f5a623]/5 hover:shadow-[0_0_20px_rgba(245,166,35,0.15)] active:scale-95"
            >
              <Icon className="h-6 w-6 text-[#f5a623]" strokeWidth={2} />
              <span className="text-xs font-semibold text-[#1b2b4b]">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="mt-4 flex items-center justify-center gap-6">
            <img
              src={ltfrb}
              alt="LTFRB"
              className="h-10 w-auto object-contain transition-transform hover:scale-110 opacity-90"
            />
            <img
              src={dotr}
              alt="DOTr"
              className="h-10 w-auto object-contain transition-transform hover:scale-110 opacity-90"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex w-full flex-col gap-3">
        <Link
          to="/signup"
          className="flex w-full items-center justify-center rounded-full bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_20px_rgba(245,166,35,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(245,166,35,0.3)] active:scale-95"
        >
          {en ? "Create an account" : "Gumawa ng Account"}
        </Link>

        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-full border border-slate-300 bg-white py-4 text-[15px] font-bold text-[#1b2b4b] shadow-sm transition-all hover:bg-slate-100 active:scale-95"
        >
          {en ? "I already have an account" : "Mayroon na akong account"}
        </Link>

        <Link
          to="/admin"
          className="mt-1 flex w-full items-center justify-center rounded-full border border-dashed border-slate-300 bg-transparent py-3 text-[13px] font-medium text-slate-500 transition-all hover:border-slate-400 hover:bg-slate-100 active:scale-95"
        >
          {en ? "Admin login (demo)" : "Admin login (demo)"}
        </Link>

        <p className="mt-2 text-center text-xs text-slate-500">
          {en ? "By continuing you agree to our" : "Sa pagpapatuloy, sumasang-ayon ka sa aming"}{" "}
          <Link to="/terms" className="text-[#1b2b4b] underline underline-offset-2 transition-colors hover:text-[#f5a623]">
            {en ? "Terms & Privacy" : "Mga Tuntunin at Privacy"}
          </Link>
        </p>
      </div>
    </MobileShell>
  );
}