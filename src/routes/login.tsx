import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Loader2, AlertTriangle, ArrowLeft, IdCard, CheckCircle2, ShieldCheck, X } from "lucide-react";
import logo from "@/assets/uplift-logo.png";
import egov from "@/assets/egov.png";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [egovLoading, setEgovLoading] = useState(false);
  const [showEgovPopup, setShowEgovPopup] = useState(false);
  
  const submit = () => {
    setLoading(true);
    setTimeout(() => navigate({ to: "/otp" }), 700);
  };

  const handleEgovConnect = () => {
    setEgovLoading(true);
  };

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-x-hidden overflow-y-auto bg-[#1b2b4b] font-sans text-[#ffffff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_1.5px,transparent_1.5px)] bg-[length:24px_24px] opacity-[0.07] mix-blend-overlay" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f5a623] opacity-10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-[#ffffff] opacity-5 blur-[120px]" />

      <div className="sticky top-0 z-20 flex items-center gap-4 bg-[#1b2b4b]/90 px-6 pb-4 pt-8 backdrop-blur-md">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffffff]/10 transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold tracking-wide text-[#ffffff]">
          LOGIN
        </h1>
      </div>

      <div className="relative z-10 flex flex-col px-6 pb-8 pt-2">
        <div className="mx-auto flex h-28 w-28 items-center justify-center">
          <img 
            src={logo} 
            alt="UPLIFT" 
            className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]" 
          />
        </div>
        
        <h1 className="mt-4 text-center text-3xl font-bold text-[#ffffff]">
          Welcome back to, <span className="text-[#f5a623]">UPLIFT!</span>
        </h1>
        <p className="mt-2 text-center text-[13px] font-medium text-[#8c8b88]">
          Sign in to continue managing your subsidies.
        </p>

        <label className="mt-10 flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#ffffff]">
            Mobile number
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-[#ffffff]/20 bg-[#ffffff]/5 px-4 py-3.5 transition-all focus-within:border-[#f5a623] focus-within:bg-[#ffffff]/10 focus-within:ring-4 focus-within:ring-[#f5a623]/10">
            <Phone className="h-5 w-5 text-[#8c8b88]" />
            <span className="text-sm font-bold text-[#ffffff]">+63</span>
            <div className="h-5 w-px bg-[#ffffff]/20" />
            <input
              placeholder="917 123 4567"
              className="flex-1 bg-transparent text-[15px] font-medium text-[#ffffff] outline-none placeholder:text-[#8c8b88]/50"
              type="tel"
            />
          </div>
        </label>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_20px_rgba(245,166,35,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(245,166,35,0.4)] active:scale-95 disabled:scale-100 disabled:opacity-70"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin text-[#1b2b4b]" />}
          {loading ? "Sending code..." : "Send OTP & Continue"}
        </button>

        <div className="my-8 flex items-center gap-4 text-[10px] font-bold tracking-widest text-[#8c8b88]">
          <div className="h-px flex-1 bg-[#ffffff]/10" /> 
          OR CONTINUE WITH 
          <div className="h-px flex-1 bg-[#ffffff]/10" />
        </div>

        <button
          onClick={() => setShowEgovPopup(true)}
          className="group flex w-full items-center justify-center gap-3 rounded-full border border-[#ffffff]/40 bg-transparent py-4 text-[15px] font-bold text-[#ffffff] transition-all hover:border-[#f5a623] hover:bg-[#ffffff]/5 active:scale-95"
        >
          <img src={egov} alt="eGov PH" className="h-6 w-auto object-contain transition-transform group-hover:scale-110" />
          Continue with eGov PH
        </button>

        <div className="mt-8 flex justify-between px-2 text-[13px] font-semibold">
          <Link to="/forgot-password" className="text-[#ffffff] underline underline-offset-4 transition-colors hover:text-[#f5a623]">
            Forgot password?
          </Link>
          <Link to="/change-number" className="text-[#ffffff] underline underline-offset-4 transition-colors hover:text-[#f5a623]">
            Change number
          </Link>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/10 p-4 text-[12px] leading-relaxed text-[#ffffff] shadow-[inset_0_0_15px_rgba(245,166,35,0.05)]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#f5a623]" />
          <p>
            <strong className="font-bold text-[#f5a623]">Security Note:</strong> UPLIFT will never ask for your password or OTP over calls or SMS.
          </p>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-[#8c8b88]">
          No account yet?{" "}
          <Link to="/signup" className="font-bold text-[#f5a623] underline underline-offset-4 transition-all hover:text-[#ffffff]">
            Sign up
          </Link>
        </p>
      </div>

      {showEgovPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 px-4 backdrop-blur-md transition-all duration-300">
          <div className="group relative w-full max-w-sm rounded-[34px] bg-[#e6e8eb] p-[6px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:bg-[#f5a623]">
            <div className="relative flex w-full flex-col gap-6 rounded-[28px] border-2 border-[#e6e8eb] bg-[#ffffff] p-6 transition-colors duration-300 group-hover:border-[#f5a623]">
              
              <button
                onClick={() => setShowEgovPopup(false)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#e6e8eb] text-[#1b2b4b] transition-all hover:bg-[#1b2b4b] hover:text-[#ffffff] active:scale-90"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>

              <div className="mt-2 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#fef3c7] shadow-[inset_0_0_15px_rgba(245,166,35,0.2)] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#f5a623]">
                  <IdCard className="h-8 w-8 text-[#1b2b4b]" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-[#1b2b4b]">Digital Driver's License</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#8c8b88]">
                  Link your e-Gov PH account to auto-fill your license and reduce manual uploads.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-[24px] border border-[#e6e8eb] bg-[#f8f9fa] p-5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#f5a623]">What we'll access</h3>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f5a623]" />
                    <span className="text-[13px] font-semibold text-[#1b2b4b]">Full name & date of birth</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f5a623]" />
                    <span className="text-[13px] font-semibold text-[#1b2b4b]">Driver's license number & expiry</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#f5a623]" />
                    <span className="text-[13px] font-semibold text-[#1b2b4b]">License restrictions & category</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3 rounded-[20px] border border-[#f5a623]/30 bg-[#fef3c7] p-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-[#f5a623]" />
                <p className="text-[12px] font-medium leading-relaxed text-[#1b2b4b]">
                  Read-only access. We never modify your e-Gov data.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleEgovConnect}
                  disabled={egovLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f5a623] py-3.5 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_15px_rgba(245,166,35,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(245,166,35,0.5)] active:scale-95 disabled:scale-100 disabled:opacity-70"
                >
                  {egovLoading && <Loader2 className="h-5 w-5 animate-spin text-[#1b2b4b]" />}
                  {egovLoading ? "Connecting..." : "Connect"}
                </button>
                <button
                  onClick={() => setShowEgovPopup(false)}
                  className="flex w-full items-center justify-center rounded-full bg-transparent py-3 text-[13px] font-bold text-[#8c8b88] transition-all hover:bg-[#e6e8eb] hover:text-[#1b2b4b] active:scale-95"
                >
                  Skip for now
                </button>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}