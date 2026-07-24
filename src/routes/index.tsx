import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ShieldCheck, UserCheck } from "lucide-react";
import logo from "@/assets/uplift-logo.png";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: FileText, label: "Apply" },
  { icon: UserCheck, label: "Verify" },
  { icon: ShieldCheck, label: "Subsidy" },
];

function Landing() {
  return (
    <MobileShell className="relative flex min-h-screen flex-col items-center justify-between bg-white px-6 py-10 text-[#1b2b4b] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute -top-[20%] -left-[20%] h-[500px] w-[500px] rounded-full bg-[#f5a623] blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] -right-[20%] h-[400px] w-[400px] rounded-full bg-[#1b2b4b] blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center pt-8">
        <h1 className="text-7xl font-extrabold tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#1b2b4b] to-[#2e4a85]">
            SU
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#ffd54f] via-[#f5a623] to-[#c17a1a]">
            BI
          </span>
        </h1>
        <p className="mt-2 max-w-[320px] text-center text-xs font-bold uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-[#c17a1a] via-[#f5a623] to-[#c17a1a]">
          Sulong sa Biyahe
        </p>

        <div className="my-6 w-full flex justify-center">
          <img src={logo} alt="PARA Logo" className="h-64 w-64 object-contain drop-shadow-2xl" />
        </div>

        <div className="flex w-full justify-center gap-3">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md transition-all hover:border-[#f5a623] hover:bg-amber-50 hover:shadow-lg active:scale-95"
            >
              <Icon className="h-6 w-6 text-[#1b2b4b]" strokeWidth={2} />
              <span className="text-xs font-bold text-[#1b2b4b]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col gap-3 mt-8 pb-6">
        <Link
          to="/signup"
          className="flex w-full items-center justify-center rounded-full bg-[#1b2b4b] py-4 text-[15px] font-bold text-white transition-all hover:bg-[#253960] active:scale-95 border border-[#1b2b4b]"
        >
          Create an account
        </Link>

        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-full border border-[#f5a623] bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] transition-all hover:bg-[#ffc107] active:scale-95"
        >
          I already have an account
        </Link>

        <Link
          to="/admin"
          className="flex w-full items-center justify-center rounded-full border border-dashed border-gray-300 py-4 text-[15px] font-bold text-gray-400 hover:border-[#f5a623] hover:text-[#f5a623] transition-all"
        >
          Admin login (demo)
        </Link>

        <div className="mt-6 flex justify-center">
          <p className="text-center text-xs text-gray-400">
            By continuing you agree to our{" "}
            <Link
              to="/terms"
              className="text-[#1b2b4b] font-bold underline underline-offset-2 hover:text-[#f5a623]"
            >
              Terms & Privacy
            </Link>
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
