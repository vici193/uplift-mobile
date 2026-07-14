import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";

// @ts-ignore
export const Route = createFileRoute("/admin-reject")({
  component: RejectApplicationPage,
});

const reasons = [
  "Incomplete documents",
  "Blurry or unclear document",
  "Expired driver's license",
  "Name does not match",
  "Invalid eGov document",
  "Selfie not clear",
  "Other reason",
];

function RejectApplicationPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleReason = (reason: string) => {
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  return (
    <MobileShell>
      <TopBar title="Reject Application" onBack={() => history.back()} />
      
      <div className="px-6 py-6 pb-12 space-y-6">
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#1b2b4b]">Reason for rejection</h2>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Select all that apply</p>
          </div>
        </div>

        <div className="space-y-3">
          {reasons.map((reason) => {
            const isSelected = selected.includes(reason);
            return (
              <button
                key={reason}
                onClick={() => toggleReason(reason)}
                className={`flex w-full items-center gap-4 rounded-[24px] p-5 border transition-all hover:shadow-md ${
                  isSelected 
                    ? "bg-white border-[#f5a623] shadow-md ring-1 ring-[#f5a623]/20" 
                    : "bg-white border-gray-100 shadow-sm hover:border-gray-200"
                }`}
              >
                <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-all ${isSelected ? "border-[#f5a623] bg-[#f5a623]" : "border-gray-200"}`}>
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className="text-[13px] font-bold text-[#1b2b4b]">{reason}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
          <h2 className="mb-3 text-[12px] font-black text-[#1b2b4b] uppercase tracking-wider">Additional notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter additional notes for the driver..."
            className="w-full h-32 p-4 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-bold text-[#1b2b4b] placeholder:text-gray-400 outline-none focus:border-[#f5a623] focus:bg-white transition-all"
          />
        </div>

        <button 
          onClick={() => navigate({ to: "/admin/applications" })}
          className="w-full rounded-2xl bg-red-600 py-4 text-sm font-black text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95"
        >
          Reject Application
        </button>
      </div>
    </MobileShell>
  );
}