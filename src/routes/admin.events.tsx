/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Clock,
  Plus,
  ArrowDownToLine,
  Pencil,
  AlertTriangle,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { supabase } from "@/supabase";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

const denominations = [
  "MPUJ",
  "TPUJ",
  "MUVE",
  "TUVE",
  "MPUB",
  "PUB",
  "Mini-Bus",
  "School Transport",
  "Taxi",
];
function newBatchId() {
  return `batch_${Math.random().toString(36).slice(2, 9)}`;
}

const emptyForm = {
  program_name: "",
  program_agency: "DOTr",
  program_amount: "",
  venue: "",
  event_date: "",
  batches: [{ id: newBatchId(), label: "Batch 1", time_start: "", time_end: "" }],
  application_deadline: "",
  description: "",
  qualified_denominations: [] as string[],
  disbursement_mode: "both" as "both" | "cash" | "gcash",
};

function AdminEvents() {
  const [view, setView] = useState<"list" | "create">("list");
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadEvents() {
    const { data } = await supabase
      .from("payout_events")
      .select("*")
      .order("event_date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function set(field: string, val: any) {
    setForm((p) => ({ ...p, [field]: val }));
    setFieldErrors((p) => {
      if (!p[field]) return p;
      const n = { ...p };
      delete n[field];
      return n;
    });
  }

  function toggleDenom(d: string) {
    setForm((p) => ({
      ...p,
      qualified_denominations: p.qualified_denominations.includes(d)
        ? p.qualified_denominations.filter((x) => x !== d)
        : [...p.qualified_denominations, d],
    }));
  }

  function addBatch() {
    setForm((p) => ({
      ...p,
      batches: [
        ...p.batches,
        {
          id: newBatchId(),
          label: `Batch ${p.batches.length + 1}`,
          time_start: "",
          time_end: "",
        },
      ],
    }));
  }

  function removeBatch(id: string) {
    setForm((p) => ({
      ...p,
      batches: p.batches.length > 1 ? p.batches.filter((b) => b.id !== id) : p.batches,
    }));
  }

  function setBatch(id: string, field: "label" | "time_start" | "time_end", val: string) {
    setForm((p) => ({
      ...p,
      batches: p.batches.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    }));
    setFieldErrors((p) => {
      if (!p.batches) return p;
      const n = { ...p };
      delete n.batches;
      return n;
    });
  }

  function handleEdit(ev: any) {
    setEditingEvent(ev);
    setFieldErrors({});
    const parsedBatches =
      Array.isArray(ev.batches) && ev.batches.length > 0
        ? ev.batches
        : [
            {
              id: newBatchId(),
              label: "Batch 1",
              time_start: ev.time_start || "",
              time_end: ev.time_end || "",
            },
          ];
    setForm({
      program_name: ev.program_name || "",
      program_agency: ev.program_agency || "DOTr",
      program_amount: ev.program_amount || "",
      venue: ev.venue || "",
      event_date: ev.event_date || "",
      batches: parsedBatches,
      application_deadline: ev.application_deadline ? ev.application_deadline.slice(0, 16) : "",
      description: ev.description || "",
      qualified_denominations: (ev.qualified_denominations || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      disbursement_mode: ev.disbursement_mode || "both",
    });
    setView("create");
  }

  function handleNew() {
    setEditingEvent(null);
    setForm(emptyForm);
    setFieldErrors({});
    setView("create");
  }

  async function submitEvent(e: any) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.program_name.trim()) errs.program_name = "Required.";
    if (!form.venue.trim()) errs.venue = "Required.";
    if (!form.event_date) errs.event_date = "Required.";
    if (!form.application_deadline) errs.application_deadline = "Required.";
    const incompleteBatch = form.batches.some(
      (b) => !b.label.trim() || !b.time_start || !b.time_end,
    );
    if (form.batches.length === 0 || incompleteBatch) {
      errs.batches = "Every batch needs a label, start time, and end time.";
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const sortedTimes = form.batches.map((b) => b.time_start).sort();
    const sortedEndTimes = form.batches.map((b) => b.time_end).sort();

    setSaving(true);
    const payload = {
      program_name: form.program_name,
      program_agency: form.program_agency,
      program_amount: form.program_amount,
      venue: form.venue,
      event_date: form.event_date,
      batches: form.batches,
      time_start: sortedTimes[0] || "08:00:00",
      time_end: sortedEndTimes[sortedEndTimes.length - 1] || "17:00:00",
      application_deadline: form.application_deadline,
      description: form.description || null,
      qualified_denominations:
        form.qualified_denominations.length > 0 ? form.qualified_denominations.join(", ") : null,
      disbursement_mode: form.disbursement_mode,
    };
    const { error } = editingEvent
      ? await supabase.from("payout_events").update(payload).eq("id", editingEvent.id)
      : await supabase.from("payout_events").insert(payload);
    setSaving(false);
    if (!error) {
      showToast(editingEvent ? "Event updated." : "Event published!");
      setForm(emptyForm);
      setEditingEvent(null);
      setView("list");
      loadEvents();
    } else {
      showToast("Something went wrong.");
    }
  }

  async function downloadExcel(ev: any) {
    const { data } = await supabase
      .from("applications")
      .select(
        "*, drivers(full_name, last_name, first_name, middle_name, mobile, license_number, plate_number, denomination, operator_name, cooperative_name)",
      )
      .eq("event_id", ev.id);
    if (!data || data.length === 0) {
      showToast("No applicants yet.");
      return;
    }
    const headers = [
      "Full Name",
      "Last Name",
      "First Name",
      "Middle Name",
      "Mobile",
      "License No",
      "Plate No",
      "Denomination",
      "Operator",
      "Cooperative",
      "Status",
      "Applied At",
    ];
    const rows = data.map((a: any) => [
      a.drivers?.full_name || "",
      a.drivers?.last_name || "",
      a.drivers?.first_name || "",
      a.drivers?.middle_name || "",
      a.drivers?.mobile || "",
      a.drivers?.license_number || "",
      a.drivers?.plate_number || "",
      a.drivers?.denomination || "",
      a.drivers?.operator_name || "",
      a.drivers?.cooperative_name || "",
      a.status || "",
      new Date(a.applied_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ev.program_name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-[#1b2b4b] px-4 py-2 text-[13px] font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="px-5 pb-24 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => (view === "create" ? setView("list") : window.history.back())}
            className="-ml-2 rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="text-[#1b2b4b]" size={20} />
          </button>
          <h1 className="text-l font-black text-[#1b2b4b]">
            {view === "list" ? "Events" : editingEvent ? "Edit Event" : "Create Event"}
          </h1>
          {view === "list" && (
            <button
              onClick={handleNew}
              className="ml-auto flex items-center gap-2 rounded-full bg-[#f5a623] px-4 py-2 text-sm font-bold text-[#1b2b4b] shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={18} /> New
            </button>
          )}
        </div>

        {view === "create" ? (
          <form
            onSubmit={submitEvent}
            className="animate-in fade-in overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm duration-300"
          >
            <div className="flex items-center gap-3 bg-[#1b2b4b] px-6 py-4">
              <LayoutDashboard className="text-[#f5a623]" size={20} />
              <h2 className="font-bold text-white">Event Details</h2>
            </div>
            <div className="space-y-5 p-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                  Program Name *
                </label>
                <input
                  value={form.program_name}
                  onChange={(e) => set("program_name", e.target.value)}
                  className={`w-full rounded-2xl border p-4 outline-none transition-all focus:border-[#f5a623] focus:bg-white ${fieldErrors.program_name ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                  placeholder="Enter program name"
                />
                {fieldErrors.program_name && (
                  <p className="text-[11px] font-semibold text-red-500">
                    ⚠️ {fieldErrors.program_name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">Amount</label>
                <input
                  value={form.program_amount}
                  onChange={(e) => set("program_amount", e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 outline-none transition-all focus:border-[#f5a623]"
                  placeholder="₱"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">Venue *</label>
                <input
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  className={`w-full rounded-2xl border p-4 outline-none transition-all focus:border-[#f5a623] ${fieldErrors.venue ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                  placeholder="Enter location"
                />
                {fieldErrors.venue && (
                  <p className="text-[11px] font-semibold text-red-500">⚠️ {fieldErrors.venue}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                  Qualified Denominations
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-[#1b2b4b]">
                  {denominations.map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-gray-50 p-2 transition-colors hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        className="accent-[#f5a623]"
                        checked={form.qualified_denominations.includes(item)}
                        onChange={() => toggleDenom(item)}
                      />{" "}
                      {item}
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-[#8c8b88]">
                  Leave all unchecked to allow any denomination to apply.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                    Payout Date *
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={form.event_date}
                    onChange={(e) => set("event_date", e.target.value)}
                    className={`w-full rounded-2xl border p-4 outline-none transition-all focus:border-[#f5a623] ${fieldErrors.event_date ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                  />
                  {fieldErrors.event_date && (
                    <p className="text-[11px] font-semibold text-red-500">
                      ⚠️ {fieldErrors.event_date}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.application_deadline}
                    onChange={(e) => set("application_deadline", e.target.value)}
                    className={`w-full rounded-2xl border p-4 outline-none transition-all focus:border-[#f5a623] ${fieldErrors.application_deadline ? "border-red-400 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                  />
                  {fieldErrors.application_deadline && (
                    <p className="text-[11px] font-semibold text-red-500">
                      ⚠️ {fieldErrors.application_deadline}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                    Batches *
                  </label>
                  <button
                    type="button"
                    onClick={addBatch}
                    className="flex items-center gap-1 rounded-full bg-[#1b2b4b] px-3 py-1 text-[10px] font-bold text-white transition-all hover:bg-[#2a3f68] active:scale-95"
                  >
                    <Plus size={12} /> Add Batch
                  </button>
                </div>
                <p className="text-[10px] text-[#8c8b88]">
                  Split the payout day into batches so drivers know exactly when to show up (e.g.
                  Batch 1: 7:00–11:30 AM).
                </p>
                <div className="space-y-2">
                  {form.batches.map((b, i) => (
                    <div key={b.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          value={b.label}
                          onChange={(e) => setBatch(b.id, "label", e.target.value)}
                          placeholder={`Batch ${i + 1}`}
                          className="flex-1 rounded-xl border border-gray-100 bg-white p-2.5 text-[12px] font-bold text-[#1b2b4b] outline-none focus:border-[#f5a623]"
                        />
                        {form.batches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBatch(b.id)}
                            className="shrink-0 rounded-xl bg-red-50 px-2.5 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          value={b.time_start}
                          onChange={(e) => setBatch(b.id, "time_start", e.target.value)}
                          className="w-full rounded-xl border border-gray-100 bg-white p-2.5 text-[12px] outline-none focus:border-[#f5a623]"
                        />
                        <input
                          type="time"
                          value={b.time_end}
                          onChange={(e) => setBatch(b.id, "time_end", e.target.value)}
                          className="w-full rounded-xl border border-gray-100 bg-white p-2.5 text-[12px] outline-none focus:border-[#f5a623]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {fieldErrors.batches && (
                  <p className="text-[11px] font-semibold text-red-500">⚠️ {fieldErrors.batches}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                  Disbursement Method
                </label>
                <p className="text-[10px] text-[#8c8b88]">
                  Choose what payout options drivers see when applying. If you restrict this to Cash
                  Only or GCash Only, drivers won't be asked to choose — it's set for them
                  automatically.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "both", label: "Cash & GCash" },
                      { value: "cash", label: "Cash Only" },
                      { value: "gcash", label: "GCash Only" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("disbursement_mode", opt.value)}
                      className={`rounded-2xl border p-3 text-[12px] font-bold transition-all ${
                        form.disbursement_mode === opt.value
                          ? "border-[#f5a623] bg-[#f5a623]/10 text-[#1b2b4b]"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#1b2b4b]">
                  Instructions
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="h-24 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 outline-none transition-all focus:border-[#f5a623]"
                  placeholder="Bring original Driver's License..."
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-[#f5a623] py-4 font-bold text-[#1b2b4b] transition-all hover:bg-[#ffc107] active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "..." : editingEvent ? "Save Changes" : "Publish Event"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
                Loading...
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
                No events yet.
              </div>
            ) : (
              events.map((ev) => {
                const isPastDeadline =
                  ev.application_deadline && new Date(ev.application_deadline) < new Date();
                return (
                  <div
                    key={ev.id}
                    className="group space-y-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#1b2b4b] hover:bg-[#1b2b4b] hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-black text-[#1b2b4b] transition-colors group-hover:text-white">
                          {ev.program_name}
                        </h3>
                        <p className="text-xs font-bold text-[#f5a623]">
                          {ev.program_agency} · ₱{ev.program_amount}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => downloadExcel(ev)}
                          className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-[#1b2b4b] transition-all group-hover:bg-[#1b2b4b]/20 group-hover:text-white"
                        >
                          <ArrowDownToLine size={12} /> Export
                        </button>
                        <button
                          onClick={() => handleEdit(ev)}
                          className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-[#1b2b4b] transition-all group-hover:bg-[#f5a623] group-hover:text-[#1b2b4b]"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] font-medium text-gray-500 transition-colors group-hover:text-white/70">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#f5a623]" /> {ev.event_date}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#f5a623]" /> {ev.venue}
                      </div>
                      {Array.isArray(ev.batches) && ev.batches.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <Clock size={14} className="shrink-0 text-[#f5a623]" />
                          {ev.batches.map((b: any) => (
                            <span
                              key={b.id}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-[#1b2b4b] transition-colors group-hover:bg-white/10 group-hover:text-white"
                            >
                              {b.label}: {b.time_start}–{b.time_end}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-[#f5a623]" /> {ev.time_start} –{" "}
                          {ev.time_end}
                        </div>
                      )}
                    </div>
                    {ev.description && (
                      <p className="text-[11px] italic text-gray-400 transition-colors group-hover:text-white/60">
                        📋 {ev.description}
                      </p>
                    )}
                    {ev.application_deadline && (
                      <div
                        className={`flex items-center gap-2 rounded-2xl p-3 text-[11px] font-bold ${isPastDeadline ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}
                      >
                        <AlertTriangle size={14} /> Deadline:{" "}
                        {new Date(ev.application_deadline).toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
