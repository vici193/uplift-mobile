/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { supabase } from "@/supabase";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplicationEvents,
});

function AdminApplicationEvents() {
  const [q, setQ] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, { pending: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: eventsData } = await supabase
      .from("payout_events")
      .select("*")
      .order("event_date", { ascending: false });
    const { data: appsData } = await supabase.from("applications").select("id, event_id, status");

    const c: Record<string, { pending: number; total: number }> = {};
    (appsData || []).forEach((a: any) => {
      if (!c[a.event_id]) c[a.event_id] = { pending: 0, total: 0 };
      c[a.event_id].total += 1;
      if (a.status === "pending") c[a.event_id].pending += 1;
    });

    setEvents(eventsData || []);
    setCounts(c);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = events.filter((ev) =>
    q ? `${ev.program_name} ${ev.venue}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar title="Applications" subtitle="Select an event to review applicants" />

      <div className="space-y-4 px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-[#f5a623]">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events..."
            className="flex-1 bg-transparent text-sm font-bold text-[#1b2b4b] outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-3 pb-24">
          {loading ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
              No events found.
            </div>
          ) : (
            filtered.map((ev) => {
              const c = counts[ev.id] || { pending: 0, total: 0 };
              return (
                <Link
                  key={ev.id}
                  to="/admin/applications-table"
                  search={{ event: ev.id }}
                  className="group flex items-center gap-4 rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#f5a623]/20 hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-[#1b2b4b]">
                      {ev.program_name}
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5 text-[11px] font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3" /> {ev.event_date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> {ev.venue}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-[#1b2b4b]">
                        {c.total} total
                      </span>
                      {c.pending > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                          {c.pending} pending
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </MobileShell>
  );
}
