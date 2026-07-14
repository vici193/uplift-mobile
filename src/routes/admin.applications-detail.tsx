import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, IdCard, Files, RotateCcw, X, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { adminApplicants } from "@/data/mock";

export const Route = createFileRoute("/admin/applications-detail")({
  component: AdminApplicationDetail,
});

const docs = [
  { name: "Driver's License", Icon: IdCard },
  { name: "Selfie with License", Icon: ImageIcon },
  { name: "eGov PH Document", Icon: FileText },
  { name: "Others (2)", Icon: Files },
];

const reasons = ["Incomplete documents", "Blurry or unclear document", "Expired driver's license", "Name does not match", "Invalid eGov document", "Selfie not clear", "Other reason"];

function AdminApplicationDetail() {
  const navigate = useNavigate();
  const applicant = adminApplicants[0];
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<null | "approve" | "reject" | "revision">(null);

  const act = (kind: "approve" | "reject" | "revision") => {
    setLoading(kind);
    setTimeout(() => navigate({ to: "/admin/applications" }), 800);
  };

  return (
    <MobileShell>
      <TopBar title="Application Details" onBack={() => history.back()} />
      
      {/* Content area with bottom padding */}
      <div className="space-y-6 px-6 pt-4 pb-6">
        <div className="relative overflow-hidden rounded-[32px] bg-[#f5a623] p-6 text-[#1b2b4b] shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white shadow-md">
              {applicant.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="text-sm font-extrabold">{applicant.name}</p>
              <p className="text-[11px] font-medium opacity-80">{applicant.role} · {applicant.city}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#1b2b4b]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">PENDING</span>
            </div>
          </div>
        </div>

        <section>
          <h3 className="mb-3 text-[12px] font-extrabold text-[#1b2b4b] uppercase tracking-wider ml-1">Requirements</h3>
          <div className="space-y-3">
            {docs.map((d) => (
              <div key={d.name} className="flex items-center gap-4 rounded-[24px] bg-white p-4 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-[#f5a623]/20">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gray-50 text-[#1b2b4b]"><d.Icon className="h-5 w-5" /></div>
                <p className="flex-1 text-sm font-bold text-[#1b2b4b]">{d.name}</p>
                <button className="text-[11px] font-bold text-[#f5a623] hover:underline">View</button>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
          <h3 className="text-[12px] font-extrabold text-[#1b2b4b] uppercase tracking-wider mb-4">Application Info</h3>
          <div className="space-y-4 text-xs">
            {[
              ["Submitted", "May 26, 2027 · 10:24 AM"],
              ["Application ID", applicant.id],
              ["Program", "PUV Fuel Subsidy 2026"],
              ["Contact Number", "+63 917 123 4667"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500 font-medium">{k}</span>
                <span className="font-bold text-[#1b2b4b]">{v}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Action Bar at the bottom of the MobileShell content */}
      <div className="sticky bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="flex gap-3">
          <button
              onClick={() => act("revision")}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white py-3.5 text-xs font-bold text-[#1b2b4b] transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-60"
          >
              {loading === "revision" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Revision
          </button>
          <button
              onClick={() => setRejectOpen(true)}
              disabled={!!loading}
              className="flex-1 rounded-2xl border-2 border-red-100 bg-red-50 py-3.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
          >
              Reject
          </button>
          <button
              onClick={() => act("approve")}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1b2b4b] py-3.5 text-xs font-bold text-white transition-all hover:bg-[#2a3f68] active:scale-95 disabled:opacity-60"
          >
              {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve
          </button>
        </div>
      </div>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRejectOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1b2b4b]">Reject Application</h3>
              <button onClick={() => setRejectOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              {reasons.map((r) => {
                const on = selected.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => setSelected(on ? selected.filter((x) => x !== r) : [...selected, r])}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-bold transition-all ${on ? "border-[#f5a623] bg-[#f5a623]/10 text-[#1b2b4b]" : "border-gray-100 bg-white text-gray-600"}`}
                  >
                    <div className={`h-5 w-5 rounded-lg border-2 grid place-items-center ${on ? "border-[#f5a623] bg-[#f5a623]" : "border-gray-200"}`}>
                      {on && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    {r}
                  </button>
                );
              })}
            </div>
            <textarea rows={3} placeholder="Additional notes..." className="mt-4 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623]" />
            <button
              onClick={() => { setRejectOpen(false); act("reject"); }}
              className="mt-4 w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
            >
              Reject Application
            </button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
