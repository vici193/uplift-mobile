import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, HelpCircle, Info, CheckCircle2, Clock, XCircle, RotateCcw, AlertTriangle, ChevronRight, FileText, ArrowRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { myApplications, subsidyPrograms } from "@/data/mock";

export const Route = createFileRoute("/subsidies")({
  component: SubsidiesPage,
});

const statusMeta = {
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", Icon: CheckCircle2 },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-100", Icon: Clock },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-100", Icon: XCircle },
  revision: { label: "Revision", cls: "bg-blue-50 text-blue-700 border-blue-100", Icon: RotateCcw },
} as const;

function SubsidiesPage() {
  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar title="My Subsidies" subtitle={`Managing ${myApplications.length} applications`} />
      
      <div className="flex flex-col gap-6 px-5 pt-2 pb-24">
        <div className="relative overflow-hidden rounded-[24px] bg-[#1b2b4b] p-6 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-3xl" />
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10">
              <Info className="h-5 w-5 text-[#f5a623]" />
            </div>
            <div>
              <h3 className="font-bold text-white">How it works</h3>
              <p className="mt-1 text-[13px] text-white/70 leading-relaxed">
                Apply once, upload requirements, and track your progress in real-time. Approved funds go straight to your eGov wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-extrabold text-[#1b2b4b]">Your Applications</h2>
          
          {myApplications.length > 0 ? (
            <div className="space-y-4">
              {myApplications.map((app) => {
                const program = subsidyPrograms.find((p) => p.id === app.programId)!;
                const s = statusMeta[app.status];
                return (
                  <Link
                    key={app.id}
                    to="/subsidies-detail"
                    className="block rounded-[28px] border border-[#f0f0f0] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:border-[#f5a623]/30 hover:shadow-lg active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${program.color} text-white shadow-md`}>
                        <program.icon className="h-7 w-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-extrabold text-[#1b2b4b]">{program.name}</p>
                        <p className="text-[12px] font-medium text-[#8c8b88]">{program.agency}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#c1c1c1]" />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${s.cls}`}>
                        <s.Icon className="h-3 w-3" /> {s.label}
                      </span>
                      {app.hasGrievance && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                          <AlertTriangle className="h-3 w-3" /> Grievance
                        </span>
                      )}
                    </div>

                    {app.note && (
                        <div className="mt-4 border-t border-[#f0f0f0] pt-4">
                        <p className="text-[12px] text-[#8c8b88] italic">"{app.note}"</p>
                        </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#e6e8eb] p-10 text-center">
              <FileText className="h-8 w-8 text-[#c1c1c1]" />
              <p className="mt-4 font-bold text-[#1b2b4b]">No applications yet</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/help" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#f0f0f0] bg-white py-4 text-[13px] font-bold text-[#1b2b4b] transition-all hover:bg-[#f8f9fa] active:scale-95">
            <HelpCircle className="h-4 w-4" /> Need help?
          </Link>
          <Link to="/apply" className="flex items-center justify-center gap-2 rounded-2xl bg-[#f5a623] py-4 text-[13px] font-bold text-[#1b2b4b] shadow-lg transition-all hover:bg-[#ffb94a] active:scale-95">
            <Plus className="h-4 w-4" /> New application
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}
