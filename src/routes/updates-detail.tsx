import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, CheckCircle2, ShieldCheck, MapPin, FileText, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/updates-detail")({
  component: UpdateDetailPage,
});

function UpdateDetailPage() {
  return (
    <MobileShell>
      <div className="sticky top-0 z-20 flex items-center gap-4 bg-[#ffffff]/80 px-6 pt-8 pb-4 backdrop-blur-xl border-b border-gray-100">
        <Link to="/updates" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-[#f5a623] hover:text-[#1b2b4b] transition-all active:scale-95">
          <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
        </Link>
        <h1 className="text-xl font-extrabold text-[#1b2b4b]">Update details</h1>
      </div>

      <div className="px-6 pt-8 pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#1b2b4b] uppercase tracking-wider bg-[#f5a623]/10 px-4 py-1.5 rounded-full">
            <Clock className="h-3 w-3" /> Updated: July 7, 2026
          </span>
          <h1 className="mt-4 text-2xl font-black text-[#1b2b4b] leading-tight">Verification Process Update</h1>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-[24px] bg-[#fdfaf5] border border-[#f5a623]/20 shadow-sm transition-all hover:shadow-md hover:border-[#f5a623]/50 hover:-translate-y-0.5 cursor-default">
            <p className="text-[10px] font-bold text-[#f5a623] uppercase tracking-wider">Reference ID</p>
            <p className="text-sm font-extrabold text-[#1b2b4b]">UPL-2026-8842</p>
          </div>
          <div className="p-4 rounded-[24px] bg-[#fdfaf5] border border-[#f5a623]/20 shadow-sm transition-all hover:shadow-md hover:border-[#f5a623]/50 hover:-translate-y-0.5 cursor-default">
            <p className="text-[10px] font-bold text-[#f5a623] uppercase tracking-wider">Department</p>
            <p className="text-sm font-extrabold text-[#1b2b4b]">LTFRB Manila</p>
          </div>
        </div>
        
        <div className="mt-6 p-6 rounded-[24px] bg-white border border-[#f0f0f0] border-l-4 border-l-[#f5a623] shadow-sm transition-all hover:shadow-lg hover:border-l-[#f5a623]">
          <h3 className="text-[15px] font-extrabold text-[#1b2b4b] mb-3">Application Summary</h3>
          <p className="text-[14px] leading-relaxed text-[#1b2b4b]/70 font-medium">
            Your recent application for account verification has been successfully processed and verified. 
            {'\n\n'}
            Our team has completed the multi-step background check and confirmed your documents match our database. Your account status is now updated to <strong>Verified Driver</strong>.
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-[15px] font-extrabold text-[#1b2b4b] mb-4">Recommended Next Steps</h3>
          <div className="space-y-3">
            {[
              { label: "View Verified License", desc: "Digital copy now available", icon: ShieldCheck },
              { label: "Check Nearby Hubs", desc: "Find active stations", icon: MapPin },
              { label: "Download Report", desc: "PDF verification log", icon: FileText }
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center gap-4 p-4 rounded-[24px] bg-white border border-[#f0f0f0] shadow-sm transition-all hover:border-[#f5a623] hover:shadow-lg hover:scale-[1.01] text-left group">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gray-50 group-hover:bg-[#f5a623]/10">
                  <action.icon className="h-5 w-5 text-[#1b2b4b] group-hover:text-[#f5a623]" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[#1b2b4b]">{action.label}</p>
                  <p className="text-[11px] text-[#8c8b88]">{action.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#8c8b88] group-hover:text-[#f5a623]" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Link 
            to="/home"
            className="w-full bg-[#1b2b4b] text-white py-4 rounded-full font-bold shadow-lg shadow-[#1b2b4b]/20 hover:bg-[#1b2b4b]/90 transition-all active:scale-95 text-center"
          >
            View My Dashboard
          </Link>
          <Link to="/updates" className="w-full text-center py-4 text-[#8c8b88] font-bold hover:text-[#1b2b4b] transition-colors">
            Dismiss
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}