import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, QrCode, FileText, ChevronRight, Eye, EyeOff, HelpCircle } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { subsidyPrograms } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/subsidies-detail")({
  component: SubsidyDetailPage,
});

function SubsidyDetailPage() {
  const [showQR, setShowQR] = useState(false);
  const program = subsidyPrograms[0];

  return (
    <MobileShell>
      <div className="sticky top-0 z-20 flex items-center gap-4 bg-white/90 px-6 pt-8 pb-4 backdrop-blur-xl border-b border-gray-100">
        <Link to="/subsidies" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
        </Link>
        <h1 className="font-bold text-[#1b2b4b]">Subsidy Details</h1>
      </div>

      <div className="px-6 pt-8 pb-24 flex flex-col items-center text-center">
        <div className={`grid h-24 w-24 place-items-center rounded-[32px] bg-gradient-to-br ${program.color} text-white shadow-xl shadow-gray-200 mb-6`}>
          <program.icon className="h-12 w-12" />
        </div>
        
        <h1 className="text-2xl font-black text-[#1b2b4b] leading-tight">{program.name}</h1>
        <p className="text-[#f5a623] font-bold text-sm mt-1">{program.agency}</p>

        <div className="mt-8 w-full">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-[#1b2b4b]">My Access QR</h3>
                <button 
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#8c8b88] hover:text-[#1b2b4b] transition-colors"
                >
                    {showQR ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showQR ? "Hide QR" : "Reveal QR"}
                </button>
            </div>
            
            <div className={cn(
                "rounded-[32px] border-2 transition-all duration-500 overflow-hidden w-full flex flex-col items-center justify-center",
                showQR ? "bg-white border-[#f5a623] p-8 shadow-xl" : "bg-[#1b2b4b] border-[#1b2b4b] p-8 shadow-lg"
            )}>
                {showQR ? (
                    <div className="flex flex-col items-center animate-in fade-in duration-700">
                        <QrCode className="h-40 w-40 text-[#1b2b4b]" />
                        <p className="text-[11px] font-bold text-[#8c8b88] mt-4 uppercase tracking-widest text-center">Present at Venue</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-white font-bold text-lg">Secure Access QR</p>
                        <p className="text-white/60 text-xs">Tap reveal to display code</p>
                        <QrCode className="h-16 w-16 text-white/20 mt-2" />
                    </div>
                )}
            </div>
        </div>

        <div className="mt-8 space-y-6 w-full text-left">
            <div className="space-y-2">
                <h3 className="font-bold text-[#1b2b4b]">Overview</h3>
                <div className="text-sm text-[#8c8b88] leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 text-justify">
                    <p>The {program.name} is a comprehensive financial support mechanism designed to alleviate the economic burden of rising energy costs on public utility drivers. This program provides direct, transparent aid to help sustain your livelihood and keep public transport affordable for all.</p>
                    <p className="mt-3">The subsidy is distributed directly to your eGov-verified account, ensuring that you receive the full benefit without any administrative delays. This aid is vital for ensuring long-term operational stability.</p>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-bold text-[#1b2b4b]">Instructions</h3>
                <div className="bg-[#fffaf0] p-5 rounded-2xl border border-[#f5a623]/20 text-sm text-[#1b2b4b]/80">
                    <ul className="space-y-2">
                        <li className="flex gap-2"><span className="text-[#f5a623]">•</span> Visit the local LTFRB office with your QR code.</li>
                        <li className="flex gap-2"><span className="text-[#f5a623]">•</span> Bring valid original IDs and your vehicle registration.</li>
                        <li className="flex gap-2"><span className="text-[#f5a623]">•</span> Processing and verification usually take 3-5 business days.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="mt-10 w-full text-left">
            <h3 className="font-bold text-[#1b2b4b] mb-4">Latest Updates</h3>
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-[#1b2b4b] hover:shadow-md transition-all cursor-pointer group">
                        <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-[#1b2b4b] group-hover:text-white transition-colors"><FileText size={16}/></div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-[#1b2b4b]">New payout schedule release</p>
                            <p className="text-[10px] text-[#8c8b88]">July {5+i}, 2026</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[#1b2b4b]" />
                    </div>
                ))}
            </div>
        </div>

        <Link to="/help" className="mt-8 flex w-full items-center justify-center gap-3 bg-[#1b2b4b] text-white p-4 rounded-2xl font-bold hover:bg-[#253960] transition-colors">
            <HelpCircle size={20} />
            Need help?
        </Link>
      </div>
    </MobileShell>
  );
}