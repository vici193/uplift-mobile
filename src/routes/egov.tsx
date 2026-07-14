import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Fingerprint, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";

export const Route = createFileRoute("/egov")({
  component: EGovPage,
});

function EGovPage() {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <TopBar title="Link e-Gov PH" onBack={() => history.back()} />
      
      <div className="px-6 pt-4 pb-24 space-y-6">
        {/* Header Card */}
        <div className="bg-[#1b2b4b] rounded-[32px] p-8 text-center text-white shadow-xl">
          <div className="h-20 w-20 bg-[#f5a623] rounded-3xl grid place-items-center mx-auto mb-6">
            <Fingerprint className="h-10 w-10 text-[#1b2b4b]" />
          </div>
          <h2 className="text-xl font-black">Digital Driver's License</h2>
          <p className="text-xs text-white/60 mt-2">
            Link your e-Gov PH account to auto-fill your license and reduce manual uploads.
          </p>
        </div>

        {/* Permissions List */}
        <div className="bg-white border border-[#f0f0f0] rounded-[24px] p-5 shadow-sm">
          <p className="text-[12px] font-extrabold text-[#1b2b4b] mb-4">What we'll access</p>
          <div className="space-y-4">
            {[
              "Full name & date of birth",
              "Driver's license number & expiry",
              "License restrictions & category",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-[#1b2b4b]">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 flex items-center gap-3 text-sm">
          <ShieldCheck className="h-6 w-6 text-[#f5a623] shrink-0" />
          <p className="text-[11px] text-[#8c8b88] font-medium leading-relaxed">
            Read-only access. We never modify your e-Gov data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
            <button 
                onClick={() => alert("Redirecting to eGov...")}
                className="w-full py-4 rounded-2xl bg-[#f5a623] text-[#1b2b4b] font-bold hover:bg-[#ffb94a] transition-all shadow-lg active:scale-95"
            >
                Continue to e-Gov PH
            </button>
            <button 
                onClick={() => navigate({ to: "/home" })}
                className="w-full py-4 rounded-2xl text-[#8c8b88] font-bold hover:text-[#1b2b4b] transition-all"
            >
                Skip for now
            </button>
        </div>
      </div>
    </MobileShell>
  );
}
