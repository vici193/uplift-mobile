import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Plus, Clock, CheckCircle2, MessageCircle, X } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";

export const Route = createFileRoute("/concerns")({
  component: ConcernsPage,
});

const concerns = [
  { id: "GR-201", title: "Document rejected without reason", status: "open", time: "2h ago", agency: "LTFRB" },
  { id: "GR-198", title: "Wrong subsidy amount released", status: "in-progress", time: "1 day ago", agency: "DOTr" },
  { id: "PI-042", title: "Profile picture won't update", status: "resolved", time: "3 days ago", agency: "UPLIFT" },
];

const meta = {
  open: { cls: "bg-amber-100 text-amber-700", Icon: AlertTriangle, label: "OPEN" },
  "in-progress": { cls: "bg-blue-100 text-blue-700", Icon: Clock, label: "IN PROGRESS" },
  resolved: { cls: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2, label: "RESOLVED" },
} as const;

function ConcernsPage() {
  const [showForm, setShowForm] = useState(false);
  return (
    <MobileShell>
      <TopBar title="My concerns" subtitle="Grievances & profile issues" />
      <div className="space-y-3 px-5 pt-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-accent py-3.5 text-sm font-bold text-primary shadow-glow transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-4 w-4" /> File new concern
        </button>
        {concerns.map((c) => {
          const m = meta[c.status as keyof typeof meta];
          return (
            <div key={c.id} className="rounded-2xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-primary">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">{c.id} · {c.agency} · {c.time}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${m.cls}`}>
                  <m.Icon className="h-3 w-3" /> {m.label}
                </span>
              </div>
              <button className="mt-3 flex items-center gap-1 text-xs font-bold text-accent hover:underline">
                <MessageCircle className="h-3.5 w-3.5" /> View conversation
              </button>
            </div>
          );
        })}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] rounded-t-3xl bg-white p-5 shadow-glow">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-primary">File a new concern</h3>
                <button onClick={() => setShowForm(false)} className="grid h-8 w-8 place-items-center rounded-full bg-secondary hover:bg-accent-soft"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Subject" className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/20" />
                <select className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none">
                  <option>Grievance</option>
                  <option>Profile issue</option>
                  <option>Bug report</option>
                </select>
                <textarea rows={4} placeholder="Describe your concern…" className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/20" />
                <button onClick={() => setShowForm(false)} className="w-full rounded-2xl bg-gradient-accent py-3.5 text-sm font-bold text-primary shadow-glow">
                  Submit concern
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}