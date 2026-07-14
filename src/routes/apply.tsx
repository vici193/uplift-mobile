import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Check, Calendar, MapPin, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { subsidyPrograms } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
});

function ApplyPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = () => {
    if (!selected) return;
    setLoading(true);
    // Navigates to the multi-step application form
    setTimeout(() => navigate({ to: "/apply-detail" }), 900);
  };

  return (
    <MobileShell>
      <TopBar title="Apply for a subsidy" subtitle="Choose a program to apply for" />
      
      <div className="space-y-4 px-5 pt-4 pb-32">
        {subsidyPrograms.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "group block w-full rounded-[28px] border-2 p-5 text-left transition-all duration-300 ease-out",
                active 
                  ? "border-[#f5a623] bg-[#f5a623]/5 shadow-[0_8px_30px_rgba(245,166,35,0.15)]" 
                  : "border-transparent bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-[#1b2b4b] hover:bg-[#1b2b4b] hover:shadow-xl"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl shadow-sm transition-transform group-hover:scale-105",
                  `bg-gradient-to-br ${p.color}`
                )}>
                  <p.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-black text-[#1b2b4b] transition-colors", active ? "text-[#1b2b4b]" : "group-hover:text-white")}>
                      {p.name}
                    </p>
                    {active && (
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-[#f5a623] text-white shadow-md animate-in zoom-in">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <p className={cn("text-[11px] font-bold text-[#f5a623] uppercase tracking-wider transition-colors", active ? "text-[#f5a623]" : "group-hover:text-[#f5a623]/80")}>
                    {p.agency}
                  </p>
                  <p className={cn("mt-1.5 line-clamp-2 text-xs text-[#8c8b88] leading-relaxed transition-colors", active ? "text-[#8c8b88]" : "group-hover:text-gray-300")}>
                    {p.description}
                  </p>
                  
                  <div className={cn("mt-3 flex flex-wrap items-center gap-3 text-[10px] text-[#8c8b88] transition-colors", active ? "text-[#8c8b88]" : "group-hover:text-gray-300")}>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold text-[#1b2b4b] border border-gray-100 shadow-sm transition-colors", active ? "bg-white" : "group-hover:bg-[#f5a623] group-hover:text-white group-hover:border-none")}>
                      {p.amount}
                    </span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Ends {p.deadline}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md p-5 bg-white border-t border-gray-100 z-50">
        <button
          onClick={apply}
          disabled={!selected || loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1b2b4b] py-3.5 text-sm font-bold text-white shadow-xl shadow-[#1b2b4b]/20 transition-all hover:scale-[1.01] hover:bg-[#1b2b4b]/90 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Submitting..." : selected ? "Confirm & Apply" : "Select a program"}
          {!loading && <ChevronRight className="h-4 w-4" />}
        </button>
        <Link to="/subsidies" className="mt-3 block text-center text-xs font-bold text-[#8c8b88] hover:text-[#1b2b4b]">
          View my existing applications
        </Link>
      </div>
    </MobileShell>
  );
}