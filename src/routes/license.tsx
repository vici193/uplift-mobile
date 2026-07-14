import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, IdCard, UserCircle, CheckCircle2, Info, Upload } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";

export const Route = createFileRoute("/license")({
  component: LicensePage,
});

function LicensePage() {
  const navigate = useNavigate();
  const [items] = useState([
    { title: "Driver's License (Front)", done: true, hint: "Uploaded" },
    { title: "Driver's License (Back)", done: true, hint: "Uploaded" },
    { title: "Selfie with License", done: false, hint: "Hold license beside your face" },
  ]);

  return (
    <MobileShell>
      <TopBar title="Driver's License" onBack={() => history.back()} />
      
      <div className="px-6 pt-4 pb-24 space-y-6">
        {/* Info Card */}
        <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-3xl p-5 flex gap-4">
          <Info className="h-6 w-6 shrink-0 text-[#f5a623]" />
          <div className="space-y-1">
            <p className="text-xs font-black text-[#1b2b4b]">Why verify?</p>
            <p className="text-[11px] text-[#1b2b4b]/70 font-medium">
              Verified drivers upload fewer documents when applying for subsidies.
            </p>
          </div>
        </div>

        {/* Upload List */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 p-4 rounded-[24px] bg-white border border-[#f0f0f0] shadow-sm transition-all hover:border-[#f5a623]/30 hover:shadow-md group"
            >
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-colors ${item.done ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-[#1b2b4b]"}`}>
                {item.done ? <CheckCircle2 className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1b2b4b] truncate">{item.title}</p>
                <p className={`text-[11px] font-medium ${item.done ? "text-emerald-600" : "text-[#8c8b88]"}`}>{item.hint}</p>
              </div>

              <button className="rounded-xl bg-[#f8f9fa] hover:bg-[#1b2b4b] hover:text-white text-[#1b2b4b] px-4 py-2 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm">
                <Upload size={12} /> {item.done ? "Re-upload" : "Capture"}
              </button>
            </div>
          ))}
        </div>

        {/* Discrepancy Note */}
        <div className="bg-white border border-[#f0f0f0] rounded-[24px] p-5 shadow-sm">
          <p className="text-[12px] font-extrabold text-[#1b2b4b] mb-1">Note about discrepancies</p>
          <p className="text-[11px] text-[#8c8b88] mb-4">
            If any detail on your ID doesn't match your profile, add a note so reviewers can verify faster.
          </p>
          <textarea 
            placeholder="E.g. Middle name spelled differently on my license…" 
            rows={3}
            className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 text-xs font-medium text-[#1b2b4b] placeholder:text-gray-400 focus:border-[#f5a623] outline-none transition-all" 
          />
        </div>

        <button 
          onClick={() => navigate({ to: "/home" })}
          className="w-full py-4 rounded-2xl bg-[#1b2b4b] text-white font-bold hover:bg-[#2a3f68] transition-all shadow-lg active:scale-95"
        >
          Submit for review
        </button>
      </div>
    </MobileShell>
  );
}