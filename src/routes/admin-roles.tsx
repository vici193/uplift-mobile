import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, Users, Check } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { cn } from "@/lib/utils";

// @ts-ignore
export const Route = createFileRoute("/admin-roles")({
  component: RolesPage,
});

const roles = [
  { id: "admin", label: "Super Admin", desc: "Full system access" },
  { id: "moderator", label: "Moderator", desc: "Review & verify apps" },
  { id: "support", label: "Support Agent", desc: "Manage chat & tickets" },
];

const permissions = [
  { id: "dash", label: "Dashboard Access" },
  { id: "verify", label: "Verify Applications" },
  { id: "reject", label: "Reject Applications" },
  { id: "support", label: "Support Chat" },
];

function RolesPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(roles[0].id);

  return (
    <MobileShell>
      <TopBar title="Roles & Permissions" onBack={() => history.back()} />
      
      <div className="px-6 pt-4 pb-24 space-y-8">
        <section>
          <h2 className="text-[11px] font-black text-[#1b2b4b] uppercase tracking-wider ml-1 mb-4">Select Role</h2>
          <div className="grid grid-cols-1 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all text-left",
                  selectedRole === role.id 
                    ? "border-[#f5a623] bg-[#f5a623]/5 shadow-sm" 
                    : "border-gray-100 bg-white shadow-sm hover:border-[#f5a623]/30"
                )}
              >
                <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", selectedRole === role.id ? "bg-[#f5a623] text-[#1b2b4b]" : "bg-gray-50 text-gray-400")}>
                    <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-[#1b2b4b]">{role.label}</p>
                  <p className="text-[11px] font-bold text-[#8c8b88]">{role.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-black text-[#1b2b4b] uppercase tracking-wider ml-1 mb-4">Permissions</h2>
          <div className="bg-white rounded-[24px] p-2 border border-gray-100 shadow-sm">
            {permissions.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <span className="text-sm font-bold text-[#1b2b4b]">{p.label}</span>
                <div className="h-6 w-11 rounded-full bg-[#f5a623] p-1 flex items-center justify-end">
                    <div className="h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <button 
            className="w-full py-4 rounded-2xl bg-[#1b2b4b] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#2a3f68] transition-all shadow-lg active:scale-95"
            onClick={() => navigate({ to: "/admin/profile" })}
        >
            <ShieldCheck size={18} /> Save Changes
        </button>
      </div>
    </MobileShell>
  );
}