/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, X, Loader2, MessageSquare } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { supabase } from "@/supabase";

const searchSchema = z.object({ event: z.string().optional() });

export const Route = createFileRoute("/admin/applications-table")({
  component: AdminApplicationsTable,
  validateSearch: searchSchema,
});

const rejectionOptions = [
  "Last Name",
  "First Name",
  "Middle Name",
  "Extension Name",
  "Sex",
  "Date of Birth",
  "Region",
  "Province",
  "City/Municipality",
  "Barangay",
  "Mobile Number",
  "Denomination",
  "Case Number",
  "Operator's Name",
  "Plate Number",
  "Chassis Number",
  "Driver's License No.",
];

// Every column pulled straight from the driver's application form (see apply-detail.tsx),
// so what the admin sees here matches exactly what the driver submitted.
const columns: { key: string; label: string; get: (a: any) => string }[] = [
  { key: "last_name", label: "Last Name", get: (a) => a.drivers?.last_name || "" },
  { key: "first_name", label: "First Name", get: (a) => a.drivers?.first_name || "" },
  { key: "middle_name", label: "Middle Name", get: (a) => a.drivers?.middle_name || "N/A" },
  {
    key: "extension_name",
    label: "Extension Name",
    get: (a) => a.drivers?.extension_name || "N/A",
  },
  { key: "sex", label: "Sex", get: (a) => a.drivers?.sex || "" },
  {
    key: "birthdate",
    label: "Date of Birth",
    get: (a) =>
      a.drivers?.birth_month && a.drivers?.birth_day && a.drivers?.birth_year
        ? `${a.drivers.birth_month} ${a.drivers.birth_day}, ${a.drivers.birth_year}`
        : "",
  },
  { key: "age", label: "Age", get: (a) => a.drivers?.age || "" },
  { key: "region", label: "Region", get: (a) => a.drivers?.region || "" },
  { key: "province", label: "Province", get: (a) => a.drivers?.province || "" },
  { key: "city", label: "City/Municipality", get: (a) => a.drivers?.city || "" },
  { key: "barangay", label: "Barangay", get: (a) => a.drivers?.barangay || "" },
  { key: "mobile", label: "Mobile", get: (a) => a.drivers?.mobile || "" },
  { key: "denomination", label: "Denomination", get: (a) => a.drivers?.denomination || "" },
  { key: "case_number", label: "Case No.", get: (a) => a.drivers?.case_number || "" },
  { key: "operator_name", label: "Operator", get: (a) => a.drivers?.operator_name || "" },
  {
    key: "cooperative_name",
    label: "Cooperative",
    get: (a) => a.drivers?.cooperative_name || "",
  },
  { key: "plate_number", label: "Plate No.", get: (a) => a.drivers?.plate_number || "" },
  { key: "chassis_number", label: "Chassis No.", get: (a) => a.drivers?.chassis_number || "" },
  { key: "license_number", label: "License No.", get: (a) => a.drivers?.license_number || "" },
  {
    key: "ewallet_type",
    label: "Disbursement",
    get: (a) => a.ewallet_type || "",
  },
  {
    key: "ewallet_number",
    label: "GCash No.",
    get: (a) => (a.ewallet_type === "GCash" ? a.ewallet_number || "" : "\u2014"),
  },
];

function AdminApplicationsTable() {
  const { event: eventId } = Route.useSearch();

  const [ev, setEv] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [batchSelect, setBatchSelect] = useState<Record<string, string>>({});
  const [activeRow, setActiveRow] = useState<any | null>(null);
  const [mode, setMode] = useState<null | "approve" | "reject" | "reply">(null);
  const [approvalMsg, setApprovalMsg] = useState("");
  const [rejectFields, setRejectFields] = useState<string[]>([]);
  const [rejectOther, setRejectOther] = useState(false);
  const [blockReapply, setBlockReapply] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [replyMsg, setReplyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const batches: any[] = Array.isArray(ev?.batches) ? ev.batches : [];

  async function load() {
    if (!eventId) {
      setLoading(false);
      return;
    }
    const [{ data: eventData }, { data: appsData }] = await Promise.all([
      supabase.from("payout_events").select("*").eq("id", eventId).single(),
      supabase
        .from("applications")
        .select("*, drivers(*), application_messages(id, message, created_at)")
        .eq("event_id", eventId)
        .order("applied_at", { ascending: false }),
    ]);
    setEv(eventData);
    setApps(appsData || []);
    setBatchSelect((prev) => {
      const next = { ...prev };
      (appsData || []).forEach((a: any) => {
        if (a.batch_id && !next[a.id]) next[a.id] = a.batch_id;
      });
      return next;
    });
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  function openApprove(app: any) {
    const batchId = batchSelect[app.id];
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) {
      showToast("Select a batch for this driver first.");
      return;
    }
    setActiveRow(app);
    setApprovalMsg(
      `Your application for ${ev?.program_name} has been approved. You are assigned to ${batch.label} (${batch.time_start}\u2013${batch.time_end}). Please proceed to ${ev?.venue} on ${ev?.event_date} and bring your Driver's License and reference code.`,
    );
    setMode("approve");
  }

  function openReject(app: any) {
    setActiveRow(app);
    setRejectFields([]);
    setRejectOther(false);
    setBlockReapply(false);
    setRejectNotes("");
    setMode("reject");
  }

  function openReply(app: any) {
    setActiveRow(app);
    setReplyMsg("");
    setMode("reply");
  }

  function closeModal() {
    setActiveRow(null);
    setMode(null);
  }

  async function confirmApprove() {
    if (!activeRow) return;
    const batchId = batchSelect[activeRow.id];
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) {
      showToast("Select a batch first.");
      return;
    }
    setSubmitting(true);
    const refCode = `REF-${Date.now().toString().slice(-8)}`;
    await supabase
      .from("application_messages")
      .insert({ application_id: activeRow.id, message: approvalMsg, sent_by: "admin" });
    await supabase
      .from("applications")
      .update({
        status: "approved",
        admin_message: approvalMsg,
        batch_id: batch.id,
        batch_label: batch.label,
        batch_time_start: batch.time_start,
        batch_time_end: batch.time_end,
        driver_seen_latest: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeRow.id);
    const { error: apptError } = await supabase.from("appointments").insert({
      application_id: activeRow.id,
      driver_id: activeRow.driver_id,
      event_id: activeRow.event_id,
      reference_code: refCode,
      assigned_date: ev?.event_date || new Date().toISOString().split("T")[0],
      time_slot: `${batch.label}: ${batch.time_start}\u2013${batch.time_end}`,
      venue: ev?.venue || "",
      status: "confirmed",
    });
    setSubmitting(false);
    showToast(apptError ? `Approved, but appointment failed: ${apptError.message}` : "Approved.");
    closeModal();
    load();
  }

  async function confirmReject() {
    if (!activeRow) return;
    if ((rejectOther || blockReapply) && !rejectNotes.trim()) {
      showToast('Please explain why in the notes when using "Other".');
      return;
    }
    setSubmitting(true);
    const fields = rejectFields.join(", ");
    const otherLabel = rejectOther ? "Other (does not meet criteria)" : "";
    const allLabels = [fields, otherLabel].filter(Boolean).join(", ");
    const combined = rejectNotes.trim()
      ? `${allLabels}${allLabels ? " \u2014 " : ""}${rejectNotes.trim()}`
      : allLabels;
    await supabase
      .from("applications")
      .update({
        status: "rejected",
        rejection_fields: combined,
        rejection_has_fields: fields.length > 0 && !blockReapply,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeRow.id);
    setSubmitting(false);
    showToast("Application rejected.");
    closeModal();
    load();
  }

  async function sendReply() {
    if (!activeRow || !replyMsg.trim()) return;
    setSubmitting(true);
    await supabase
      .from("application_messages")
      .insert({ application_id: activeRow.id, message: replyMsg, sent_by: "admin" });
    await supabase
      .from("applications")
      .update({
        admin_message: replyMsg,
        driver_seen_latest: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeRow.id);
    setSubmitting(false);
    showToast("Reply sent to driver.");
    closeModal();
    load();
  }

  const pendingCount = useMemo(() => apps.filter((a) => a.status === "pending").length, [apps]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary to-background">
        <Loader2 className="h-6 w-6 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
        <TopBar title="Applicants" onBack={() => history.back()} />
        <div className="p-6 text-center text-sm text-[#8c8b88]">Event not found.</div>
      </div>
    );
  }

  return (
    // Deliberately NOT using MobileShell here — this view is designed to be worked
    // on desktop by DOTr admin staff (spreadsheet-style, many columns), but the
    // overflow-x-auto wrapper below still keeps it fully usable on a phone by
    // letting the table scroll horizontally instead of squeezing into a 440px frame.
    <div className="min-h-screen w-full bg-gradient-to-b from-secondary to-background">
      {toast && (
        <div className="fixed left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-[#1b2b4b] px-4 py-2 text-[13px] font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
      <div className="mx-auto w-full max-w-[1800px]">
        <TopBar
          title={ev.program_name}
          subtitle={`${apps.length} applicants \u00b7 ${pendingCount} pending`}
          onBack={() => history.back()}
        />

        <div className="px-3 pb-16 pt-4 md:px-6">
          {apps.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center text-[#8c8b88]">
              No applicants yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-[#8c8b88]">
                    <th className="sticky left-0 z-10 bg-gray-50 p-3 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                      Full Name
                    </th>
                    {columns.map((c) => (
                      <th key={c.key} className="whitespace-nowrap p-3">
                        {c.label}
                      </th>
                    ))}
                    <th className="whitespace-nowrap p-3">Status</th>
                    <th className="whitespace-nowrap p-3">Applied At</th>
                    <th className="whitespace-nowrap p-3">Batch</th>
                    <th className="whitespace-nowrap p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => {
                    const badgeCls =
                      a.status === "pending"
                        ? "bg-amber-50 text-amber-600"
                        : a.status === "approved" || a.status === "claimed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600";
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                      >
                        <td className="sticky left-0 z-10 whitespace-nowrap bg-white p-3 font-bold text-[#1b2b4b] shadow-[1px_0_0_0_rgba(0,0,0,0.06)]">
                          {a.drivers?.full_name}
                        </td>
                        {columns.map((c) => (
                          <td key={c.key} className="whitespace-nowrap p-3 text-gray-600">
                            {c.get(a)}
                          </td>
                        ))}
                        <td className="whitespace-nowrap p-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${badgeCls}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap p-3 text-gray-500">
                          {new Date(a.applied_at).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap p-3">
                          {a.status === "pending" ? (
                            <select
                              value={batchSelect[a.id] || ""}
                              onChange={(e) =>
                                setBatchSelect((prev) => ({ ...prev, [a.id]: e.target.value }))
                              }
                              className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-[11px] font-semibold text-[#1b2b4b] outline-none focus:border-[#f5a623]"
                            >
                              <option value="">Select batch...</option>
                              {batches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.label} ({b.time_start}–{b.time_end})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#1b2b4b]">
                              {a.batch_label
                                ? `${a.batch_label} (${a.batch_time_start}\u2013${a.batch_time_end})`
                                : "\u2014"}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap p-3">
                          {a.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openReject(a)}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] font-bold text-red-600 hover:border-red-200 hover:bg-red-50"
                              >
                                <X size={15} /> Reject
                              </button>
                              <button
                                onClick={() => openReply(a)}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] font-bold text-[#1b2b4b] hover:bg-gray-100"
                              >
                                <MessageSquare size={15} /> Reply
                              </button>
                              <button
                                onClick={() => openApprove(a)}
                                className="flex items-center gap-1.5 rounded-lg bg-[#1b2b4b] px-3 py-2 text-[12px] font-bold text-white hover:bg-[#2a3f68]"
                              >
                                <CheckCircle2 size={15} /> Approve
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openReply(a)}
                              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] font-bold text-[#1b2b4b] hover:bg-gray-100"
                            >
                              <MessageSquare size={15} /> Reply
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {activeRow && mode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#1b2b4b]">{activeRow.drivers?.full_name}</p>
              <button
                onClick={closeModal}
                className="grid h-8 w-8 place-items-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {mode === "approve" && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="mb-2 text-[13px] font-bold text-emerald-700">
                  ✅ Approval message for driver:
                </p>
                <textarea
                  value={approvalMsg}
                  onChange={(e) => setApprovalMsg(e.target.value)}
                  className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={confirmApprove}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : "Confirm Approval"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mode === "reply" && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-[13px] font-bold text-[#1b2b4b]">
                  ✉️ Send a message to the driver:
                </p>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setReplyMsg(
                        `Your application for ${ev.program_name} has been received and is now under review. Please expect a result within 3\u20135 business days.`,
                      )
                    }
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#1b2b4b]"
                  >
                    📋 Under Review
                  </button>
                  <button
                    onClick={() =>
                      setReplyMsg(
                        `Your application for ${ev.program_name} requires additional information before it can be processed. Please update your details and resubmit.`,
                      )
                    }
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#1b2b4b]"
                  >
                    ⚠️ Needs Correction
                  </button>
                </div>
                <textarea
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  placeholder="Type your message to the driver..."
                  className="min-h-[80px] w-full rounded-xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={sendReply}
                    disabled={submitting || !replyMsg.trim()}
                    className="flex-1 rounded-xl bg-[#1b2b4b] py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : "Send Reply"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mode === "reject" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-[13px] font-bold text-red-600">Select incorrect fields:</p>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {rejectionOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-[11px] text-[#1b2b4b]">
                      <input
                        type="checkbox"
                        checked={rejectFields.includes(opt)}
                        onChange={(e) =>
                          setRejectFields((prev) =>
                            e.target.checked ? [...prev, opt] : prev.filter((f) => f !== opt),
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                <label className="mb-2 flex items-center gap-2 border-t border-red-200 pt-2 text-[12px] font-bold text-[#1b2b4b]">
                  <input
                    type="checkbox"
                    checked={rejectOther}
                    onChange={(e) => {
                      setRejectOther(e.target.checked);
                      if (!e.target.checked) setBlockReapply(false);
                    }}
                  />
                  Other (does not meet eligibility criteria — explain in notes)
                </label>
                {rejectOther && (
                  <label className="mb-2 flex items-center gap-2 rounded-xl bg-red-100 p-2.5 text-[12px] font-bold text-red-700">
                    <input
                      type="checkbox"
                      checked={blockReapply}
                      onChange={(e) => setBlockReapply(e.target.checked)}
                    />
                    Do not allow user to reapply for this subsidy
                  </label>
                )}
                {blockReapply && (
                  <p className="mb-2 text-[11px] italic text-red-600">
                    ⚠️ The driver will NOT be allowed to reapply for this subsidy. Explain why in
                    the notes below.
                  </p>
                )}
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Add specific notes..."
                  className="min-h-[60px] w-full rounded-xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={confirmReject}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : "Confirm Reject"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
