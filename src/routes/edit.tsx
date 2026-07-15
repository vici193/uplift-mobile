/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Save, ArrowLeft, HelpCircle } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";
import { PH_REGIONS, PH_PROVINCES_BY_REGION, PH_CITIES_BY_PROVINCE } from "@/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/edit")({
  component: EditProfilePage,
});

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
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

const getTutSteps = (en: boolean) => [
  {
    title: en ? "Personal Details" : "Personal na Impormasyon",
    desc: en
      ? "Ensure your Personal Information matches your Driver's License exactly."
      : "Siguraduhing eksaktong tugma ang Personal na Impormasyon sa iyong Driver's License.",
    target: "tut-personal",
  },
  {
    title: en ? "Address" : "Tirahan",
    desc: en ? "Keep your Address up to date." : "Panatilihing updated ang iyong Tirahan.",
    target: "tut-address",
  },
  {
    title: en ? "Vehicle & Franchise" : "Sasakyan at Pransisa",
    desc: en
      ? "Verify your Vehicle and Franchise details."
      : "I-verify ang detalye ng Sasakyan at Pransisa.",
    target: "tut-vehicle",
  },
  {
    title: en ? "Save Changes" : "I-save",
    desc: en
      ? "Review everything once more, then click Save Changes."
      : "Suriin muli ang lahat, pagkatapos ay i-click ang I-save.",
    target: "tut-save",
  },
];

const inputCls =
  "w-full rounded-2xl border border-gray-100 bg-white p-4 text-sm font-bold text-[#1b2b4b] shadow-sm outline-none transition-all focus:border-[#f5a623]";
const selectCls = inputCls;

function EditProfilePage() {
  const navigate = useNavigate();
  const { en, driver, driverId, loadDriverData } = useSession();
  const [tutStep, setTutStep] = useState(0);
  const steps = getTutSteps(en);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noMiddle, setNoMiddle] = useState(driver?.middle_name === "N/A");
  const [form, setForm] = useState({
    last_name: driver?.last_name || "",
    first_name: driver?.first_name || "",
    middle_name: driver?.middle_name === "N/A" ? "" : driver?.middle_name || "",
    extension_name: driver?.extension_name === "N/A" ? "" : driver?.extension_name || "",
    region: driver?.region || "",
    province: driver?.province || "",
    city: driver?.city || "",
    barangay: driver?.barangay || "",
    birth_month: driver?.birth_month || "",
    birth_day: driver?.birth_day || "",
    birth_year: driver?.birth_year || "",
    sex: driver?.sex || "",
    denomination: driver?.denomination || "",
    case_number: driver?.case_number || "",
    operator_name: driver?.operator_name || "",
    cooperative_name: driver?.cooperative_name || "",
    plate_number: driver?.plate_number || "",
    chassis_number: driver?.chassis_number || "",
    license_number: driver?.license_number || "",
  });

  function set(field: string, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  // Smooth scroll to the currently highlighted target element
  useEffect(() => {
    if (tutStep > 0) {
      const target = steps[tutStep - 1]?.target;
      const el = document.getElementById(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - window.innerHeight * 0.18,
          behavior: "smooth",
        });
      }
    }
  }, [tutStep, en]);

  const isHighlighted = (target: string) => tutStep > 0 && steps[tutStep - 1]?.target === target;

  const renderTutorialCard = (targetId: string, positionClasses: string) => {
    if (tutStep === 0 || steps[tutStep - 1]?.target !== targetId) return null;
    const stepData = steps[tutStep - 1];

    return (
      <div
        className={`absolute z-[300] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl ${positionClasses}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
            {tutStep}/{steps.length}
          </div>
          <h3 className="text-lg font-bold text-white">{stepData.title}</h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{stepData.desc}</p>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setTutStep(0);
            }}
            className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            {en ? "Skip" : "Laktawan"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (tutStep < steps.length) setTutStep((s) => s + 1);
              else setTutStep(0);
            }}
            className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
          >
            {tutStep === steps.length ? (en ? "Finish" : "Tapusin") : en ? "Next" : "Susunod"}
          </button>
        </div>
      </div>
    );
  };

  async function handleSave() {
    setLoading(true);
    setError("");
    const full_name = [
      form.first_name,
      noMiddle ? "" : form.middle_name,
      form.last_name,
      !form.extension_name || form.extension_name === "N/A" ? "" : form.extension_name,
    ]
      .filter(Boolean)
      .join(" ");
    const wasRejected = driver?.verification_status === "rejected";
    const { error: err } = await supabase
      .from("drivers")
      .update({
        full_name,
        last_name: form.last_name,
        first_name: form.first_name,
        middle_name: noMiddle ? "N/A" : form.middle_name,
        extension_name: form.extension_name || "N/A",
        region: form.region,
        province: form.province,
        city: form.city,
        barangay: form.barangay,
        birth_month: form.birth_month,
        birth_day: form.birth_day,
        birth_year: form.birth_year,
        sex: form.sex,
        denomination: form.denomination,
        case_number: form.case_number,
        operator_name: form.operator_name,
        cooperative_name: form.cooperative_name,
        plate_number: form.plate_number,
        chassis_number: form.chassis_number,
        license_number: form.license_number,
        ...(wasRejected ? { verification_status: "unverified", verification_notes: null } : {}),
      })
      .eq("id", driverId);
    setLoading(false);
    if (err) {
      setError(en ? "Something went wrong." : "May nangyaring mali.");
      return;
    }
    await loadDriverData(driverId);
    navigate({ to: "/home" });
  }

  return (
    <MobileShell>
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 bg-white p-6">
        <button onClick={() => history.back()} className="-ml-2 rounded-full p-2 hover:bg-gray-100">
          <ArrowLeft className="h-6 w-6 text-[#1b2b4b]" />
        </button>
        <h1 className="flex-1 text-lg font-extrabold text-[#1b2b4b]">
          {en ? "Edit Information" : "I-edit ang Impormasyon"}
        </h1>
        <button
          onClick={() => setTutStep(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5a623]/10 text-[#f5a623]"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

      <div className="space-y-8 px-6 pb-8 pt-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section
          id="tut-personal"
          className={cn(
            "space-y-4 pt-4 relative transition-all",
            isHighlighted("tut-personal")
              ? "z-[250] rounded-3xl bg-[#1b2b4b] p-4 ring-4 ring-[#f5a623]"
              : "",
          )}
        >
          <h3
            className={`ml-1 text-[11px] font-extrabold uppercase tracking-wider ${isHighlighted("tut-personal") ? "text-white" : "text-[#8c8b88]"}`}
          >
            {en ? "Personal Details" : "Personal na Impormasyon"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputCls}
              placeholder={en ? "First Name" : "Pangalan"}
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder={en ? "Middle Name" : "Gitnang Pangalan"}
              value={noMiddle ? "" : form.middle_name}
              disabled={noMiddle}
              onChange={(e) => set("middle_name", e.target.value)}
            />
          </div>
          <label
            className={`ml-1 flex items-center gap-2 text-xs ${isHighlighted("tut-personal") ? "text-white/80" : "text-[#8c8b88]"}`}
          >
            <input
              type="checkbox"
              checked={noMiddle}
              onChange={(e) => setNoMiddle(e.target.checked)}
            />
            {en ? "I have no middle name" : "Wala akong gitnang pangalan"}
          </label>
          <input
            className={inputCls}
            placeholder={en ? "Last Name" : "Apelyido"}
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder={en ? "Extension Name (Jr, Sr, III)" : "Extension Name"}
            value={form.extension_name}
            onChange={(e) => set("extension_name", e.target.value)}
          />
          <select
            className={selectCls}
            value={form.sex}
            onChange={(e) => set("sex", e.target.value)}
          >
            <option value="">{en ? "Sex..." : "Kasarian..."}</option>
            <option>Male</option>
            <option>Female</option>
            <option>Others</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <select
              className={selectCls}
              value={form.birth_month}
              onChange={(e) => set("birth_month", e.target.value)}
            >
              <option value="">{en ? "Month" : "Buwan"}</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <select
              className={selectCls}
              value={form.birth_day}
              onChange={(e) => set("birth_day", e.target.value)}
            >
              <option value="">{en ? "Day" : "Araw"}</option>
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <input
            className={inputCls}
            placeholder={en ? "Birth Year (YYYY)" : "Taon ng Kapanganakan"}
            value={form.birth_year}
            maxLength={4}
            onChange={(e) => set("birth_year", e.target.value)}
          />
          {renderTutorialCard(
            "tut-personal",
            "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
          )}
        </section>

        <section
          id="tut-address"
          className={cn(
            "space-y-4 border-t border-gray-100 pt-4 relative transition-all",
            isHighlighted("tut-address")
              ? "z-[250] border-none rounded-3xl bg-[#1b2b4b] p-4 ring-4 ring-[#f5a623]"
              : "",
          )}
        >
          <h3
            className={`ml-1 text-[11px] font-extrabold uppercase tracking-wider ${isHighlighted("tut-address") ? "text-white" : "text-[#8c8b88]"}`}
          >
            {en ? "Address" : "Tirahan"}
          </h3>
          <select
            className={selectCls}
            value={form.region}
            onChange={(e) => {
              set("region", e.target.value);
              set("province", "");
              set("city", "");
            }}
          >
            <option value="">Region...</option>
            {PH_REGIONS.map((r: string) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            className={selectCls}
            value={form.province}
            disabled={!form.region}
            onChange={(e) => {
              set("province", e.target.value);
              set("city", "");
            }}
          >
            <option value="">Province...</option>
            {(form.region ? (PH_PROVINCES_BY_REGION as any)[form.region] || [] : []).map(
              (p: string) => (
                <option key={p}>{p}</option>
              ),
            )}
          </select>
          <select
            className={selectCls}
            value={form.city}
            disabled={!form.province}
            onChange={(e) => set("city", e.target.value)}
          >
            <option value="">{en ? "City / Municipality..." : "Lungsod / Munisipyo..."}</option>
            {(form.province ? (PH_CITIES_BY_PROVINCE as any)[form.province] || [] : []).map(
              (c: string) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
          <input
            className={inputCls}
            placeholder="Barangay"
            value={form.barangay}
            onChange={(e) => set("barangay", e.target.value)}
          />
          {renderTutorialCard(
            "tut-address",
            "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
          )}
        </section>

        <section
          id="tut-vehicle"
          className={cn(
            "space-y-4 border-t border-gray-100 pt-4 relative transition-all",
            isHighlighted("tut-vehicle")
              ? "z-[250] border-none rounded-3xl bg-[#1b2b4b] p-4 ring-4 ring-[#f5a623]"
              : "",
          )}
        >
          <h3
            className={`ml-1 text-[11px] font-extrabold uppercase tracking-wider ${isHighlighted("tut-vehicle") ? "text-white" : "text-[#8c8b88]"}`}
          >
            {en ? "Vehicle and Franchise" : "Sasakyan at Pransisa"}
          </h3>
          <select
            className={selectCls}
            value={form.denomination}
            onChange={(e) => set("denomination", e.target.value)}
          >
            <option value="">{en ? "Denomination..." : "Uri ng Sasakyan..."}</option>
            {denominations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Case Number"
            value={form.case_number}
            onChange={(e) => set("case_number", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Operator's Name"
            value={form.operator_name}
            onChange={(e) => set("operator_name", e.target.value)}
          />
          <input
            className={inputCls}
            placeholder={en ? "Cooperative Name" : "Pangalan ng Kooperatiba"}
            value={form.cooperative_name}
            onChange={(e) => set("cooperative_name", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputCls}
              placeholder="Plate No."
              value={form.plate_number}
              onChange={(e) => set("plate_number", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Chassis No."
              value={form.chassis_number}
              onChange={(e) => set("chassis_number", e.target.value)}
            />
          </div>
          <input
            className={inputCls}
            placeholder="License Number"
            value={form.license_number}
            onChange={(e) => set("license_number", e.target.value)}
          />
          {renderTutorialCard(
            "tut-vehicle",
            "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
          )}
        </section>

        <div
          id="tut-save"
          className={cn(
            "relative mt-8 transition-all",
            isHighlighted("tut-save")
              ? "z-[250] rounded-2xl bg-white shadow-2xl ring-4 ring-[#f5a623]"
              : "",
          )}
        >
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1b2b4b] py-4 font-bold text-white shadow-lg transition-all hover:bg-[#2a3f68] active:scale-95 disabled:opacity-60"
          >
            <Save size={18} /> {loading ? "..." : en ? "Save Changes" : "I-save ang mga Pagbabago"}
          </button>
          {renderTutorialCard(
            "tut-save",
            "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
          )}
        </div>
      </div>
    </MobileShell>
  );
}
