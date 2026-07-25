/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, HelpCircle, Loader2, Info } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession, ONBOARDING_TOUR_DEMO_EVENT_ID } from "@/lib/session-context";
import { supabase } from "@/supabase";
import {
  formatCaseNumber,
  formatEwalletNumber,
  formatLicenseNumber,
  formatMobileDisplay,
  formatPlateNumber,
  licenseNumberPlaceholder,
  dlCodeHint,
  toProperCase,
  toProperCaseKeepAcronyms,
  cleanMobile,
} from "@/shared";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ eventId: z.string().optional() });

export const Route = createFileRoute("/apply-detail")({
  component: ApplyDetailPage,
  validateSearch: searchSchema,
});
// Temporarily hidden — set back to true to re-enable the Disbursement section.
const SHOW_DISBURSEMENT = true;

// Reads an event's disbursement_methods (new, comma-separated e.g. "Cash, GCash"),
// falling back to the old single-value disbursement_mode field for events created
// before this was a multi-select, and finally to allowing everything for events
// that predate disbursement settings entirely.
function getAllowedDisbursementMethods(ev: any): string[] {
  if (!ev) return ["Cash", "GCash", "Maya"];
  if (typeof ev.disbursement_methods === "string" && ev.disbursement_methods.trim()) {
    return ev.disbursement_methods
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  if (ev.disbursement_mode === "cash") return ["Cash"];
  if (ev.disbursement_mode === "gcash") return ["GCash"];
  return ["Cash", "GCash", "Maya"];
}
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

const tutSteps = (en: boolean) => [
  en
    ? "This is the Application form. Fill in your Personal Information exactly as it appears on your Driver's License."
    : "Ito ang form ng Aplikasyon. Punan ang iyong Personal na Impormasyon nang eksaktong tugma sa iyong Driver's License.",
  en
    ? "Your Address helps the agency confirm you're within the coverage area for this subsidy."
    : "Ang iyong Tirahan ay tumutulong sa ahensya na kumpirmahin kung nasa saklaw ka ng subsidy na ito.",
  en
    ? "Your Vehicle and Franchise details must match your official documents exactly — mismatches are one of the most common reasons for rejection."
    : "Dapat eksaktong tugma ang iyong Sasakyan at Pransisa sa opisyal na dokumento — isa ito sa pinakakaraniwang dahilan ng pagkatanggi.",
];

function ApplyDetailPage() {
  const navigate = useNavigate();
  const { eventId } = Route.useSearch();
  const {
    en,
    driver,
    driverId,
    refreshApps,
    onboardingTourActive,
    advanceOnboardingTour,
    endOnboardingTour,
  } = useSession();

  const [event, setEvent] = useState<any>(null);
  const allowedDisbursementMethods = getAllowedDisbursementMethods(event);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [tutStep, setTutStep] = useState(0);

  useEffect(() => {
    if (onboardingTourActive && tutStep === 0) setTutStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingTourActive]);
  const steps = tutSteps(en);
  const [noMiddle, setNoMiddle] = useState(false);
  const [noExtension, setNoExtension] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const isVerified = driver?.verification_status === "verified";
  const shouldAutoFill = isVerified;

  const [form, setForm] = useState({
    last_name: shouldAutoFill ? driver?.last_name || "" : "",
    first_name: shouldAutoFill ? driver?.first_name || "" : "",
    middle_name: shouldAutoFill
      ? driver?.middle_name === "N/A"
        ? ""
        : driver?.middle_name || ""
      : "",
    extension_name: shouldAutoFill
      ? driver?.extension_name === "N/A"
        ? ""
        : driver?.extension_name || ""
      : "",
    sex: shouldAutoFill ? driver?.sex || "" : "",
    birth_month: shouldAutoFill ? driver?.birth_month || "" : "",
    birth_day: shouldAutoFill ? driver?.birth_day || "" : "",
    birth_year: shouldAutoFill ? driver?.birth_year || "" : "",
    age: shouldAutoFill ? driver?.age || "" : "",
    region: shouldAutoFill ? driver?.region || "" : "",
    province: shouldAutoFill ? driver?.province || "" : "",
    city: shouldAutoFill ? driver?.city || "" : "",
    barangay: shouldAutoFill ? driver?.barangay || "" : "",
    mobile: shouldAutoFill ? driver?.mobile || "" : "",
    denomination: shouldAutoFill ? driver?.denomination || "" : "",
    case_number: shouldAutoFill ? driver?.case_number || "" : "",
    operator_name: shouldAutoFill ? driver?.operator_name || "" : "",
    cooperative_name: shouldAutoFill ? driver?.cooperative_name || "" : "",
    plate_number: shouldAutoFill ? driver?.plate_number || "" : "",
    chassis_number: shouldAutoFill ? driver?.chassis_number || "" : "",
    license_number: shouldAutoFill ? driver?.license_number || "" : "",
    ewallet_type: "",
    ewallet_number: "",
  });

  function set(field: string, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  function clearErr(field: string) {
    setFieldErrors((p) => {
      if (!p[field]) return p;
      const n = { ...p };
      delete n[field];
      return n;
    });
  }

  function validateForm() {
    const errs: Record<string, string> = {};
    const req = (f: keyof typeof form, msg?: string) => {
      if (!(form[f] || "").toString().trim()) errs[f] = msg || (en ? "Required." : "Kailangan.");
    };

    req("last_name");
    req("first_name");
    if (!noMiddle && !form.middle_name.trim())
      errs.middle_name = en ? "Required, or check the box." : "Kailangan, o i-check ang box.";
    req("sex");
    req("birth_month");
    req("birth_day");
    if (!form.birth_year || form.birth_year.length !== 4)
      errs.birth_year = en ? "Enter a valid year." : "Ilagay ang tamang taon.";
    req("age");

    req("region");
    req("province");
    req("city");
    req("barangay");

    const cleanedMobile = cleanMobile(form.mobile);
    if (cleanedMobile.length !== 11 || !cleanedMobile.startsWith("09")) {
      errs.mobile = en ? "Enter a valid 11-digit mobile number." : "Ilagay ang tamang numero.";
    }

    req("denomination");
    if (!form.case_number.trim()) errs.case_number = en ? "Required." : "Kailangan.";
    else if (!/^\d{4}-\d{4}$/.test(form.case_number.trim())) errs.case_number = "YYYY-XXXX";

    req("operator_name");
    req("cooperative_name");

    if (!form.plate_number.trim()) errs.plate_number = en ? "Required." : "Kailangan.";
    else if (!/^[A-Z]{2,3} \d{3,4}$/.test(form.plate_number.trim())) errs.plate_number = "ABC 1234";

    req("chassis_number");

    if (!form.license_number.trim()) errs.license_number = en ? "Required." : "Kailangan.";
    else if (!/^[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{6}$/.test(form.license_number.trim()))
      errs.license_number = "C01-XX-XXXXXX";

    if (SHOW_DISBURSEMENT) {
      req("ewallet_type");
      if (form.ewallet_type === "GCash" || form.ewallet_type === "Maya") {
        req("ewallet_number");
      }
    }

    return errs;
  }

  // Handles the back button press safely
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/apply" });
    }
  };

  useEffect(() => {
    async function load() {
      if (!eventId) {
        setLoading(false);
        return;
      }
      if (eventId === ONBOARDING_TOUR_DEMO_EVENT_ID) {
        // Guided-tour step: use a fixed prototype event instead of a real
        // Supabase row, so this step always works the same way regardless of
        // what events actually exist at the moment someone signs up.
        const demoEvent = {
          id: ONBOARDING_TOUR_DEMO_EVENT_ID,
          program_name: en
            ? "Sample PUV Driver Cash Subsidy"
            : "Halimbawang Cash Subsidy para sa Drayber ng PUV",
          program_agency: "DOTr",
          program_amount: "1000",
          venue: en
            ? "Sample City Hall, Sample City"
            : "Halimbawang City Hall, Halimbawang Lungsod",
          event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          batches: [
            { id: "demo_batch_1", label: "Batch 1", time_start: "08:00", time_end: "12:00" },
          ],
          time_start: "08:00:00",
          time_end: "12:00:00",
          application_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: en
            ? "This is a sample subsidy so you can see how applying works. It's not a real event."
            : "Ito ay isang halimbawang subsidy para makita mo kung paano gumagana ang pag-apply. Hindi ito totoong event.",
          qualified_denominations: null,
          disbursement_methods: "Cash, GCash, Maya",
        };
        setEvent(demoEvent);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("payout_events").select("*").eq("id", eventId).single();
      setEvent(data);
      const methods = getAllowedDisbursementMethods(data);
      if (methods.length === 1) {
        setForm((p) => ({ ...p, ewallet_type: methods[0] }));
      }
      setLoading(false);
    }
    load();
  }, [eventId]);

  useEffect(() => {
    if (tutStep > 0) {
      const el = document.getElementById(`tut-step-${tutStep}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - window.innerHeight * 0.18,
          behavior: "smooth",
        });
      }
    }
  }, [tutStep]);

  async function submitApplication(e: any) {
    e.preventDefault();
    if (!event) return;
    if (event.id === ONBOARDING_TOUR_DEMO_EVENT_ID) {
      // Safety net: this is the guided-tour's fake prototype event, not a real
      // one — there's nothing in Supabase to actually submit an application to.
      alert(
        en
          ? "This is just a sample for the tour — nothing to submit here."
          : "Ito ay halimbawa lang para sa tour — walang isusumite dito.",
      );
      return;
    }

    // Run field validations
    const errs = validateForm();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      fieldRefs.current[firstKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (event.application_deadline && new Date(event.application_deadline) < new Date()) {
      navigate({ to: "/apply" });
      return;
    }
    setSubmitting(true);

    const { data: existingApps } = await supabase
      .from("applications")
      .select("id, status")
      .eq("driver_id", driverId)
      .eq("event_id", event.id);

    let errorObj;
    if (existingApps && existingApps.length > 0) {
      const targetAppId = existingApps[0].id;
      const { error } = await supabase
        .from("applications")
        .update({
          status: "pending",
          applied_at: new Date().toISOString(),
          rejection_fields: null,
          rejection_has_fields: false,
          admin_message: null,
          ewallet_type: form.ewallet_type || null,
          ewallet_number:
            form.ewallet_type === "GCash" || form.ewallet_type === "Maya"
              ? form.ewallet_number
              : null,
        })
        .eq("id", targetAppId);
      errorObj = error;
      if (existingApps.length > 1) {
        const extraIds = existingApps.slice(1).map((a: any) => a.id);
        await supabase.from("applications").delete().in("id", extraIds);
      }
    } else {
      const { error } = await supabase.from("applications").insert({
        driver_id: driverId,
        event_id: event.id,
        status: "pending",
        applied_at: new Date().toISOString(),
        ewallet_type: form.ewallet_type || null,
        ewallet_number:
          form.ewallet_type === "GCash" || form.ewallet_type === "Maya"
            ? form.ewallet_number
            : null,
      });
      errorObj = error;
    }

    setSubmitting(false);
    if (errorObj) {
      alert(en ? "Something went wrong. Please try again." : "May nangyaring mali. Subukan muli.");
      return;
    }

    try {
      const key = `uplift_archived_${driverId}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(saved.filter((id: string) => id !== event.id)));
    } catch {
      /* ignore */
    }

    await refreshApps();
    navigate({ to: "/subsidies" });
  }

  const renderTutorialCard = (stepNum: number, positionClasses: string) => {
    if (tutStep !== stepNum) return null;
    return (
      <div
        className={`absolute z-[300] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl ${positionClasses}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
            {tutStep}/{steps.length}
          </div>
          <h3 className="text-lg font-bold text-white">
            {en ? "Application Guide" : "Gabay sa Aplikasyon"}
          </h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{steps[tutStep - 1]}</p>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setTutStep(0);
              if (onboardingTourActive) endOnboardingTour();
            }}
            className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            {en ? "Skip" : "Laktawan"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (tutStep < steps.length) setTutStep((s) => s + 1);
              else {
                setTutStep(0);
                if (onboardingTourActive) advanceOnboardingTour();
              }
            }}
            className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
          >
            {tutStep === steps.length ? (en ? "Finish" : "Tapusin") : en ? "Next" : "Susunod"}
          </button>
        </div>
      </div>
    );
  };

  const inputCls = (field: keyof typeof form) =>
    cn(
      "w-full rounded-2xl border p-3 text-sm outline-none transition-all focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10",
      fieldErrors[field]
        ? "border-red-400 bg-red-50 text-red-900 placeholder:text-red-300"
        : "border-gray-200 bg-[#f8f9fa] placeholder:text-slate-400",
    );

  const ErrorMsg = ({ field }: { field: keyof typeof form }) => {
    if (!fieldErrors[field]) return null;
    return <p className="mt-1 text-[11px] font-semibold text-red-500">⚠️ {fieldErrors[field]}</p>;
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#f5a623]" />
        </div>
      </MobileShell>
    );
  }

  if (!event) {
    return (
      <MobileShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-[#8c8b88]">
            {en ? "This subsidy event was not found." : "Hindi nahanap ang event."}
          </p>
          <button onClick={handleBack} className="mt-4 font-bold text-[#f5a623] underline">
            {en ? "Back to Available Subsidies" : "Bumalik sa Available Subsidies"}
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 bg-white/90 px-6 pb-4 pt-8 backdrop-blur-xl">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold text-[#1b2b4b]">
            {en ? "Apply for Subsidy" : "Mag-apply ng Subsidy"}
          </h1>
          <p className="truncate text-[12px] text-[#8c8b88]">
            {event.program_name} · ₱{event.program_amount}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setShowHelp((s) => !s)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#1b2b4b]"
            title={en ? "Quick tips" : "Mga Tip"}
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTutStep(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#f5a623]"
            title={en ? "Open guided tutorial" : "Buksan ang Gabay"}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

      <div className="flex flex-col gap-4 px-6 pb-24 pt-4">
        {showHelp && (
          <div className="rounded-2xl border border-gray-100 bg-[#f8f9fa] p-4 text-[12px] leading-relaxed text-[#1b2b4b]">
            <p className="mb-2 flex items-center gap-1.5 font-bold text-[#1b2b4b]">
              <Info className="h-3.5 w-3.5" /> {en ? "Tips for a smooth application" : "Mga Tip"}
            </p>
            <ul className="list-disc space-y-1 pl-4 text-[#8c8b88]">
              <li>
                {en
                  ? "Your name must match your Driver's License exactly."
                  : "Dapat eksaktong tugma ang pangalan sa Driver's License."}
              </li>
              <li>
                {en
                  ? 'No middle/extension name? Type "N/A" instead of leaving it blank.'
                  : 'Walang middle/extension name? I-type ang "N/A".'}
              </li>
              <li>
                {en
                  ? "Double-check your e-wallet number and type."
                  : "I-double-check ang e-wallet number at type."}
              </li>
              <li>
                {en
                  ? "Make sure plate and chassis numbers match official documents."
                  : "Siguraduhing tugma ang plate at chassis number."}
              </li>
            </ul>
          </div>
        )}

        {isVerified ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-[#1b2b4b]">
            ✅{" "}
            {en
              ? "Your account is verified. Details have been pre-filled from your profile."
              : "Na-verify ang account. Pre-filled na ang mga detalye."}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#f5a623]/30 bg-[#fffaf0] p-3 text-[13px] text-[#1b2b4b]">
            ℹ️{" "}
            {en
              ? "Your account is not yet verified, so this form starts blank."
              : "Hindi pa na-verify ang account, kaya blangko ang form na ito."}
          </div>
        )}

        {Object.keys(fieldErrors).length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
            ⚠️{" "}
            {en
              ? "Please fix the highlighted fields below."
              : "Pakisagot nang tama ang mga naiwang impormasyon sa ibaba."}
          </div>
        )}

        <form onSubmit={submitApplication} className="flex flex-col gap-5">
          <div
            id="tut-step-1"
            className={`flex flex-col gap-3 rounded-2xl transition-all ${tutStep === 1 ? "relative z-[250] bg-white p-3 shadow-2xl ring-4 ring-[#f5a623]" : ""}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[#8c8b88]">
              {en ? "Personal Information" : "Personal na Impormasyon"}
            </p>
            <div
              ref={(el) => {
                fieldRefs.current.last_name = el;
              }}
            >
              <input
                className={inputCls("last_name")}
                placeholder={en ? "Last Name *" : "Apelyido *"}
                value={form.last_name}
                onChange={(e) => {
                  set("last_name", e.target.value);
                  clearErr("last_name");
                }}
                onBlur={() => set("last_name", toProperCase(form.last_name))}
              />
              <ErrorMsg field="last_name" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.first_name = el;
              }}
            >
              <input
                className={inputCls("first_name")}
                placeholder={en ? "First Name *" : "Pangalan *"}
                value={form.first_name}
                onChange={(e) => {
                  set("first_name", e.target.value);
                  clearErr("first_name");
                }}
                onBlur={() => set("first_name", toProperCase(form.first_name))}
              />
              <ErrorMsg field="first_name" />
            </div>

            <div>
              <div
                ref={(el) => {
                  fieldRefs.current.middle_name = el;
                }}
              >
                <input
                  className={cn(inputCls("middle_name"), "disabled:opacity-40")}
                  placeholder={en ? "Middle Name" : "Gitnang Pangalan"}
                  value={noMiddle ? "" : form.middle_name}
                  disabled={noMiddle}
                  onChange={(e) => {
                    set("middle_name", e.target.value);
                    clearErr("middle_name");
                  }}
                />
                <ErrorMsg field="middle_name" />
              </div>
              <label className="mt-1.5 flex items-center gap-2 text-[11px] text-[#8c8b88]">
                <input
                  type="checkbox"
                  checked={noMiddle}
                  onChange={(e) => {
                    setNoMiddle(e.target.checked);
                    clearErr("middle_name");
                  }}
                />{" "}
                {en ? "I have no middle name" : "Wala akong gitnang pangalan"}
              </label>
            </div>

            <div>
              <div
                ref={(el) => {
                  fieldRefs.current.extension_name = el;
                }}
              >
                <input
                  className={cn(inputCls("extension_name"), "disabled:opacity-40")}
                  placeholder={en ? "Extension Name (Jr, Sr, III)" : "Extension Name"}
                  value={noExtension ? "" : form.extension_name}
                  disabled={noExtension}
                  onChange={(e) => {
                    set("extension_name", e.target.value);
                    clearErr("extension_name");
                  }}
                />
                <ErrorMsg field="extension_name" />
              </div>
              <label className="mt-1.5 flex items-center gap-2 text-[11px] text-[#8c8b88]">
                <input
                  type="checkbox"
                  checked={noExtension}
                  onChange={(e) => {
                    setNoExtension(e.target.checked);
                    clearErr("extension_name");
                  }}
                />{" "}
                {en ? "I have no extension name" : "Wala akong extension name"}
              </label>
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.sex = el;
              }}
            >
              <select
                className={inputCls("sex")}
                value={form.sex}
                onChange={(e) => {
                  set("sex", e.target.value);
                  clearErr("sex");
                }}
              >
                <option value="">{en ? "Sex *" : "Kasarian *"}</option>
                <option>Male</option>
                <option>Female</option>
                <option>Others</option>
              </select>
              <ErrorMsg field="sex" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                ref={(el) => {
                  fieldRefs.current.birth_month = el;
                }}
              >
                <select
                  className={inputCls("birth_month")}
                  value={form.birth_month}
                  onChange={(e) => {
                    set("birth_month", e.target.value);
                    clearErr("birth_month");
                  }}
                >
                  <option value="">{en ? "Month" : "Buwan"}</option>
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <ErrorMsg field="birth_month" />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.birth_day = el;
                }}
              >
                <select
                  className={inputCls("birth_day")}
                  value={form.birth_day}
                  onChange={(e) => {
                    set("birth_day", e.target.value);
                    clearErr("birth_day");
                  }}
                >
                  <option value="">{en ? "Day" : "Araw"}</option>
                  {days.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <ErrorMsg field="birth_day" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                ref={(el) => {
                  fieldRefs.current.birth_year = el;
                }}
              >
                <input
                  className={inputCls("birth_year")}
                  placeholder={en ? "Year (YYYY)" : "Taon"}
                  value={form.birth_year}
                  maxLength={4}
                  onChange={(e) => {
                    set("birth_year", e.target.value);
                    clearErr("birth_year");
                  }}
                />
                <ErrorMsg field="birth_year" />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.age = el;
                }}
              >
                <input
                  className={inputCls("age")}
                  placeholder={en ? "Age" : "Edad"}
                  value={form.age}
                  onChange={(e) => {
                    set("age", e.target.value);
                    clearErr("age");
                  }}
                />
                <ErrorMsg field="age" />
              </div>
            </div>
            {renderTutorialCard(
              1,
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          <div
            id="tut-step-2"
            className={`flex flex-col gap-3 rounded-2xl transition-all ${tutStep === 2 ? "relative z-[250] bg-white p-3 shadow-2xl ring-4 ring-[#f5a623]" : ""}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[#8c8b88]">
              {en ? "Address & Contact" : "Tirahan at Kontak"}
            </p>
            <div
              ref={(el) => {
                fieldRefs.current.region = el;
              }}
            >
              <input
                className={inputCls("region")}
                placeholder="Region *"
                value={form.region}
                onChange={(e) => {
                  set("region", e.target.value);
                  clearErr("region");
                }}
              />
              <ErrorMsg field="region" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.province = el;
              }}
            >
              <input
                className={inputCls("province")}
                placeholder="Province *"
                value={form.province}
                onChange={(e) => {
                  set("province", e.target.value);
                  clearErr("province");
                }}
              />
              <ErrorMsg field="province" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.city = el;
              }}
            >
              <input
                className={inputCls("city")}
                placeholder={en ? "City / Municipality *" : "Lungsod *"}
                value={form.city}
                onChange={(e) => {
                  set("city", e.target.value);
                  clearErr("city");
                }}
              />
              <ErrorMsg field="city" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.barangay = el;
              }}
            >
              <input
                className={inputCls("barangay")}
                placeholder="Barangay *"
                value={form.barangay}
                onChange={(e) => {
                  set("barangay", e.target.value);
                  clearErr("barangay");
                }}
              />
              <ErrorMsg field="barangay" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.mobile = el;
              }}
            >
              <input
                className={inputCls("mobile")}
                placeholder={en ? "Contact Number *" : "Numero ng Kontak *"}
                value={formatMobileDisplay(form.mobile)}
                onChange={(e) => {
                  set("mobile", formatMobileDisplay(e.target.value));
                  clearErr("mobile");
                }}
              />
              <ErrorMsg field="mobile" />
            </div>
            {renderTutorialCard(
              2,
              "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          <div
            id="tut-step-3"
            className={`flex flex-col gap-3 rounded-2xl transition-all ${tutStep === 3 ? "relative z-[250] bg-white p-3 shadow-2xl ring-4 ring-[#f5a623]" : ""}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[#8c8b88]">
              {en ? "Vehicle and Franchise" : "Sasakyan at Pransisa"}
            </p>
            <div
              ref={(el) => {
                fieldRefs.current.denomination = el;
              }}
            >
              <select
                className={inputCls("denomination")}
                value={form.denomination}
                onChange={(e) => {
                  set("denomination", e.target.value);
                  clearErr("denomination");
                }}
              >
                <option value="">{en ? "Denomination *" : "Uri ng Sasakyan *"}</option>
                {denominations.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <ErrorMsg field="denomination" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.case_number = el;
              }}
            >
              <input
                className={inputCls("case_number")}
                placeholder="Case Number * (2020-XXXX)"
                value={form.case_number}
                onChange={(e) => {
                  set("case_number", formatCaseNumber(e.target.value));
                  clearErr("case_number");
                }}
              />
              <ErrorMsg field="case_number" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.operator_name = el;
              }}
            >
              <input
                className={inputCls("operator_name")}
                placeholder={en ? "Operator's Name *" : "Pangalan ng Operator *"}
                value={form.operator_name}
                onChange={(e) => {
                  set("operator_name", e.target.value);
                  clearErr("operator_name");
                }}
                onBlur={() => set("operator_name", toProperCaseKeepAcronyms(form.operator_name))}
              />
              <ErrorMsg field="operator_name" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.cooperative_name = el;
              }}
            >
              <input
                className={inputCls("cooperative_name")}
                placeholder={en ? "Cooperative Name *" : "Pangalan ng Kooperatiba *"}
                value={form.cooperative_name}
                onChange={(e) => {
                  set("cooperative_name", e.target.value);
                  clearErr("cooperative_name");
                }}
                onBlur={() =>
                  set("cooperative_name", toProperCaseKeepAcronyms(form.cooperative_name))
                }
              />
              <ErrorMsg field="cooperative_name" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.plate_number = el;
              }}
            >
              <input
                className={inputCls("plate_number")}
                placeholder="Plate Number * (ABC 1234)"
                value={form.plate_number}
                onChange={(e) => {
                  set("plate_number", formatPlateNumber(e.target.value));
                  clearErr("plate_number");
                }}
              />
              <ErrorMsg field="plate_number" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.chassis_number = el;
              }}
            >
              <input
                className={inputCls("chassis_number")}
                placeholder="Chassis Number *"
                value={form.chassis_number}
                onChange={(e) => {
                  set("chassis_number", e.target.value);
                  clearErr("chassis_number");
                }}
              />
              <ErrorMsg field="chassis_number" />
            </div>

            <div
              ref={(el) => {
                fieldRefs.current.license_number = el;
              }}
            >
              <input
                className={inputCls("license_number")}
                placeholder={`${en ? "Driver's License No. *" : "License No. *"} (${licenseNumberPlaceholder(form.denomination)})`}
                value={form.license_number}
                onChange={(e) => {
                  set("license_number", formatLicenseNumber(e.target.value));
                  clearErr("license_number");
                }}
              />
              <ErrorMsg field="license_number" />
              {form.denomination && (
                <p className="mt-1 text-[10px] text-[#8c8b88]">
                  {dlCodeHint(form.denomination, en)}
                </p>
              )}
            </div>
            {renderTutorialCard(
              3,
              "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          {SHOW_DISBURSEMENT && (
            <div
              id="tut-step-4"
              className={`flex flex-col gap-3 rounded-2xl transition-all ${tutStep === 4 ? "relative z-[250] bg-white p-3 shadow-2xl ring-4 ring-[#f5a623]" : ""}`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#8c8b88]">
                {en ? "Disbursement" : "Pagpapalabas ng Pondo"}
              </p>
              <div
                ref={(el) => {
                  fieldRefs.current.ewallet_type = el;
                }}
              >
                <label className="mb-1.5 block text-[12px] font-semibold text-[#1b2b4b]">
                  {en
                    ? "How would you like to receive this subsidy? *"
                    : "Paano mo nais matanggap ang subsidy na ito? *"}
                </label>
                {allowedDisbursementMethods.length > 1 ? (
                  <select
                    className={inputCls("ewallet_type")}
                    value={form.ewallet_type}
                    onChange={(e) => {
                      set("ewallet_type", e.target.value);
                      clearErr("ewallet_type");
                    }}
                  >
                    <option value="">
                      {en ? "Select a disbursement method..." : "Pumili ng paraan ng pagbabayad..."}
                    </option>
                    {allowedDisbursementMethods.includes("Cash") && (
                      <option value="Cash">
                        {en
                          ? "Cash (claim in person at the venue)"
                          : "Cash (kunin nang personal sa venue)"}
                      </option>
                    )}
                    {allowedDisbursementMethods.includes("GCash") && (
                      <option value="GCash">GCash</option>
                    )}
                    {allowedDisbursementMethods.includes("Maya") && (
                      <option value="Maya">Maya</option>
                    )}
                  </select>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-semibold text-[#1b2b4b]">
                    {allowedDisbursementMethods[0] === "Cash"
                      ? en
                        ? "Cash (claim in person at the venue)"
                        : "Cash (kunin nang personal sa venue)"
                      : allowedDisbursementMethods[0] || "Cash"}
                    <span className="ml-2 text-[11px] font-normal text-[#8c8b88]">
                      {en
                        ? "\u2014 this event only supports this method"
                        : "\u2014 tanging paraan lamang ito para sa event na ito"}
                    </span>
                  </div>
                )}
                <ErrorMsg field="ewallet_type" />
              </div>

              {(form.ewallet_type === "GCash" || form.ewallet_type === "Maya") && (
                <div
                  ref={(el) => {
                    fieldRefs.current.ewallet_number = el;
                  }}
                >
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#1b2b4b]">
                    {en
                      ? `${form.ewallet_type} Account Number *`
                      : `Numero ng ${form.ewallet_type} Account *`}{" "}
                    <span className="font-normal text-[#8c8b88]">
                      {en ? "must be registered in your name" : "dapat sa iyong pangalan"}
                    </span>
                  </label>
                  <input
                    className={inputCls("ewallet_number")}
                    placeholder="0996 XXX XXXX"
                    value={formatEwalletNumber(form.ewallet_number)}
                    onChange={(e) => {
                      set("ewallet_number", formatEwalletNumber(e.target.value));
                      clearErr("ewallet_number");
                    }}
                  />
                  <ErrorMsg field="ewallet_number" />
                </div>
              )}
              {renderTutorialCard(
                4,
                "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          )}

          <div id="tut-step-5" className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
              {submitting ? "..." : en ? "Submit Application" : "Isumite ang Aplikasyon"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border-2 border-[#1b2b4b]/20 py-4 font-bold text-[#1b2b4b]"
            >
              {en ? "Cancel" : "Kanselahin"}
            </button>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
