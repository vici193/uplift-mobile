import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Upload, ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";

export const Route = createFileRoute("/grievance")({
  component: GrievancePage,
});

function GrievancePage() {
  return (
    <MobileShell>
      <TopBar title="File a Grievance" onBack={() => history.back()} />
      
      <div className="px-6 pt-4 pb-24 space-y-6">
        {/* Warning Card */}
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex gap-4 text-amber-900">
          <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-[11px] font-medium leading-relaxed">
            A case officer will respond within 7 business days. Please be specific, as providing false information may delay your application processing.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-[#1b2b4b] uppercase tracking-wider ml-1">Topic</label>
                <select className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623]">
                    <option value="" disabled selected>Select category</option>
                    <option>Application rejected — Potential error</option>
                    <option>Delayed approval process</option>
                    <option>Incorrect subsidy amount</option>
                    <option>e-Gov Verification issue</option>
                    <option>Other concerns</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-[#1b2b4b] uppercase tracking-wider ml-1">Reference Number</label>
                <input 
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623]" 
                    defaultValue="SB-2410-0091" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-[#1b2b4b] uppercase tracking-wider ml-1">Description</label>
                <textarea 
                    rows={5} 
                    placeholder="Provide dates, relevant names, and what you expected..." 
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] resize-none"
                />
            </div>
        </div>

        {/* Evidence Upload */}
        <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-[#1b2b4b] uppercase tracking-wider ml-1">Attach Evidence</label>
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center cursor-pointer hover:border-[#f5a623] transition-all">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-gray-50 mb-3">
                    <Upload className="h-6 w-6 text-[#1b2b4b]" />
                </div>
                <p className="text-xs font-bold text-[#1b2b4b]">Tap to upload files</p>
                <p className="text-[10px] text-[#8c8b88] mt-1">Photos or PDFs (Max 5MB)</p>
            </div>
        </div>

        <button className="w-full py-4 rounded-2xl bg-[#1b2b4b] text-white font-bold hover:bg-[#2a3f68] transition-all shadow-lg active:scale-95">
            Submit Grievance
        </button>
      </div>
    </MobileShell>
  );
}