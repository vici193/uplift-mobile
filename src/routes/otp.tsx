import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2, ArrowLeft, Phone, ChevronRight, Lock, Shield } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import React from "react";

export const Route = createFileRoute("/otp")({
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(42);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const update = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const verify = () => {
    setLoading(true);
    setTimeout(() => navigate({ to: "/home" }), 900);
  };

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-x-hidden overflow-y-auto bg-[#1b2b4b] font-sans text-[#ffffff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_1.5px,transparent_1.5px)] bg-[length:24px_24px] opacity-[0.07] mix-blend-overlay" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f5a623] opacity-10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-[#ffffff] opacity-5 blur-[120px]" />

      <div className="sticky top-0 z-20 flex items-center gap-4 bg-[#1b2b4b]/90 px-6 pb-4 pt-8 backdrop-blur-md">
        <button
          onClick={() => navigate({ to: "/login" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffffff]/10 transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-bold text-[#ffffff]">OTP VERIFICATION</span>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pb-8 pt-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f5a623] shadow-[inset_0_0_20px_rgba(245,166,35,0.1)]">
          <ShieldCheck className="h-10 w-10" strokeWidth={2} />
        </div>
        
        <h1 className="mt-6 text-center text-3xl font-bold text-[#ffffff]">
          Verify your number
        </h1>
        <p className="mt-2 text-center text-[13px] font-medium text-[#8c8b88]">
          Enter the 6-digit code sent to
        </p>

        <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#ffffff]/10 px-5 py-2.5">
          <Phone className="h-4 w-4 text-[#ffffff]" />
          <span className="text-[15px] font-bold tracking-wide text-[#ffffff]">+63 917 •••• 234</span>
        </div>

        <div className="mt-10 flex w-full justify-between gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={c}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              placeholder="—"
              className={`h-14 w-full rounded-2xl border bg-[#ffffff]/5 text-center text-2xl font-bold outline-none transition-all focus:bg-[#ffffff]/10 focus:ring-4 focus:ring-[#f5a623]/10 ${
                c 
                  ? "border-[#f5a623] text-[#f5a623] shadow-[0_0_15px_rgba(245,166,35,0.2)]" 
                  : "border-[#ffffff]/20 text-[#ffffff] placeholder:text-[#ffffff]/20 focus:border-[#f5a623]"
              }`}
            />
          ))}
        </div>

        <div className="mt-8 flex w-full items-start gap-3 rounded-[20px] border border-[#ffffff]/10 bg-[#ffffff]/5 p-4 shadow-sm">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#8c8b88]" />
          <p className="text-[12px] leading-relaxed text-[#ffffff]/90">
            For your security, never share your verification code with anyone.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1.5 text-[13px]">
          <span className="text-[#8c8b88]">Didn't get the code?</span>
          {seconds > 0 ? (
            <span className="font-bold text-[#ffffff]">
              Resend code in <span className="text-[#f5a623]">0:{seconds.toString().padStart(2, "0")}</span>
            </span>
          ) : (
            <button onClick={() => setSeconds(42)} className="font-bold text-[#f5a623] hover:underline">
              Resend code
            </button>
          )}
        </div>

        <button
          onClick={verify}
          disabled={loading || code.some(c => c === "")}
          className="mt-8 flex w-full items-center justify-between rounded-full bg-[#f5a623] px-6 py-4 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_20px_rgba(245,166,35,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(245,166,35,0.4)] active:scale-95 disabled:scale-100 disabled:opacity-50"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1b2b4b]">
            <ShieldCheck className="h-4 w-4 text-[#1b2b4b]" strokeWidth={2.5} />
          </div>
          
          <span className="flex items-center gap-2">
            {loading && <Loader2 className="h-5 w-5 animate-spin text-[#1b2b4b]" />}
            {loading ? "Verifying..." : "Verify & Continue"}
          </span>

          <ChevronRight className="h-6 w-6 text-[#1b2b4b]" strokeWidth={2.5} />
        </button>

        <div className="mt-10 flex items-center justify-center gap-1.5 text-[#8c8b88]">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium tracking-wide">Secure & Encrypted</span>
        </div>
      </div>
    </MobileShell>
  );
}