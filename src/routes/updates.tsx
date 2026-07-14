import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { notifications } from "@/data/mock";

export const Route = createFileRoute("/updates")({
  component: UpdatesPage,
});

const tabs = ["All", "Applications", "Announcements", "Alerts"] as const;

function UpdatesPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("All");

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar title="Updates" />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="px-5 pt-4">
        <div className="flex gap-2 pb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 rounded-full px-5 py-2 text-[12px] font-extrabold transition-all duration-300 ${
                tab === t 
                  ? "bg-[#1b2b4b] text-white shadow-lg" 
                  : "bg-white text-[#8c8b88] border border-[#f0f0f0] hover:bg-[#f8f9fa]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-8">
          {notifications.map((n) => (
            <Link 
              key={n.id}
              to="/updates-detail"
              className="group flex w-full items-start gap-4 rounded-[28px] bg-white p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl ${n.type === "success" ? "bg-emerald-50 text-emerald-600" : n.type === "warning" ? "bg-amber-50 text-amber-600" : "bg-[#f8f9fa] text-[#1b2b4b]"}`}>
                {n.type === "success" ? <CheckCircle2 className="h-6 w-6" /> : n.type === "warning" ? <AlertTriangle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-extrabold text-[#1b2b4b] truncate">{n.title}</p>
                  <span className="flex-shrink-0 text-[10px] font-bold text-[#8c8b88]">{n.time}</span>
                </div>
                <p className="mt-1 text-[12px] font-medium text-[#8c8b88] line-clamp-2 leading-relaxed">
                  {n.body}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-[#c1c1c1] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}