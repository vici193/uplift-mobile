import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import logo from "@/assets/uplift-logo.png";
import dotr from "@/assets/dotr.png";
import ltfrb from "@/assets/ltfrb.png";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: FileText, label: "Apply", to: "/apply" },
  { icon: UserCheck, label: "Verify", to: "/profile" },
  { icon: ShieldCheck, label: "Subsidy", to: "/subsidies" },
];

function Landing() {
  return (
    <MobileShell className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1b2b4b] px-6 py-8 text-[#ffffff]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#f5a623] opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#ffffff] opacity-10 blur-[120px]" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="relative mb-4">
          <img
            src={logo}
            alt="UPLIFT Logo"
            className="h-48 w-48 object-contain drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]"
          />
          <Sparkles className="absolute -right-2 top-0 h-6 w-6 animate-pulse text-[#f5a623]" />
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight text-[#ffffff]">
          UP<span className="text-[#f5a623]">LIFT</span>
        </h1>

        <p className="mt-4 max-w-[280px] text-center text-[13px] font-medium leading-relaxed text-[#ffffff]/90">
          Fast-Track Your Benefits: Secure Verification and Direct Subsidy Applications.
        </p>

        <div className="mt-8 flex w-full justify-center gap-3">
          {features.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex h-[90px] w-[90px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-3xl border border-[#ffffff]/20 bg-[#ffffff]/5 transition-all duration-300 hover:-translate-y-2 hover:border-[#f5a623] hover:bg-[#f5a623]/10 hover:shadow-[0_0_20px_rgba(245,166,35,0.2)] active:scale-95"
            >
              <Icon className="h-6 w-6 text-[#f5a623]" strokeWidth={2} />
              <span className="text-xs font-semibold text-[#ffffff]">{label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c8b88]">
            IN PARTNERSHIP WITH PH GOV AGENCIES
          </p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <img 
              src={ltfrb} 
              alt="LTFRB" 
              className="h-10 w-auto object-contain transition-transform hover:scale-110" 
            />
            <img 
              src={dotr} 
              alt="DOTr" 
              className="h-10 w-auto object-contain transition-transform hover:scale-110" 
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex w-full flex-col gap-3">
        <Link
          to="/signup"
          className="flex w-full items-center justify-center rounded-full bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_20px_rgba(245,166,35,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(245,166,35,0.4)] active:scale-95"
        >
          Create an account
        </Link>
        
        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-full border border-[#ffffff]/40 bg-transparent py-4 text-[15px] font-bold text-[#ffffff] transition-all hover:bg-[#ffffff]/10 active:scale-95"
        >
          I already have an account
        </Link>

        <Link
          to="/admin"
          className="mt-1 flex w-full items-center justify-center rounded-full border border-dashed border-[#8c8b88]/50 bg-transparent py-3 text-[13px] font-medium text-[#8c8b88] transition-all hover:border-[#8c8b88] hover:bg-[#ffffff]/5 active:scale-95"
        >
          Admin login (demo)
        </Link>

        <p className="mt-2 text-center text-xs text-[#8c8b88]">
          By continuing you agree to our{" "}
          <Link to="/terms" className="text-[#ffffff] underline underline-offset-2 transition-colors hover:text-[#f5a623]">
            Terms & Privacy
          </Link>
        </p>
      </div>
    </MobileShell>
  );
}