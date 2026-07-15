/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, QrCode, Search, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { supabase } from "@/supabase";

export const Route = createFileRoute("/admin/claims")({
  component: AdminClaims,
});

function AdminClaims() {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [officerName, setOfficerName] = useState("");
  const [releasing, setReleasing] = useState(false);
  const [toast, setToast] = useState("");
  const [looking, setLooking] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function lookupReferenceCode(rawScan: string) {
    if (!rawScan.trim()) return;
    setLooking(true);
    setLookupError(null);
    setLookupResult(null);
    const parts = rawScan.split("|");
    const refCode = parts.length >= 2 ? parts[1] : rawScan.trim();

    const { data: appt } = await supabase
      .from("appointments")
      .select(
        "*, applications(*, drivers(full_name, license_number, denomination), payout_events(program_name, program_agency, program_amount, venue, event_date))",
      )
      .eq("reference_code", refCode)
      .maybeSingle();

    setLooking(false);

    if (!appt) {
      setLookupError("No matching reference code found.");
      return;
    }
    const app = appt.applications;
    if (app.status === "claimed") {
      setLookupError(`Already released on ${new Date(app.claimed_at).toLocaleString("en-PH")}.`);
      return;
    }
    if (app.status !== "approved") {
      setLookupError("This application is not in approved status.");
      return;
    }
    setLookupResult({ appointment: appt, application: app });
  }

  async function confirmRelease() {
    if (!lookupResult) return;
    if (!officerName.trim()) {
      showToast("Please enter the releasing officer's name.");
      return;
    }
    setReleasing(true);
    const app = lookupResult.application;
    const { error: err } = await supabase
      .from("applications")
      .update({
        status: "claimed",
        claimed_at: new Date().toISOString(),
        claimed_by: officerName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    if (!err) {
      await supabase.from("application_messages").insert({
        application_id: app.id,
        message: "Subsidy successfully claimed at venue.",
        sent_by: "admin",
      });
    }
    setReleasing(false);
    if (err) {
      showToast(`Something went wrong: ${err.message}`);
      return;
    }
    setLookupResult(null);
    setManualCode("");
    setOfficerName("");
    showToast("Subsidy marked as released.");
  }

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-[#1b2b4b] px-4 py-2 text-[13px] font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 bg-white/80 p-6 backdrop-blur-md">
        <button
          onClick={() => navigate({ to: "/admin" })}
          className="-ml-2 rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6 text-[#1b2b4b]" />
        </button>
        <h1 className="text-lg font-extrabold text-[#1b2b4b]">Verify & Release</h1>
      </div>

      <div className="min-h-screen bg-white px-5 pb-24 pt-6">
        <button
          onClick={() => showToast("Camera scanning coming soon.")}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-6 text-sm font-bold text-[#1b2b4b] transition-all hover:border-[#f5a623]"
        >
          <QrCode className="h-5 w-5" /> Scan QR Code
        </button>

        {!lookupResult ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-[#f5a623]">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupReferenceCode(manualCode)}
                placeholder="Enter reference code (e.g. REF-12345678)"
                className="flex-1 bg-transparent text-sm font-bold text-[#1b2b4b] outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={() => lookupReferenceCode(manualCode)}
              disabled={looking || !manualCode.trim()}
              className="w-full rounded-2xl bg-[#f5a623] py-4 font-bold text-[#1b2b4b] transition-all hover:bg-[#ffc107] active:scale-[0.98] disabled:opacity-60"
            >
              {looking ? "..." : "Look Up"}
            </button>
            {lookupError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-[13px] font-semibold text-red-600">
                {lookupError}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-base font-black text-[#1b2b4b]">
              {lookupResult.application.drivers?.full_name}
            </p>
            <p className="text-[13px] text-gray-500">
              {lookupResult.application.drivers?.license_number}
            </p>
            <div className="mt-4 space-y-1 rounded-2xl bg-gray-50 p-4 text-[13px]">
              <p className="font-bold text-[#1b2b4b]">
                {lookupResult.application.payout_events?.program_name} — ₱
                {lookupResult.application.payout_events?.program_amount}
              </p>
              <p className="text-gray-500">
                {lookupResult.appointment.venue}, {lookupResult.appointment.assigned_date}
              </p>
              <p className="text-[11px] font-bold text-[#f5a623]">
                Ref: {lookupResult.appointment.reference_code}
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold uppercase text-[#1b2b4b]">
                Releasing Officer's Name *
              </label>
              <input
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-sm outline-none transition-all focus:border-[#f5a623] focus:bg-white"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={confirmRelease}
                disabled={releasing}
                className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
              >
                {releasing ? "..." : "✅ Confirm & Release Subsidy"}
              </button>
              <button
                onClick={() => {
                  setLookupResult(null);
                  setOfficerName("");
                }}
                className="flex-1 rounded-2xl border-2 border-gray-200 py-3.5 text-sm font-bold text-[#1b2b4b]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
