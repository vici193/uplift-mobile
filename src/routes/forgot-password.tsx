import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Phone, ShieldQuestion, Lock, ArrowRightLeft, ShieldCheck } from "lucide-react";
import passwordSticker from "@/assets/password.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

const steps = [
  { id: 1, label: "Verify", icon: Phone },
  { id: 2, label: "Question 1", icon: ShieldQuestion },
  { id: 3, label: "Question 2", icon: ShieldQuestion },
  { id: 4, label: "Update", icon: Lock },
];

function Field({ label, icon: Icon, ...props }: { label: string, icon?: any } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-[11px] font-bold text-[#ffffff]/60 uppercase tracking-wider">{label}</span>
      <div className="relative group w-full">
        <input
          {...props}
          className="w-full rounded-2xl border border-[#ffffff]/10 bg-[#1b2b4b] pl-4 pr-10 py-3.5 text-sm text-[#ffffff] outline-none transition-all placeholder:text-[#ffffff]/20 focus:border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/20"
        />
        {Icon && <Icon className="absolute right-3 top-4 h-4 w-4 text-[#ffffff]/30 group-focus-within:text-[#f5a623] transition-colors" />}
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <MobileShell className="relative flex min-h-screen flex-col bg-[#1b2b4b] font-sans text-[#ffffff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_50%)] opacity-10" />
      
      <div className="sticky top-0 z-30 flex items-center gap-4 px-6 py-6 backdrop-blur-md">
        <button 
          type="button" 
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate({ to: "/login" })} 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffffff]/5 border border-[#ffffff]/10 hover:bg-[#f5a623] hover:text-[#1b2b4b] transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[16px] font-bold uppercase tracking-widest">Forgot Password</h1>
      </div>

      <div className="flex-1 px-6 pt-4 pb-12 z-10 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-16 px-1">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all border", step >= s.id ? "bg-[#f5a623] text-[#1b2b4b] border-[#f5a623]" : "bg-[#ffffff]/5 border-[#ffffff]/10 text-[#8c8b88]")}>
                {step > s.id ? <Check size={18} strokeWidth={3} /> : <s.icon size={18} />}
              </div>
              <span className={cn("text-[9px] font-bold uppercase tracking-wider", step >= s.id ? "text-[#f5a623]" : "text-[#ffffff]/30")}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-[#1b2b4b]/50 border border-[#ffffff]/10 shadow-xl relative backdrop-blur-sm min-h-[320px] flex flex-col justify-center">
           <img src={passwordSticker} alt="Password" className="absolute -top-15 -right-0 w-45 h-45 z-20 opacity-90" />
           
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-bold text-[#ffffff]">Verify Identity</h2>
              <p className="text-[12px] text-[#8c8b88] leading-relaxed">Confirm your mobile number.</p>
              <Field label="Mobile Number" placeholder="09XX XXX XXXX" icon={Phone} type="tel" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-bold text-[#ffffff]">Question 1</h2>
              <p className="text-[12px] text-[#8c8b88] leading-relaxed">Answer your first security question.</p>
              <Field label="Answer" placeholder="Type here..." icon={ShieldQuestion} />
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-bold text-[#ffffff]">Question 2</h2>
              <p className="text-[12px] text-[#8c8b88] leading-relaxed">Answer your second security question.</p>
              <Field label="Answer" placeholder="Type here..." icon={ShieldQuestion} />
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-bold text-[#ffffff]">New Password</h2>
              <p className="text-[12px] text-[#8c8b88] leading-relaxed">Set your new account password.</p>
              <Field label="New Password" placeholder="••••••••" icon={Lock} type="password" />
              <Field label="Confirm Password" placeholder="••••••••" icon={Lock} type="password" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4 mt-8 rounded-3xl bg-[#ffffff]/5 border border-[#ffffff]/5">
            <div className="flex items-start gap-3">
                <ShieldCheck className="text-[#f5a623] h-5 w-5 mt-0.5" />
                <div>
                    <h4 className="text-[11px] font-bold text-[#ffffff]">Security Guarantee</h4>
                    <p className="text-[10px] text-[#8c8b88]">Your password reset is secure and encrypted.</p>
                </div>
            </div>
        </div>

        <button 
          type="button" 
          onClick={() => step < 4 ? setStep(s => s + 1) : navigate({ to: "/login" })} 
          className="mt-6 flex w-full items-center justify-center rounded-full bg-[#f5a623] py-3.5 text-[14px] font-bold text-[#1b2b4b] shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          {step === 4 ? "Reset Password" : "Continue"}
        </button>
      </div>
    </MobileShell>
  );
}