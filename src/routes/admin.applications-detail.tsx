/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2, X, Loader2, MessageSquare } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { supabase } from "@/supabase";
import { useSession } from "@/lib/session-context";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/admin/applications-detail")({
  component: AdminApplicationDetail,
  validateSearch: searchSchema,
});

function AdminApplicationDetail() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { en } = useSession();

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [mode, setMode] = useState<null | "approve" | "reject" | "reply">(null);
  const [approvalMsg, setApprovalMsg] = useState("");
  const [rejectFields, setRejectFields] = useState<string[]>([]);
  const [rejectOther, setRejectOther] = useState(false);
  const [blockReapply, setBlockReapply] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [replyMsg, setReplyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rejectionOptions = en
    ? [
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
      ]
    : [
        "Apelyido",
        "Pangalan",
        "Gitnang Pangalan",
        "Karugtong na Pangalan",
        "Kasarian",
        "Araw ng Kapanganakan",
        "Rehiyon",
        "Lalawigan",
        "Lungsod/Bayan",
        "Barangay",
        "Numero ng Telepono",
        "Uri ng Sasakyan",
        "Numero ng Kaso",
        "Pangalan ng Operator",
        "Numero ng Plaka",
        "Numero ng Tsasis",
        "Numero ng Lisensya sa Pagmamaneho",
      ];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function load() {
    if (!id) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("applications")
      .select("*, drivers(*), payout_events(*), application_messages(id, message, created_at)")
      .eq("id", id)
      .single();
    setApp(data);
    if (data) {
      setApprovalMsg(
        en
          ? `Your application for ${data.payout_events?.program_name} has been approved. Please proceed to ${data.payout_events?.venue} on ${data.payout_events?.event_date} between ${data.payout_events?.time_start} and ${data.payout_events?.time_end}. Bring your Driver's License and your reference code.`
          : `Naaprubahan ang iyong aplikasyon para sa ${data.payout_events?.program_name}. Mangyaring magtungo sa ${data.payout_events?.venue} sa darating na ${data.payout_events?.event_date} sa pagitan ng ${data.payout_events?.time_start} at ${data.payout_events?.time_end}. Dalhin ang iyong Lisensya sa Pagmamaneho at ang iyong kodigong sanggunian.`,
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id, en]);

  async function approveApp() {
    if (!app) return;
    setSubmitting(true);
    const refCode = `REF-${Date.now().toString().slice(-8)}`;
    await supabase
      .from("application_messages")
      .insert({ application_id: app.id, message: approvalMsg, sent_by: "admin" });
    await supabase
      .from("applications")
      .update({
        status: "approved",
        admin_message: approvalMsg,
        driver_seen_latest: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    const { error: apptError } = await supabase.from("appointments").insert({
      application_id: app.id,
      driver_id: app.driver_id,
      event_id: app.event_id,
      reference_code: refCode,
      assigned_date: app.payout_events?.event_date || new Date().toISOString().split("T")[0],
      time_slot: `${app.payout_events?.time_start || "08:00"} – ${app.payout_events?.time_end || "17:00"}`,
      venue: app.payout_events?.venue || "",
      status: "confirmed",
    });
    setSubmitting(false);
    if (apptError) {
      showToast(
        en
          ? `Approved, but appointment failed: ${apptError.message}`
          : `Naaprubahan, ngunit nabigo sa takdang oras: ${apptError.message}`,
      );
    } else {
      showToast(
        en ? "Approved. Appointment created." : "Naaprubahan. Nakagawa na ng takdang oras.",
      );
    }
    setMode(null);
    navigate({ to: "/admin/applications" });
  }

  async function confirmReject() {
    if (!app) return;
    if ((rejectOther || blockReapply) && !rejectNotes.trim()) {
      showToast(
        en
          ? "Please explain why in the notes when using 'Other'."
          : "Mangyaring ipaliwanag kung bakit sa mga tala kapag ginagamit ang 'Iba pa'.",
      );
      return;
    }
    setSubmitting(true);
    const fields = rejectFields.join(", ");
    const otherLabel = rejectOther
      ? en
        ? "Other (does not meet criteria)"
        : "Iba pa (hindi tumutugon sa mga pamantayan)"
      : "";
    const allLabels = [fields, otherLabel].filter(Boolean).join(", ");
    const combined = rejectNotes.trim()
      ? `${allLabels}${allLabels ? " — " : ""}${rejectNotes.trim()}`
      : allLabels;
    await supabase
      .from("applications")
      .update({
        status: "rejected",
        rejection_fields: combined,
        rejection_has_fields: fields.length > 0 && !blockReapply,
        updated_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    setSubmitting(false);
    showToast(en ? "Application rejected." : "Tinanggihan ang aplikasyon.");
    setMode(null);
    navigate({ to: "/admin/applications" });
  }

  async function sendReply() {
    if (!app || !replyMsg.trim()) return;
    setSubmitting(true);
    await supabase
      .from("application_messages")
      .insert({ application_id: app.id, message: replyMsg, sent_by: "admin" });
    await supabase
      .from("applications")
      .update({
        admin_message: replyMsg,
        driver_seen_latest: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    setSubmitting(false);
    showToast(en ? "Reply sent to driver." : "Naipadala ang tugon sa tsuper.");
    setMode(null);
    setReplyMsg("");
    load();
  }

  if (loading) {
    return (
      <MobileShell>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#f5a623]" />
        </div>
      </MobileShell>
    );
  }

  if (!app) {
    return (
      <MobileShell>
        <TopBar
          title={en ? "Application Details" : "Mga Detalye ng Aplikasyon"}
          onBack={() => history.back()}
        />
        <div className="p-6 text-center text-sm text-[#8c8b88]">
          {en ? "Application not found." : "Hindi natagpuan ang aplikasyon."}
        </div>
      </MobileShell>
    );
  }

  const badgeCls =
    app.status === "pending"
      ? "bg-amber-50 text-amber-600"
      : app.status === "approved" || app.status === "claimed"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-red-50 text-red-600";

  return (
    <MobileShell>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-[#1b2b4b] px-4 py-2 text-[13px] font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
      <TopBar
        title={en ? "Application Details" : "Mga Detalye ng Aplikasyon"}
        onBack={() => history.back()}
      />

      <div className="space-y-6 px-6 pb-24 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#f5a623] p-6 text-[#1b2b4b] shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white shadow-md">
              {(app.drivers?.full_name || "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-extrabold">{app.drivers?.full_name}</p>
              <p className="text-[11px] font-medium opacity-80">{app.drivers?.license_number}</p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeCls}`}
              >
                {app.status === "pending"
                  ? en
                    ? "Pending"
                    : "Nakabinbin"
                  : app.status === "approved"
                    ? en
                      ? "Approved"
                      : "Naaprubahan"
                    : app.status === "claimed"
                      ? en
                        ? "Claimed"
                        : "Natanggap"
                      : en
                        ? "Rejected"
                        : "Tinanggihan"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-[#1b2b4b]">{app.payout_events?.program_name}</p>
          <p className="text-[12px] text-[#8c8b88]">
            {app.payout_events?.program_agency} · ₱{app.payout_events?.program_amount}
          </p>
          <p className="mt-1 text-[11px] text-[#8c8b88]">
            {app.payout_events?.venue} · {app.payout_events?.event_date}
          </p>
          <p className="mt-2 text-[11px] text-[#8c8b88]">
            {en ? "Applied" : "Applied"} {new Date(app.applied_at).toLocaleString()}
          </p>
          {app.status === "rejected" && app.rejection_fields && (
            <p className="mt-2 rounded-xl bg-red-50 p-2 text-[11px] text-red-600">
              {en ? "Rejected" : "Tinanggihan"}: {app.rejection_fields}
            </p>
          )}
        </div>

        {app.application_messages?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8c8b88]">
              {en ? "Message History" : "Kasaysayan ng Mensahe"}
            </p>
            {app.application_messages
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
              )
              .map((m: any) => (
                <div key={m.id} className="rounded-2xl bg-gray-50 p-3 text-[12px] text-[#1b2b4b]">
                  {m.message}
                  <p className="mt-1 text-[10px] text-[#8c8b88]">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}

        {app.status === "pending" && (
          <>
            {mode === null && (
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("reject")}
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 py-3 text-[13px] font-bold text-red-600 transition-all hover:border-red-100 hover:bg-red-50 active:scale-95"
                >
                  <X className="mr-1 inline h-4 w-4" /> {en ? "Reject" : "Tanggihan"}
                </button>
                <button
                  onClick={() => setMode("reply")}
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 py-3 text-[13px] font-bold text-[#1b2b4b] transition-all hover:bg-gray-100 active:scale-95"
                >
                  <MessageSquare className="mr-1 inline h-4 w-4" /> {en ? "Reply" : "Tumugon"}
                </button>
                <button
                  onClick={() => setMode("approve")}
                  className="flex-1 rounded-xl bg-[#1b2b4b] py-3 text-[13px] font-bold text-white transition-all hover:bg-[#2a3f68] active:scale-95"
                >
                  <CheckCircle2 className="mr-1 inline h-4 w-4" /> {en ? "Approve" : "Aprubahan"}
                </button>
              </div>
            )}

            {mode === "approve" && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="mb-2 text-[13px] font-bold text-emerald-700">
                  ✅ {en ? "Approval message for driver:" : "Mensahe ng pag-apruba para sa tsuper:"}
                </p>
                <textarea
                  value={approvalMsg}
                  onChange={(e) => setApprovalMsg(e.target.value)}
                  className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={approveApp}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : en ? "Confirm Approval" : "Kumpirmahin ang Pag-apruba"}
                  </button>
                  <button
                    onClick={() => setMode(null)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    {en ? "Cancel" : "Kanselahin"}
                  </button>
                </div>
              </div>
            )}

            {mode === "reply" && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-[13px] font-bold text-[#1b2b4b]">
                  ✉️ {en ? "Send a message to the driver:" : "Magpadala ng mensahe sa tsuper:"}
                </p>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setReplyMsg(
                        en
                          ? `Your application for ${app.payout_events?.program_name} has been received and is now under review. Please expect a result within 3–5 business days.`
                          : `Natanggap na ang iyong aplikasyon para sa ${app.payout_events?.program_name} at kasalukuyang sinusuri. Asahan ang resulta sa loob ng 3-5 araw ng trabaho.`,
                      )
                    }
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#1b2b4b]"
                  >
                    📋 {en ? "Under Review" : "Sinusuri pa"}
                  </button>
                  <button
                    onClick={() =>
                      setReplyMsg(
                        en
                          ? `Your application for ${app.payout_events?.program_name} requires additional information before it can be processed. Please update your details and resubmit.`
                          : `Ang iyong aplikasyon para sa ${app.payout_events?.program_name} ay nangangailangan ng karagdagang impormasyon bago ito maproseso. Mangyaring itama ang iyong mga detalye at magpasang muli.`,
                      )
                    }
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#1b2b4b]"
                  >
                    ⚠️ {en ? "Needs Correction" : "Kailangan ng Pagwawasto"}
                  </button>
                </div>
                <textarea
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  placeholder={
                    en
                      ? "Type your message to the driver..."
                      : "Isulat ang iyong mensahe para sa tsuper..."
                  }
                  className="min-h-[80px] w-full rounded-xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={sendReply}
                    disabled={submitting || !replyMsg.trim()}
                    className="flex-1 rounded-xl bg-[#1b2b4b] py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : en ? "Send Reply" : "Ipadala ang Tugon"}
                  </button>
                  <button
                    onClick={() => setMode(null)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    {en ? "Cancel" : "Kanselahin"}
                  </button>
                </div>
              </div>
            )}

            {mode === "reject" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-[13px] font-bold text-red-600">
                  {en ? "Select incorrect fields:" : "Piliin ang mga maling impormasyon:"}
                </p>
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
                  {en
                    ? "Other (does not meet eligibility criteria — explain in notes)"
                    : "Iba pa (hindi tumutugon sa mga pamantayan — ipaliwanag sa mga tala)"}
                </label>
                {rejectOther && (
                  <label className="mb-2 flex items-center gap-2 rounded-xl bg-red-100 p-2.5 text-[12px] font-bold text-red-700">
                    <input
                      type="checkbox"
                      checked={blockReapply}
                      onChange={(e) => setBlockReapply(e.target.checked)}
                    />
                    {en
                      ? "Do not allow user to reapply for this subsidy"
                      : "Huwag pahintulutan ang tsuper na magpasang muli para sa subsidy na ito"}
                  </label>
                )}
                {blockReapply && (
                  <p className="mb-2 text-[11px] italic text-red-600">
                    ⚠️{" "}
                    {en
                      ? "The driver will NOT be allowed to reapply for this subsidy. Explain why in the notes below."
                      : "HINDI mapapahintulutan ang tsuper na magpasang muli para sa subsidy na ito. Ipaliwanag kung bakit sa mga tala sa ibaba."}
                  </p>
                )}
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder={en ? "Add specific notes..." : "Magdagdag ng mga tiyak na tala..."}
                  className="min-h-[60px] w-full rounded-xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={confirmReject}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : en ? "Confirm Reject" : "Kumpirmahin ang Pagtanggi"}
                  </button>
                  <button
                    onClick={() => {
                      setMode(null);
                      setRejectFields([]);
                      setRejectOther(false);
                      setBlockReapply(false);
                      setRejectNotes("");
                    }}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    {en ? "Cancel" : "Kanselahin"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}
