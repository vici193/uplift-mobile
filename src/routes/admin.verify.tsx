/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { supabase } from "@/supabase";

export const Route = createFileRoute("/admin/verify")({
  component: AdminVerify,
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

function AdminVerify() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [mode, setMode] = useState<null | "reject">(null);
  const [rejectFields, setRejectFields] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function load() {
    const { data } = await supabase
      .from("drivers")
      .select("*")
      .eq("verification_status", "unverified")
      .order("created_at", { ascending: true });
    setDrivers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function verifyDriver() {
    if (!selected) return;
    setSubmitting(true);
    await supabase
      .from("drivers")
      .update({ verification_status: "verified", verification_notes: notes.trim() || null })
      .eq("id", selected.id);
    setSubmitting(false);
    showToast("Account verified successfully.");
    setSelected(null);
    setNotes("");
    load();
  }

  async function rejectDriver() {
    if (!selected) return;
    if (rejectFields.length === 0) {
      showToast("Please select at least one incorrect field.");
      return;
    }
    setSubmitting(true);
    const fields = rejectFields.join(", ");
    const combined = notes.trim() ? `${fields} — ${notes.trim()}` : fields;
    await supabase
      .from("drivers")
      .update({ verification_status: "rejected", verification_notes: combined })
      .eq("id", selected.id);
    setSubmitting(false);
    showToast("Account rejected.");
    setSelected(null);
    setMode(null);
    setRejectFields([]);
    setNotes("");
    load();
  }

  const documentUrls = selected?.document_urls
    ? selected.document_urls.split(",")
    : selected?.license_url
      ? [selected.license_url]
      : [];

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      {toast && (
        <div className="fixed left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full bg-[#1b2b4b] px-4 py-2 text-[13px] font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100 bg-white/80 p-6 backdrop-blur-md">
        <button
          onClick={() => {
            if (selected) {
              setSelected(null);
              setMode(null);
              setRejectFields([]);
              setNotes("");
            } else {
              navigate({ to: "/admin" });
            }
          }}
          className="-ml-2 rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6 text-[#1b2b4b]" />
        </button>
        <h1 className="text-lg font-extrabold text-[#1b2b4b]">
          {selected ? "Evaluation" : "Verify Accounts"}
        </h1>
      </div>

      <div className="min-h-screen bg-white px-5 pb-24 pt-6">
        {selected ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-300">
            <div className="space-y-4 rounded-3xl border border-[#f5a623]/20 bg-[#fef6e8] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1b2b4b] text-xl font-black text-[#f5a623] shadow-md">
                  {(selected.full_name || "?")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1b2b4b]">{selected.full_name}</h2>
                  <p className="text-[11px] font-bold text-[#1b2b4b]/60">
                    {selected.license_number}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-[#f5a623]/20 pt-4">
                {[
                  ["Last Name", selected.last_name],
                  ["First Name", selected.first_name],
                  ["Middle Name", selected.middle_name],
                  ["Extension Name", selected.extension_name],
                  ["Sex", selected.sex],
                  [
                    "Date of Birth",
                    `${selected.birth_month} ${selected.birth_day}, ${selected.birth_year} (Age: ${selected.age})`,
                  ],
                  ["Region", selected.region],
                  ["Province", selected.province],
                  ["City / Municipality", selected.city],
                  ["Barangay", selected.barangay],
                  ["Mobile", selected.mobile],
                  ["Denomination", selected.denomination],
                  ["Case Number", selected.case_number],
                  ["Operator's Name", selected.operator_name],
                  ["Plate Number", selected.plate_number],
                  ["Chassis Number", selected.chassis_number],
                  ["Driver's License No.", selected.license_number],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2 text-[12px] shadow-sm"
                  >
                    <span className="font-bold text-gray-500">{label}</span>
                    <span className="text-right font-bold text-[#1b2b4b]">{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-[#1b2b4b]">
                <FileText size={16} className="text-[#f5a623]" /> Submitted Documents
              </h3>
              {documentUrls.length === 0 ? (
                <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400">No documents submitted yet.</p>
                </div>
              ) : (
                documentUrls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                    {url.trim().toLowerCase().endsWith(".pdf") ? (
                      <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-xs font-bold text-gray-400 transition-all hover:border-[#f5a623]">
                        <ExternalLink size={14} /> Document {i + 1} (PDF) — tap to view
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={`Document ${i + 1}`}
                        className="w-full rounded-2xl border border-gray-100 object-cover"
                      />
                    )}
                  </a>
                ))
              )}
            </div>

            {mode !== "reject" ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("reject")}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500 py-4 font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-95"
                >
                  <XCircle size={20} /> Reject
                </button>
                <button
                  onClick={verifyDriver}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#1b2b4b] py-4 font-bold text-white transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] active:scale-95 disabled:opacity-60"
                >
                  <CheckCircle2 size={20} /> {submitting ? "..." : "Approve"}
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
                <p className="mb-3 text-[13px] font-bold text-red-600">Flag Discrepancy Reasons</p>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {rejectionOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-[11px] font-medium text-[#1b2b4b]"
                    >
                      <input
                        type="checkbox"
                        checked={rejectFields.includes(opt)}
                        onChange={(e) =>
                          setRejectFields((p) =>
                            e.target.checked ? [...p, opt] : p.filter((f) => f !== opt),
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes visible to the driver (optional)..."
                  className="mb-3 min-h-[70px] w-full rounded-2xl border border-gray-100 bg-white p-3 text-[12px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={rejectDriver}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-red-600 py-3 text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "..." : "Confirm Reject"}
                  </button>
                  <button
                    onClick={() => {
                      setMode(null);
                      setRejectFields([]);
                      setNotes("");
                    }}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-[13px] font-bold text-[#1b2b4b]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[14px] font-extrabold text-[#1b2b4b]">Pending Queue</h2>
              <span className="rounded-full bg-[#f5a623] px-3 py-1 text-[10px] font-black uppercase text-[#1b2b4b]">
                {drivers.length} Active
              </span>
            </div>
            {loading ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
                Loading...
              </div>
            ) : drivers.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 p-10 text-center text-[#8c8b88]">
                No accounts awaiting verification.
              </div>
            ) : (
              drivers.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="group flex w-full items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#f5a623] hover:shadow-md"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 font-bold text-[#1b2b4b] transition-all group-hover:bg-[#f5a623] group-hover:text-white">
                      {(d.full_name || "?")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1b2b4b]">{d.full_name}</p>
                      <p className="text-[11px] font-medium text-gray-500">
                        License: {d.license_number}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-gray-300 transition-colors group-hover:text-[#f5a623]"
                    size={24}
                  />
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
