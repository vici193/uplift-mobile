/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { supabase } from "@/supabase";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplications,
});

const tabs = ["Pending", "Approved", "Rejected", "All"] as const;

function AdminApplications() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Pending");
  const [q, setQ] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("applications")
      .select(
        "*, drivers(full_name, license_number), payout_events(program_name, program_agency, venue, event_date, time_start, time_end), application_messages(id, message, created_at)",
      )
      .order("applied_at", { ascending: false });
    setApps(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = apps.filter((a) => {
    if (tab !== "All") {
      const wanted = tab.toLowerCase();
      const matches =
        wanted === "approved"
          ? a.status === "approved" || a.status === "claimed"
          : a.status === wanted;
      if (!matches) return false;
    }
    if (
      q &&
      !`${a.drivers?.full_name} ${a.drivers?.license_number}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    Pending: apps.filter((a) => a.status === "pending").length,
    Approved: apps.filter((a) => a.status === "approved" || a.status === "claimed").length,
    Rejected: apps.filter((a) => a.status === "rejected").length,
    All: apps.length,
  };

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar title="Applications" subtitle={`${apps.length} total`} />

      <div className="space-y-4 px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-[#f5a623]">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search applicants..."
            className="flex-1 bg-transparent text-sm font-bold text-[#1b2b4b] outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${tab === t ? "bg-[#1b2b4b] text-white shadow-lg" : "border border-gray-100 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {t}
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] ${tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-24">
          {loading ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
              No applications found.
            </div>
          ) : (
            filtered.map((a) => {
              const badge =
                a.status === "pending"
                  ? { cls: "bg-amber-50 text-amber-600", Icon: Clock, label: "PENDING" }
                  : a.status === "approved" || a.status === "claimed"
                    ? {
                        cls: "bg-emerald-50 text-emerald-600",
                        Icon: CheckCircle2,
                        label: a.status === "claimed" ? "CLAIMED" : "APPROVED",
                      }
                    : { cls: "bg-red-50 text-red-600", Icon: XCircle, label: "REJECTED" };
              return (
                <Link
                  key={a.id}
                  to="/admin/applications-detail"
                  search={{ id: a.id }}
                  className="group flex items-start gap-4 rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#f5a623]/20 hover:shadow-md"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white shadow-sm">
                    {(a.drivers?.full_name || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold text-[#1b2b4b]">
                        {a.drivers?.full_name}
                      </p>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${badge.cls}`}
                      >
                        <badge.Icon className="h-3 w-3" /> {badge.label}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-medium text-gray-500">
                      {a.payout_events?.program_name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Applied {new Date(a.applied_at).toLocaleDateString()}
                    </p>
                    {a.admin_message && (
                      <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                        ✓ Reply sent
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 self-center text-gray-300" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </MobileShell>
  );
}
