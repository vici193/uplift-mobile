import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/message-admin")({
  component: MessageAdminPage,
});

function MessageAdminPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { id: 1, role: "admin", text: "Hello! How can I help you with your application today?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), role: "user", text: input }]);
    setInput("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <MobileShell className="h-screen flex flex-col bg-white">
      <TopBar title="Message UPLIFT Admin" onBack={() => navigate({ to: "/help" })} />
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center transition-all hover:bg-[#f5a623]/10 hover:shadow-md cursor-pointer">
            <div className="h-16 w-16 bg-[#f5a623]/20 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-[#f5a623]" />
            </div>
            <h2 className="font-black text-[#1b2b4b] text-lg">UPLIFT Support</h2>
            <p className="text-xs text-[#8c8b88] mt-1 max-w-[240px]">Our admin typically responds within 24-48 hours.</p>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", m.role === "admin" ? "bg-[#f5a623]" : "bg-gray-100")}>
              {m.role === "admin" ? <Bot size={16} className="text-[#1b2b4b]" /> : <User size={16} className="text-[#1b2b4b]" />}
            </div>
            <div className={cn("px-5 py-3 rounded-2xl text-sm font-bold shadow-sm", m.role === "user" ? "bg-[#1b2b4b] text-white rounded-br-none" : "bg-gray-100 text-[#1b2b4b] rounded-bl-none")}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623]"
            placeholder="Type your message..."
          />
          <button 
            onClick={sendMessage}
            className="h-14 w-14 rounded-2xl bg-[#1b2b4b] text-white flex items-center justify-center hover:bg-[#2a3f68] transition-all shadow-lg active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </MobileShell>
  );
}