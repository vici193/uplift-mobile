import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowLeft, CheckCircle2, XCircle, FileText, 
  ChevronRight, MapPin, CalendarDays, Phone
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
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

export const Route = createFileRoute("/admin/verify")({
  component: AdminVerify,
});

const mockQueue = [
  { id: 1, name: "Juan Santos", license: "C01-34-323423", dob: "1999-10-18", region: "NCR", mobile: "09171234567" },
  { id: 2, name: "Rodrigo Santos", license: "C01-23-456789", dob: "1995-05-12", region: "NCR", mobile: "09187654321" },
  { id: 3, name: "John David", license: "C01-12-121212", dob: "1992-08-23", region: "R3", mobile: "09271122334" },
];

function AdminVerify() {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const navigate = useNavigate();

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar 
        title={selectedUser ? "Evaluation" : "Verify Accounts"} 
        onBack={selectedUser ? () => setSelectedUser(null) : () => navigate({ to: '/admin' })} 
      />

      <div className="px-5 pt-6 pb-24 bg-white min-h-screen">
        {selectedUser ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#fef6e8] p-6 rounded-3xl border border-[#f5a623]/20 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-[#1b2b4b] rounded-2xl flex items-center justify-center text-[#f5a623] font-black text-xl shadow-md transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] cursor-pointer">
                    {selectedUser.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                    <h2 className="font-black text-[#1b2b4b] text-base">{selectedUser.name}</h2>
                    <p className="text-[11px] font-bold text-[#1b2b4b]/60">{selectedUser.license}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-[#f5a623]/20 pt-4">
                {[
                  { label: "Date of Birth", value: selectedUser.dob, icon: CalendarDays },
                  { label: "Region", value: selectedUser.region, icon: MapPin },
                  { label: "Mobile", value: selectedUser.mobile, icon: Phone },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-sm p-3 bg-white/50 rounded-2xl border border-[#1b2b4b]/5 shadow-sm transition-all hover:border-[#f5a623]/50">
                    <div className="p-2 bg-[#fef6e8] rounded-lg text-[#f5a623]"><item.icon size={16}/></div>
                    <span className="font-bold text-gray-500">{item.label}:</span>
                    <span className="font-bold text-[#1b2b4b] ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 transition-all hover:border-[#f5a623]/50 hover:shadow-md">
                <h3 className="font-bold text-[#1b2b4b] flex items-center gap-2"><FileText size={16} className="text-[#f5a623]"/> Submitted Documents</h3>
                <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 transition-all hover:border-[#f5a623] cursor-pointer">
                    <p className="text-xs font-bold text-gray-400">Tap to view full document</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate({ to: '/admin-reject' })}
                  className="flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 py-4 rounded-2xl font-bold transition-all hover:bg-red-500 hover:text-white active:scale-95"
                >
                    <XCircle size={20} /> Reject
                </button>
                <button className="flex items-center justify-center gap-2 bg-[#1b2b4b] text-white py-4 rounded-2xl font-bold transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] hover:shadow-lg active:scale-95">
                    <CheckCircle2 size={20} /> Approve
                </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-2 px-1 flex items-center justify-between">
                <h2 className="text-[14px] font-extrabold text-[#1b2b4b]">Pending Queue</h2>
                <span className="bg-[#f5a623] text-[#1b2b4b] px-3 py-1 rounded-full text-[10px] font-black uppercase">{mockQueue.length} Active</span>
            </div>
            {mockQueue.map((user) => (
              <button 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center justify-between bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-[#f5a623] hover:shadow-md hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-[#1b2b4b] group-hover:bg-[#f5a623] group-hover:text-white transition-all">
                    {user.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-[#1b2b4b] group-hover:text-[#1b2b4b] transition-colors">{user.name}</p>
                    <p className="text-[11px] font-medium text-gray-500">License: {user.license}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#f5a623] transition-colors" size={24} />
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}