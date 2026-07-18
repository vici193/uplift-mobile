/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send, CheckCircle2, Flag } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { supabase } from "@/supabase";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupport,
});

function getThreadMessages(g: any) {
  const opening = [
    { id: `opening-${g.id}`, message: g.message, sent_by: "driver", created_at: g.created_at },
  ];
  const extra = (g.grievance_messages || [])
    .slice()
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return [...opening, ...extra];
}

function AdminSupport() {
  const navigate = useNavigate();
  const { en } = useSession();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function load() {
    const { data } = await supabase
      .from("grievances")
      .select(
        "*, drivers(full_name, mobile), applications(payout_events(program_name, program_agency)), grievance_messages(id, message, sent_by, created_at)",
      )
      .eq("is_draft", false)
      .order("created_at", { ascending: false });
    setGrievances(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const open = openId ? grievances.find((g) => g.id === openId) : null;

  async function sendReply() {
    if (!open || !reply.trim()) return;
    setSending(true);
    await supabase
      .from("grievance_messages")
      .insert({ grievance_id: open.id, message: reply, sent_by: "admin" });
    await supabase
      .from("grievances")
      .update({ driver_seen_reply: false, status: "replied" })
      .eq("id", open.id);
    setReply("");
    setSending(false);
    showToast(en ? "Reply sent." : "Naipadala ang tugon.");
    load();
  }

  async function markResolved() {
    if (!open) return;
    await supabase.from("grievances").update({ status: "resolved" }).eq("id", open.id);
    showToast(en ? "Marked as resolved." : "Minarkahan bilang lutas na.");
    load();
  }

  // ── Thread view ──
  if (open) {
    const thread = getThreadMessages(open);
    const programName = open.applications?.payout_events?.program_name || (en ? "General Inquiry" : "Pangkalahatang Katanungan");
    return (
      <MobileShell>
        {toast && (
          <div className="fixed left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-[#1b2b4b] px-4 py-2 text-[13px] font-bold text-white shadow-lg">
            {toast}
          </div>
        )}

        <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 bg-white/90 px-6 pb-4 pt-8 backdrop-blur-xl">
          <button
            onClick={() => setOpenId(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-bold text-[#1b2b4b]">
              {open.drivers?.full_name} · {open.drivers?.mobile}
            </h1>
            <p className="truncate text-[12px] text-[#8c8b88]">
              📋 {programName} · {open.concern_type}
            </p>
          </div>
          {open.status !== "resolved" ? (
            <button
              onClick={markResolved}
              className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {en ? "Resolve" : "Lutasin"}
            </button>
          ) : (
            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              {en ? "Resolved" : "Lutas na"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          {thread.map((m: any) => {
            const isDriver = m.sent_by === "driver";
            return (
              <div
                key={m.id}
                className={`flex max-w-[85%] flex-col ${isDriver ? "self-start items-start" : "self-end items-end"}`}
              >
                <div
                  className={`px-4 py-2.5 text-[13px] leading-relaxed ${isDriver ? "rounded-[14px_14px_14px_4px] border border-gray-100 bg-gray-50 text-[#1b2b4b]" : "rounded-[14px_14px_4px_14px] bg-[#1b2b4b] text-white"}`}
                >
                  {m.message}
                </div>
                <p className="mt-1 text-[10px] text-[#8c8b88]">
                  {isDriver ? (en ? "Driver" : "Tsuper") : (en ? "You (Admin)" : "Ikaw (Admin)")} ·{" "}
                  {new Date(m.created_at).toLocaleString("en-PH", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
          {thread.length > 0 && thread[thread.length - 1].sent_by === "driver" && (
            <p className="text-[12px] italic text-[#8c8b88]">{en ? "⏳ Awaiting your response..." : "⏳ Naghihintay ng iyong tugon..."}</p>
          )}
        </div>

        <div className="sticky bottom-0 flex items-end gap-2 border-t border-gray-100 bg-white p-4">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={en ? "Type your reply..." : "Isulat ang iyong tugon..."}
            className="min-h-[44px] flex-1 rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
          />
          <button
            onClick={sendReply}
            disabled={sending || !reply.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1b2b4b] text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </MobileShell>
    );
  }

  // ── List view, grouped by program ──
  const grouped: Record<string, any[]> = {};
  const general: any[] = [];
  grievances.forEach((g) => {
    const name = g.applications?.payout_events?.program_name;
    if (name) {
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(g);
    } else {
      general.push(g);
    }
  });

  const renderRow = (g: any) => {
    const lastAdmin = (g.grievance_messages || []).some((m: any) => m.sent_by === "admin");
    return (
      <button
        key={g.id}
        onClick={() => setOpenId(g.id)}
        className="flex w-full items-start justify-between gap-3 rounded-[20px] border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-[#f5a623]/30 hover:shadow-md"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-[#1b2b4b]">
            {g.drivers?.full_name} · {g.drivers?.mobile}
          </p>
          <p className="text-[11px] font-medium text-gray-500">{g.concern_type}</p>
          <p className="mt-1 truncate text-[12px] text-[#1b2b4b]">{g.message}</p>
          <p className="mt-1 text-[10px] text-gray-400">
            {new Date(g.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {lastAdmin && <span className="text-[10px] font-bold text-emerald-600">✓ {en ? "Replied" : "Tinugunan"}</span>}
          {g.status === "resolved" && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
              {en ? "Resolved" : "Lutas na"}
            </span>
          )}
          {g.is_grievance && (
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-600">
              <Flag className="h-2.5 w-2.5" /> {en ? "Grievance" : "Reklamo"}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <TopBar
        title={en ? "Help Requests" : "Mga Hiling ng Tulong"}
        subtitle={`${grievances.length} ${en ? "total" : "kabuuan"}`}
        onBack={() => navigate({ to: "/admin" })}
      />

      <div className="space-y-6 px-5 pb-24 pt-4">
        {loading ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
            {en ? "Loading..." : "Nagkakarga..."}
          </div>
        ) : grievances.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
            {en ? "No help requests yet." : "Wala pang hiling ng tulong."}
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([name, items]) => (
              <div key={name}>
                <p className="mb-2 px-1 text-[13px] font-bold text-[#1b2b4b]">📋 {name}</p>
                <div className="space-y-3">{items.map(renderRow)}</div>
              </div>
            ))}
            {general.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-[13px] font-bold text-[#1b2b4b]">{en ? "General Inquiries" : "Mga Pangkalahatang Katanungan"}</p>
                <div className="space-y-3">{general.map(renderRow)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}