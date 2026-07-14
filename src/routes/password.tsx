import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import React from "react";

export const Route = createFileRoute("/password")({
  component: PasswordPage,
});

function Field({ label, hint, ...props }: { label: string, hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-black text-[#1b2b4b] uppercase tracking-wider ml-1">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-bold text-[#1b2b4b] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10"
      />
      {hint && <span className="pl-1 text-[11px] font-bold text-[#8c8b88]">{hint}</span>}
    </label>
  );
}

function PasswordPage() {
  return (
    <MobileShell>
      <div className="sticky top-0 z-20 flex items-center gap-4 bg-white px-6 pb-6 pt-8 border-b border-gray-100">
        <button
          onClick={() => history.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:scale-90"
        >
          <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-[17px] font-extrabold text-[#1b2b4b]">Change Password</h1>
          <p className="text-[11px] font-bold text-[#8c8b88]">Update your account security.</p>
        </div>
      </div>

      <div className="px-6 pb-8 pt-6">
        <div className="flex flex-col gap-8">
          <Field 
            label="Phone Number" 
            defaultValue="+63 917 123 4567" 
            disabled 
          />

          <div className="flex flex-col gap-4 rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-[13px] font-black text-[#1b2b4b]">Security Verification</h3>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#8c8b88]">What city were you born in?</span>
                <input
                  placeholder="Answer"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-[#1b2b4b] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#8c8b88]">Your elementary school?</span>
                <input
                  placeholder="Answer"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-[#1b2b4b] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10"
                />
              </label>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-100">
            <Field 
                label="New Password" 
                placeholder="••••••••" 
                type="password" 
                hint="Min 8 characters"
            />
            
            <Field 
                label="Confirm New Password" 
                placeholder="••••••••" 
                type="password" 
            />
          </div>

          <button 
            onClick={() => history.back()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1b2b4b] py-4 text-[14px] font-extrabold text-white shadow-lg transition-all hover:bg-[#2a3f68] active:scale-95"
          >
            <Save size={18} /> Update Password
          </button>
        </div>
      </div>
    </MobileShell>
  );
}