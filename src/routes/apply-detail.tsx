import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply-detail")({
  component: ApplyDetail,
});

function Field({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-[#1b2b4b]/70 uppercase">
        {label} {required && <span className="text-[#f5a623]">*</span>}
      </label>
      <input
        {...props}
        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3.5 text-sm font-medium text-[#1b2b4b] outline-none transition-all focus:border-[#f5a623] focus:bg-white focus:ring-4 focus:ring-[#f5a623]/10"
      />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-[11px] font-black text-[#1b2b4b]/50 uppercase tracking-widest pt-4 pb-2">{title}</h3>;
}

function ApplyDetail() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <MobileShell className="bg-white min-h-screen">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-6 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate({ to: "/apply" })} className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-[#1b2b4b]" />
        </button>
        <h1 className="text-[16px] font-bold text-[#1b2b4b]">Apply for Subsidy</h1>
      </div>

      <div className="px-6 py-8">
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={cn("h-1.5 flex-1 rounded-full transition-colors", n <= step ? "bg-[#f5a623]" : "bg-gray-100")} />
          ))}
        </div>

        <div className="bg-[#1b2b4b] rounded-full flex items-center gap-3 mb-8 p-3 px-4 shadow-lg">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/10">
            <Check className="text-[#f5a623]" size={16} />
          </div>
          <p className="text-[12px] font-semibold text-white">Verified profile — details auto-filled.</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <SectionHeader title="Personal Information" />
            <Field label="Last Name" required defaultValue="Santos" />
            <Field label="First Name" required defaultValue="Juan" />
            <Field label="Middle Name" required defaultValue="Dela Cruz" />
            <Field label="Extension Name" placeholder="e.g. Jr" />
            <Field label="Sex" defaultValue="Male" />
            <SectionHeader title="Date of Birth" />
            <div className="grid grid-cols-3 gap-3">
                <Field label="Month" defaultValue="October" />
                <Field label="Day" defaultValue="19" />
                <Field label="Year" defaultValue="1985" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <SectionHeader title="Address" />
            <Field label="Region" defaultValue="NCR" />
            <Field label="Province" defaultValue="Metro Manila" />
            <Field label="City / Municipality" defaultValue="Quezon City" />
            <Field label="Barangay" defaultValue="Poblacion" />
            <SectionHeader title="Contact" />
            <Field label="Mobile Number" required defaultValue="0917 123 4567" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <SectionHeader title="Vehicle and Franchise" />
            <Field label="Denomination" required defaultValue="MPUJ" />
            <Field label="Case Number" required defaultValue="2020-1212" />
            <Field label="Operator's Name" required defaultValue="JODA" />
            <Field label="Plate Number" required defaultValue="ABC 1234" />
            <Field label="Chassis Number" required defaultValue="1234567890" />
            <Field label="Driver's License No." required defaultValue="C01-12-345678" />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <SectionHeader title="E-wallet" />
            <Field label="E-wallet Name" required defaultValue="GCash" />
            <Field label="Account Number" required defaultValue="0945 977 7262" />
            <label className="flex items-center gap-3 pt-4 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 accent-[#f5a623]" />
              <span className="text-[12px] font-bold text-[#1b2b4b]">I certify that all information is true.</span>
            </label>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3">
          <button 
            onClick={() => step < 4 ? setStep(s => s + 1) : navigate({ to: "/subsidies" })}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 text-[14px] font-bold text-[#1b2b4b] shadow-lg transition-all hover:bg-[#f5a623]/90 hover:scale-[1.01] active:scale-[0.98]"
          >
            {step === 4 ? "Submit Application" : "Continue"}
            {step < 4 && <ChevronRight size={18} />}
          </button>
          
          {step === 4 && (
            <button 
              onClick={() => navigate({ to: "/apply" })}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-white py-4 text-[14px] font-bold text-red-500 border border-red-100 hover:bg-red-50 transition-all active:scale-[0.98]"
            >
              <X size={16} /> Cancel Application
            </button>
          )}
        </div>
      </div>
    </MobileShell>
  );
}