import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Pencil, X, ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/edit")({
  component: EditProfilePage,
});

function EditProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <MobileShell>
      <div className="flex items-center gap-4 p-6 sticky top-0 bg-white z-50 border-b border-gray-100">
        <button onClick={() => history.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="h-6 w-6 text-[#1b2b4b]" />
        </button>
        <h1 className="text-lg font-extrabold text-[#1b2b4b] flex-1">Edit Information</h1>
        <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5a623]/10 text-[#f5a623] font-bold text-sm hover:bg-[#f5a623]/20 transition-all"
        >
            {isEditing ? <><X size={16}/> Cancel</> : <><Pencil size={16}/> Edit</>}
        </button>
      </div>
      
      <div className="px-6 pt-4 pb-8 space-y-8">
        <section className="space-y-4">
          <h3 className="text-[11px] font-extrabold text-[#8c8b88] uppercase tracking-wider ml-1">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <input disabled={!isEditing} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="First Name" defaultValue="Juan" />
            <input disabled={!isEditing} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Middle Name" defaultValue="Dela Cruz" />
          </div>
          <input disabled={!isEditing} className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Last Name" defaultValue="Santos" />
          <input disabled={!isEditing} className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Email Address" defaultValue="juan.santos@email.com" />
          <input disabled={!isEditing} className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Mobile Number" defaultValue="0917 123 4567" />
        </section>

        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-[11px] font-extrabold text-[#8c8b88] uppercase tracking-wider ml-1">Cooperative & Vehicle</h3>
          <input disabled={!isEditing} className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Cooperative Name" defaultValue="Manila Jeepney Coop" />
          <div className="grid grid-cols-2 gap-4">
            <input disabled={!isEditing} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Plate No." defaultValue="ABC 1234" />
            <input disabled={!isEditing} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Chassis No." defaultValue="CS-99887766" />
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-[11px] font-extrabold text-[#8c8b88] uppercase tracking-wider ml-1">Account Recovery</h3>
          <input disabled={!isEditing} className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Security Q1: City of birth?" defaultValue="Manila" />
          <input disabled={!isEditing} className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623] disabled:opacity-60 disabled:bg-gray-50 transition-all" placeholder="Security Q2: Mother's maiden name?" defaultValue="Dela Cruz" />
        </section>

        {isEditing && (
            <button 
                className="w-full py-4 rounded-2xl bg-[#1b2b4b] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#2a3f68] transition-all shadow-lg active:scale-95 animate-in slide-in-from-bottom-2 mt-8"
                onClick={() => setIsEditing(false)}
            >
                <Save size={18} /> Save Changes
            </button>
        )}
      </div>
    </MobileShell>
  );
}