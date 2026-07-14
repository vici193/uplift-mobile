import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { adminApplicants } from "@/data/mock";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplications,
});

const tabs = ["All", "Pending", "Approved", "Rejected"] as const;

function AdminApplications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const [q, setQ] = useState("");
  
  const filtered = adminApplicants.filter((a) => {
    if (tab !== "All" && a.status !== tab.toLowerCase()) return false;
    if (q && !(`${a.name} ${a.id}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar title="Applications" />
      
      <div className="space-y-4 px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm focus-within:border-[#f5a623] transition-all">
          <Search className="h-4 w-4 text-gray-400" />
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search applicants..." 
            className="flex-1 bg-transparent text-sm font-bold text-[#1b2b4b] outline-none placeholder:text-gray-400" 
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                tab === t 
                  ? "bg-[#1b2b4b] text-white shadow-lg" 
                  : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {t === "All" ? adminApplicants.length : adminApplicants.filter((a) => a.status === t.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-20">
          {filtered.map((a) => {
            const badge = a.status === "pending" 
              ? { cls: "bg-amber-50 text-amber-600", Icon: Clock, label: "PENDING" } 
              : a.status === "approved" 
              ? { cls: "bg-emerald-50 text-emerald-600", Icon: CheckCircle2, label: "APPROVED" } 
              : { cls: "bg-red-50 text-red-600", Icon: XCircle, label: "REJECTED" };

            return (
              <div key={a.id} className="group rounded-[24px] bg-white p-4 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-[#f5a623]/20">
                <Link to="/admin/applications-detail" className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white shadow-sm">
                    {a.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold text-[#1b2b4b]">{a.name}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${badge.cls}`}>
                        <badge.Icon className="h-3 w-3" /> {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-gray-500">{a.role} · {a.city}</p>
                    <p className="text-[11px] text-gray-400">Submitted {a.submitted}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 self-center" />
                </Link>

                {a.status === "pending" && (
                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => navigate({ to: "/admin-reject" })}
                      className="flex-1 rounded-xl border border-gray-100 bg-gray-50 py-2.5 text-[11px] font-bold text-red-600 transition-all hover:bg-red-50 hover:border-red-100 active:scale-95"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => navigate({ to: "/admin/applications" })}
                      className="flex-1 rounded-xl bg-[#1b2b4b] py-2.5 text-[11px] font-bold text-white transition-all hover:bg-[#2a3f68] active:scale-95"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}