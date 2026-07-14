import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  CalendarDays, MapPin, Clock, Plus, ArrowDownToLine, 
  Pencil, AlertTriangle, ArrowLeft, LayoutDashboard
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

function AdminEvents() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const handleEdit = (ev: any) => {
    setEditingEvent(ev);
    setView('create');
  };

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => view === 'create' ? setView('list') : window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="text-[#1b2b4b]" size={20} />
          </button>
          <h1 className="text-l font-black text-[#1b2b4b]">
            {view === 'list' ? 'Events' : editingEvent ? 'Edit Event' : 'Create Event'}
          </h1>
          {view === 'list' && (
            <button 
              onClick={() => { setEditingEvent(null); setView('create'); }}
              className="ml-auto flex items-center gap-2 bg-[#f5a623] text-[#1b2b4b] px-4 py-2 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={18} /> New
            </button>
          )}
        </div>

        {view === 'create' ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="bg-[#1b2b4b] px-6 py-4 flex items-center gap-3">
                <LayoutDashboard className="text-[#f5a623]" size={20} />
                <h2 className="font-bold text-white">Event Details</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Program Name *</label>
                <input defaultValue={editingEvent?.title} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] focus:bg-white transition-all" placeholder="Enter program name" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Agency</label>
                  <input defaultValue={editingEvent?.agency} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] transition-all" placeholder="e.g. LTFRB" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Amount</label>
                  <input defaultValue={editingEvent?.amount} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] transition-all" placeholder="₱" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Venue *</label>
                <input className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] transition-all" placeholder="Enter location" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Qualified Denominations</label>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-[#1b2b4b]">
                  {['MPUJ', 'MUVE', 'MPUB', 'Mini-Bus', 'Taxi', 'TPUJ', 'TUVE', 'PUB', 'School Transport'].map(item => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <input type="checkbox" className="accent-[#f5a623]" /> {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Payout Date *</label>
                  <input type="date" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] transition-all" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Deadline *</label>
                    <input type="datetime-local" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] transition-all" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#1b2b4b] uppercase">Instructions</label>
                <textarea className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#f5a623] transition-all h-24" placeholder="Bring original Driver's License..." />
              </div>
              
              <button onClick={() => setView('list')} className="w-full bg-[#f5a623] text-[#1b2b4b] py-4 rounded-2xl font-bold transition-all hover:bg-[#ffc107] active:scale-[0.98]">
                {editingEvent ? 'Save Changes' : 'Publish Event'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { title: "Testing", agency: "LTFRB", amount: "5000", date: "2027-01-01", loc: "Sm North EDSA", time: "08:00 - 17:00" },
              { title: "Subsidy Demo", agency: "Jed", amount: "1000", date: "2026-09-09", loc: "SB", time: "08:00 - 17:00" },
              { title: "Outside Deadline Warning", agency: "Jed", amount: "1000", date: "2026-09-09", loc: "SB", time: "08:00 - 17:00", warning: true },
            ].map((ev, i) => (
              <div key={i} className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3 transition-all duration-300 hover:bg-[#1b2b4b] hover:border-[#1b2b4b] hover:shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-[#1b2b4b] group-hover:text-white text-lg transition-colors">{ev.title}</h3>
                    <p className="text-xs font-bold text-[#f5a623] transition-colors">{ev.agency} · ₱{ev.amount}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="flex items-center gap-1 text-[10px] bg-gray-50 text-[#1b2b4b] px-3 py-1.5 rounded-full font-bold group-hover:bg-[#1b2b4b] group-hover:text-white transition-all">
                      <ArrowDownToLine size={12}/> Export
                    </button>
                    <button onClick={() => handleEdit(ev)} className="flex items-center gap-1 text-[10px] bg-gray-50 text-[#1b2b4b] px-3 py-1.5 rounded-full font-bold group-hover:bg-[#f5a623] group-hover:text-[#1b2b4b] transition-all">
                      <Pencil size={12}/> Edit
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 text-[11px] text-gray-500 group-hover:text-white/70 font-medium transition-colors">
                  <div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#f5a623]" /> {ev.date}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-[#f5a623]" /> {ev.loc}</div>
                  <div className="flex items-center gap-2"><Clock size={14} className="text-[#f5a623]" /> {ev.time}</div>
                </div>
                
                {ev.warning && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-2xl text-[11px] font-bold">
                    <AlertTriangle size={14} /> Deadline: July 2, 11:59 PM
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}