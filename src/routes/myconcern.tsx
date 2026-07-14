import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, MessageSquare, AlertTriangle, FileText, Plus, Send } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { cn } from "@/lib/utils";

const TopBar = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="flex items-center p-6 gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
    {onBack && (
      <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
        <ArrowLeft className="h-6 w-6 text-[#1b2b4b]" />
      </button>
    )}
    <h1 className="text-lg font-extrabold text-[#1b2b4b]">{title}</h1>
  </div>
);

export const Route = createFileRoute("/myconcern")({
  component: MyConcernsPage,
});

function MyConcernsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedConcern, setSelectedConcern] = useState<any>(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "I have a concern regarding my application. Can you help me check the status?", sender: "user" },
    { id: 2, text: "Hi, we are currently reviewing your application. Please wait for 24-48 hours.", sender: "admin" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), text: newMessage, sender: "user" }]);
      setNewMessage("");
    }
  };

  const concerns = [
    { category: "General Concern", items: [{ title: "How to Use This App", date: "7/9/2026", status: "Awaiting Response" }] },
    { category: "Reject (2)", items: [
        { title: "My information was incorrectly flagged", date: "7/7/2026", status: "Awaiting Response" },
        { title: "Sa palagay ko ay hindi patas ang pagtanggi", date: "7/7/2026", status: "Awaiting Response" }
    ]},
    { category: "Subsidy test outside deadline warning", items: [{ title: "When will I receive my subsidy?", date: "7/5/2026", status: "Draft" }] }
  ];

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar 
        title={view === 'list' ? "My Concerns" : view === 'create' ? "New Concern" : "Details"} 
        onBack={view === 'list' ? () => navigate({ to: '/home' }) : () => setView('list')}
      />

      <div className="px-5 pt-6 pb-24 bg-white min-h-screen">
        {view === 'list' ? (
          <div className="space-y-6">
            {concerns.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-[11px] font-black text-[#1b2b4b]/50 uppercase tracking-wider px-1">{group.category}</h3>
                {group.items.map((item, i) => (
                  <button key={i} onClick={() => { setSelectedConcern(item); setView('detail'); }} className="w-full bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-[#f5a623] hover:shadow-lg transition-all group">
                    <div className="text-left">
                      <p className="font-bold text-[#1b2b4b] text-sm group-hover:text-[#f5a623] transition-colors">{item.title}</p>
                      <p className="text-[11px] text-gray-400">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-full",
                        item.status === "Draft" ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500"
                      )}>{item.status}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#f5a623] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            ))}
            
            <button 
                onClick={() => setView('create')}
                className="w-full py-4 border-2 border-dashed border-[#1b2b4b]/20 rounded-3xl text-[#1b2b4b] font-bold text-sm hover:border-[#f5a623] hover:text-[#f5a623] transition-all flex items-center justify-center gap-2 hover:bg-[#f5a623]/5"
            >
                <Plus size={18} /> File a New Concern
            </button>
          </div>
        ) : view === 'detail' ? (
            <div className="flex flex-col h-[calc(100vh-160px)] animate-in fade-in duration-300">
                <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                    <div className="bg-[#fef6e8] p-5 rounded-3xl border border-[#f5a623]/20 shadow-sm">
                        <h2 className="font-bold text-[#1b2b4b]">{selectedConcern?.title}</h2>
                        <p className="text-xs text-gray-500 mt-1">{selectedConcern?.date}</p>
                    </div>
                    
                    <div className="space-y-4">
                        {messages.map((m) => (
                            <div key={m.id} className={cn(
                                "p-4 rounded-2xl max-w-[85%] text-sm",
                                m.sender === "user" ? "bg-gray-100 rounded-bl-none border border-gray-200" : "bg-[#1b2b4b] rounded-br-none ml-auto text-white shadow-lg shadow-[#1b2b4b]/20"
                            )}>
                                {m.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky bottom-50 bg-white pt-2">
                    <div className="flex items-center gap-2 border border-gray-200 p-2 rounded-full shadow-lg transition-all focus-within:border-[#f5a623] focus-within:ring-2 focus-within:ring-[#f5a623]/20">
                        <input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 px-4 py-2 text-sm outline-none" 
                            placeholder="Type a message..." 
                        />
                        <button 
                            onClick={handleSend}
                            className="h-10 w-10 flex items-center justify-center bg-[#f5a623] text-[#1b2b4b] rounded-full hover:bg-[#ffc107] transition-all shadow-md"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Type of Concern</label>
                <select className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold outline-none focus:border-[#f5a623] transition-all">
                    <option>Select concern type...</option>
                    <option>General</option>
                    <option>Subsidy Payout</option>
                    <option>Account Access</option>
                </select>
            </div>
            
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Which subsidy is this about? *</label>
                <select className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold outline-none focus:border-[#f5a623] transition-all">
                    <option>Select subsidy...</option>
                    <option>LTFRB Payout 2026</option>
                    <option>Energy Subsidy</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Your Message</label>
                <textarea className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm h-32 outline-none focus:border-[#f5a623] transition-all" placeholder="Describe your concern here..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setView('list')} className="py-4 rounded-2xl font-bold text-[#1b2b4b] bg-gray-50 hover:bg-gray-100 transition-colors">Cancel</button>
                <button className="py-4 rounded-2xl font-bold text-white bg-[#f5a623] shadow-lg shadow-[#f5a623]/20 hover:bg-[#ffc107] transition-all">Submit</button>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}