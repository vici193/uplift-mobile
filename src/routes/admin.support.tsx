import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Plus, Search, AlertCircle, FileText } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { helpRequests } from "@/data/mock";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupport,
});

const grievances = [
  { name: "Juan Santos", issue: "Incorrect subsidy amount", status: "PENDING", evidence: "receipt_01.pdf" },
  { name: "Maria Cruz", issue: "System login error", status: "PENDING", evidence: "screenshot.png" },
];

function AdminSupport() {
  const navigate = useNavigate();
  const [view, setView] = useState<"chat" | "grievance">("chat");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  const filteredChats = helpRequests.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar title="Support & Grievances" />
      
      <div className="px-6 pt-4 pb-24 space-y-6">
        <div className="flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
          <button 
            onClick={() => setView("chat")}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all ${view === "chat" ? "bg-white text-[#1b2b4b] shadow-sm" : "text-gray-500"}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setView("grievance")}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all ${view === "grievance" ? "bg-white text-[#1b2b4b] shadow-sm" : "text-gray-500"}`}
          >
            Grievances
          </button>
        </div>

        {view === "chat" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm focus-within:border-[#f5a623]">
              <Search className="h-4 w-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats..." className="flex-1 bg-transparent text-sm font-bold text-[#1b2b4b] outline-none" />
            </div>

            {filteredChats.map((r) => (
              <button
                key={r.name}
                onClick={() => setActiveChat(r.name)}
                className={`flex w-full items-center gap-4 rounded-[24px] p-4 border transition-all ${activeChat === r.name ? "bg-white border-[#f5a623] shadow-md" : "bg-white border-gray-100 shadow-sm hover:border-gray-200"}`}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white">{r.name.split(" ").map(n => n[0]).join("")}</div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-extrabold text-[#1b2b4b] truncate">{r.name}</p>
                  <p className="text-[11px] font-medium text-gray-500 truncate">{r.subject}</p>
                </div>
              </button>
            ))}
            
            {activeChat && (
              <div className="rounded-[32px] bg-white p-5 border border-gray-100 shadow-sm mt-4">
                <div className="space-y-4 mb-6">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-50 p-4 text-[13px] font-medium text-[#1b2b4b]">How can I help you today?</div>
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#1b2b4b] p-4 text-[13px] font-medium text-white">We're looking into this for you.</div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-2 border border-gray-100">
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type a reply…" className="flex-1 bg-transparent px-3 text-sm font-bold text-[#1b2b4b] outline-none" />
                  <button onClick={() => setMsg("")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f5a623] text-[#1b2b4b] shadow-md active:scale-95"><Send className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {grievances.map((g) => (
              <div key={g.name} className="rounded-[24px] bg-white p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-[#f5a623]/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600"><AlertCircle className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-extrabold text-[#1b2b4b]">{g.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{g.status}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#1b2b4b] mb-3">{g.issue}</p>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl text-[11px] font-bold text-[#1b2b4b] border border-gray-100">
                        <FileText className="h-4 w-4" /> {g.evidence}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                      onClick={() => navigate({ to: "/admin-reject" })}
                      className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 active:scale-95"
                    >
                      Reject
                    </button>
                    <button className="flex-1 bg-[#1b2b4b] text-white py-2.5 rounded-xl text-[11px] font-bold active:scale-95">Resolve</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fixed bottom-24 right-6 grid h-14 w-14 place-items-center rounded-3xl bg-[#1b2b4b] text-white shadow-xl transition-all hover:scale-105 active:scale-95">
        <Plus className="h-6 w-6" />
      </button>
    </MobileShell>
  );
}