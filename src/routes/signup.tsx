/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  User,
  Car,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";
import {
  PH_REGIONS,
  PH_PROVINCES_BY_REGION,
  PH_CITIES_BY_PROVINCE,
  SECURITY_QUESTIONS,
  cleanMobile,
  dlCodeHint,
  formatCaseNumber,
  formatLicenseNumber,
  formatMobileDisplay,
  formatPlateNumber,
  licenseNumberPlaceholder,
  toProperCase,
  toProperCaseKeepAcronyms,
} from "@/shared";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const wizardSteps = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Vehicle", icon: Car },
  { id: 3, label: "Security", icon: Shield },
];

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

function Field({ label, error, description, type, ...props }: any) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#1b2b4b]">{label}</span>
      {description && <span className="text-[10px] text-slate-500">{description}</span>}
      <div className="relative">
        <input
          {...props}
          type={isPassword ? (showPw ? "text" : "password") : type}
          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-[#1b2b4b] outline-none shadow-sm transition-all placeholder:text-slate-400 focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10 ${isPassword ? "pr-12" : ""} ${error ? "border-red-400" : "border-slate-200"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1b2b4b]"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <span className="text-[11px] font-semibold text-red-500">⚠️ {error}</span>}
    </label>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
  placeholder = "Select...",
}: any) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#1b2b4b]">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-[#1b2b4b] outline-none shadow-sm transition-all focus:border-[#f5a623] disabled:opacity-50 ${error ? "border-red-400" : "border-slate-200"}`}
      >
        <option value="" className="text-slate-400">
          {placeholder}
        </option>
        {options.map((o: string) => (
          <option key={o} value={o} className="text-[#1b2b4b]">
            {o}
          </option>
        ))}
      </select>
      {error && <span className="text-[11px] font-semibold text-red-500">⚠️ {error}</span>}
    </label>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const { en, handleLogin } = useSession();

  const [wizardStep, setWizardStep] = useState(1);
  const [tutStep, setTutStep] = useState(0);

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendSeconds, setResendSeconds] = useState(180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [consented, setConsented] = useState(false);
  const [noMiddle, setNoMiddle] = useState(false);
  const [noExtension, setNoExtension] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    extension_name: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    mobile: "",
    birth_month: "",
    birth_day: "",
    birth_year: "",
    sex: "",
    denomination: "",
    case_number: "",
    operator_name: "",
    cooperative_name: "",
    plate_number: "",
    chassis_number: "",
    license_number: "",
    password: "",
    confirm_password: "",
    security_question: "",
    security_answer: "",
    security_question_2: "",
    security_answer_2: "",
  });

  const currentTutSteps =
    wizardStep === 1
      ? [
          en
            ? "Fill in your Personal Information exactly as it appears on your Driver's License. Check the boxes if you have no middle or extension name."
            : "Punan ang Personal na Impormasyon nang eksaktong tugma sa iyong Driver's License. I-check ang box kung walang middle o extension name.",
          en
            ? "Your Address helps agencies confirm you're within the coverage area for a subsidy."
            : "Ang iyong Tirahan ay tumutulong sa mga ahensya na kumpirmahin ang iyong coverage area.",
        ]
      : wizardStep === 2
        ? [
            en
              ? "Your Vehicle and Franchise details must match your official documents exactly — mismatches are a common reason for rejection."
              : "Dapat eksaktong tugma ang iyong Sasakyan at Pransisa sa opisyal na dokumento — ito ang karaniwang dahilan ng pagkatanggi.",
            en
              ? "Provide an active mobile number so agencies can contact you regarding your application."
              : "Magbigay ng aktibong numero upang makontak ka ng mga ahensya tungkol sa iyong aplikasyon.",
          ]
        : [
            en
              ? "Create a strong password (at least 8 characters, with a number and special character) to secure your account."
              : "Gumawa ng matibay na password (8+ karakter, may numero at special character) para sa iyong account.",
            en
              ? "Choose two security questions to help you recover your account later, then accept the Data Privacy Consent."
              : "Pumili ng dalawang security question para mabawi ang account, pagkatapos ay tanggapin ang Data Privacy Consent.",
          ];

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

  // Reset tutorial whenever the wizard step changes
  useEffect(() => {
    setTutStep(0);
  }, [wizardStep]);

  useEffect(() => {
    if (!otpStep || resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpStep, resendSeconds]);

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

  function validatePassword() {
    const pw = form.password;
    if (pw.length < 8) return en ? "At least 8 characters." : "Hindi bababa sa 8 karakter.";
    if (!/[0-9]/.test(pw)) return en ? "Must contain a number." : "Kailangan ng numero.";
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pw))
      return en ? "Must contain a special character." : "Kailangan ng special character.";
    if (form.birth_year && pw.includes(form.birth_year))
      return en ? "Must not contain your birth year." : "Hindi dapat may taon ng kapanganakan.";
    return null;
  }

  function validateStep(step: number) {
    const errs: Record<string, string> = {};
    const req = (f: string) => {
      if (!(form as any)[f]?.toString().trim()) errs[f] = en ? "Required." : "Kailangan.";
    };
    if (step === 1) {
      req("last_name");
      req("first_name");
      if (!noMiddle && !form.middle_name.trim())
        errs.middle_name = en ? "Required, or check the box." : "Kailangan, o i-check ang box.";
      req("sex");
      if (!form.birth_month) errs.birth_month = en ? "Required." : "Kailangan.";
      if (!form.birth_day) errs.birth_day = en ? "Required." : "Kailangan.";
      if (!form.birth_year || form.birth_year.length !== 4)
        errs.birth_year = en ? "Enter a valid year." : "Ilagay ang tamang taon.";
      req("region");
      req("province");
      req("city");
      req("barangay");
    } else if (step === 2) {
      req("denomination");
      if (!form.case_number.trim()) errs.case_number = en ? "Required." : "Kailangan.";
      else if (!/^\d{4}-\d{4}$/.test(form.case_number.trim())) errs.case_number = "YYYY-XXXX";
      req("operator_name");
      req("cooperative_name");
      if (!form.plate_number.trim()) errs.plate_number = en ? "Required." : "Kailangan.";
      else if (!/^[A-Z]{2,3} \d{3,4}$/.test(form.plate_number.trim()))
        errs.plate_number = "ABC 1234";
      req("chassis_number");
      if (!form.license_number.trim()) errs.license_number = en ? "Required." : "Kailangan.";
      else if (!/^[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{6}$/.test(form.license_number.trim()))
        errs.license_number = "C01-XX-XXXXXX";
      const cleaned = cleanMobile(form.mobile);
      if (cleaned.length !== 11 || !cleaned.startsWith("09"))
        errs.mobile = en ? "Enter a valid 11-digit mobile number." : "Ilagay ang tamang numero.";
    } else if (step === 3) {
      const pwErr = validatePassword();
      if (pwErr) errs.password = pwErr;
      if (form.password !== form.confirm_password)
        errs.confirm_password = en ? "Passwords do not match." : "Hindi magkatugma.";
      if (!form.security_question) errs.security_question = en ? "Required." : "Kailangan.";
      if (!form.security_answer.trim()) errs.security_answer = en ? "Required." : "Kailangan.";
      if (!form.security_question_2) errs.security_question_2 = en ? "Required." : "Kailangan.";
      if (!form.security_answer_2.trim()) errs.security_answer_2 = en ? "Required." : "Kailangan.";
      if (form.security_question && form.security_question === form.security_question_2)
        errs.security_question_2 = en ? "Choose a different question." : "Pumili ng ibang tanong.";
      if (!consented) errs.consent = en ? "Please accept the Terms." : "Tanggapin ang Terms.";
    }
    return errs;
  }

  function goNext() {
    const errs = validateStep(wizardStep);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError(
        en ? "Please fix the highlighted fields." : "Ayusin ang mga naka-highlight na field.",
      );
      const firstKey = Object.keys(errs)[0];
      fieldRefs.current[firstKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    if (wizardStep < 3) {
      setWizardStep((s) => s + 1);
    } else {
      setOtpStep(true);
      setResendSeconds(180);
    }
  }

  async function handleConfirmOtp() {
    setLoading(true);
    setError("");
    const full_name = [
      form.first_name,
      noMiddle ? "" : form.middle_name,
      form.last_name,
      noExtension ? "" : form.extension_name,
    ]
      .filter(Boolean)
      .join(" ");
    const { error: err } = await supabase.from("drivers").insert({
      full_name,
      last_name: form.last_name,
      first_name: form.first_name,
      middle_name: noMiddle ? "N/A" : form.middle_name,
      extension_name: noExtension ? "N/A" : form.extension_name || "N/A",
      region: form.region,
      province: form.province,
      city: form.city,
      barangay: form.barangay,
      mobile: cleanMobile(form.mobile),
      birth_month: form.birth_month,
      birth_day: form.birth_day,
      birth_year: form.birth_year,
      age: form.birth_year ? String(new Date().getFullYear() - parseInt(form.birth_year)) : "",
      sex: form.sex,
      denomination: form.denomination,
      case_number: form.case_number,
      operator_name: form.operator_name,
      cooperative_name: form.cooperative_name,
      plate_number: form.plate_number,
      chassis_number: form.chassis_number,
      license_number: form.license_number,
      password: form.password,
      philsys_number: cleanMobile(form.mobile),
      verification_status: "unverified",
      security_question: form.security_question,
      security_answer: form.security_answer.trim().toLowerCase(),
      security_question_2: form.security_question_2,
      security_answer_2: form.security_answer_2.trim().toLowerCase(),
    });
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("duplicate")
          ? en
            ? "This mobile number is already registered."
            : "Nakarehistro na ang numerong ito."
          : en
            ? "Something went wrong."
            : "May nangyaring mali.",
      );
      return;
    }
    await handleLogin(cleanMobile(form.mobile), () => navigate({ to: "/home" }));
  }

  const provinceOptions = form.region ? (PH_PROVINCES_BY_REGION as any)[form.region] || [] : [];
  const cityOptions = form.province ? (PH_CITIES_BY_PROVINCE as any)[form.province] || [] : [];
  const mmss = `${Math.floor(resendSeconds / 60)}:${String(resendSeconds % 60).padStart(2, "0")}`;

  const renderTutorialCard = (stepNum: number, positionClasses: string) => {
    if (tutStep !== stepNum) return null;
    return (
      <div
        className={`absolute z-[300] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl ${positionClasses}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
            {tutStep}/{currentTutSteps.length}
          </div>
          <h3 className="text-lg font-bold text-white">
            {en ? "Signup Guide" : "Gabay sa Pagrehistro"}
          </h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{currentTutSteps[tutStep - 1]}</p>
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
              if (tutStep < currentTutSteps.length) setTutStep((s) => s + 1);
              else setTutStep(0);
            }}
            className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
          >
            {tutStep === currentTutSteps.length
              ? en
                ? "Finish"
                : "Tapusin"
              : en
                ? "Next"
                : "Susunod"}
          </button>
        </div>
      </div>
    );
  };

  const wrapperCls = (stepIndex: number) =>
    `flex flex-col gap-4 transition-all ${
      tutStep === stepIndex
        ? "relative z-[250] rounded-3xl bg-white p-5 shadow-2xl ring-4 ring-[#f5a623]"
        : "relative"
    }`;

  // ── OTP screen ──
  if (otpStep) {
    return (
      <MobileShell className="flex min-h-screen flex-col bg-slate-50 px-6 pb-8 pt-8 text-[#1b2b4b]">
        <div className="relative flex items-center justify-center py-2">
          <button
            onClick={() => setOtpStep(false)}
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#1b2b4b] shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#1b2b4b] to-[#2e4a85]">
              SU
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#ffd54f] via-[#f5a623] to-[#c17a1a]">
              BI
            </span>
          </h1>
        </div>

        <h2 className="mt-8 text-lg font-bold">
          {en ? "Verify Your Mobile Number" : "I-verify ang Numero"}
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          {en
            ? "Almost done! Confirm to finish creating your account."
            : "Halos tapos na! Kumpirmahin para matapos."}
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/10 p-3 text-sm">
          📱{" "}
          {en
            ? `OTP sent to ${formatMobileDisplay(form.mobile)}`
            : `Napadala sa ${formatMobileDisplay(form.mobile)}`}
        </div>

        <input
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-center text-2xl tracking-[10px] text-[#1b2b4b] shadow-sm outline-none focus:border-[#f5a623]"
          placeholder="______"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <div className="mt-4 text-center text-[13px] text-slate-500">
          {resendSeconds > 0 ? (
            <span>
              {en ? "Resend OTP in" : "Maaaring mag-resend sa"}{" "}
              <strong className="text-[#f5a623]">{mmss}</strong>
            </span>
          ) : (
            <button
              onClick={() => setResendSeconds(180)}
              className="font-bold text-[#f5a623] underline"
            >
              {en ? "Resend OTP" : "Ipadala Muli"}
            </button>
          )}
        </div>

        <button
          onClick={handleConfirmOtp}
          disabled={loading}
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "..." : en ? "Confirm and Create Account" : "Kumpirmahin at Gumawa ng Account"}
        </button>
      </MobileShell>
    );
  }

  // ── Wizard form ──
  return (
    <MobileShell className="flex min-h-screen flex-col bg-slate-50 px-6 pb-24 pt-8 text-[#1b2b4b]">
      <div className="relative flex items-center justify-center py-2">
        <button
          onClick={() => {
            if (wizardStep > 1) setWizardStep((s) => s - 1);
            else navigate({ to: "/" });
          }}
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#1b2b4b] shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-center text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#1b2b4b] to-[#2e4a85]">
            SU
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#ffd54f] via-[#f5a623] to-[#c17a1a]">
            BI
          </span>
        </h1>
        <button
          onClick={() => setTutStep(1)}
          className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#f5a623] shadow-sm hover:bg-slate-50"
          title={en ? "Open Tutorial" : "Buksan ang Tutorial"}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 text-center text-[13px] text-slate-500">
        {en
          ? "Ensure all information matches your Driver's License."
          : "Siguraduhing tugma sa iyong Driver's License."}
      </p>

      <div className="mt-6 flex items-center justify-between">
        {wizardSteps.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div
              className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${wizardStep >= s.id ? "bg-[#f5a623] text-[#1b2b4b] shadow-sm" : "bg-slate-200 text-slate-400"}`}
            >
              {wizardStep > s.id ? <Check size={16} /> : <s.icon size={16} />}
            </div>
            {i < wizardSteps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${wizardStep > s.id ? "bg-[#f5a623]" : "bg-slate-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

      <div className="mt-6 flex flex-col gap-6">
        {wizardStep === 1 && (
          <>
            <div id="tut-step-1" className={wrapperCls(1)}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {en ? "Personal Information" : "Personal na Impormasyon"}
              </p>
              <div
                ref={(el) => {
                  fieldRefs.current.last_name = el;
                }}
              >
                <Field
                  label={en ? "Last Name *" : "Apelyido *"}
                  value={form.last_name}
                  error={fieldErrors.last_name}
                  onChange={(e: any) => {
                    set("last_name", e.target.value);
                    clearErr("last_name");
                  }}
                  onBlur={() => set("last_name", toProperCase(form.last_name))}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.first_name = el;
                }}
              >
                <Field
                  label={en ? "First Name *" : "Pangalan *"}
                  value={form.first_name}
                  error={fieldErrors.first_name}
                  onChange={(e: any) => {
                    set("first_name", e.target.value);
                    clearErr("first_name");
                  }}
                  onBlur={() => set("first_name", toProperCase(form.first_name))}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.middle_name = el;
                }}
              >
                <Field
                  label={en ? "Middle Name" : "Gitnang Pangalan"}
                  value={noMiddle ? "" : form.middle_name}
                  disabled={noMiddle}
                  error={fieldErrors.middle_name}
                  onChange={(e: any) => {
                    set("middle_name", e.target.value);
                    clearErr("middle_name");
                  }}
                />
                <label className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
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
              <Field
                label={en ? "Extension Name (Jr, Sr, III)" : "Extension Name"}
                value={form.extension_name}
                disabled={noExtension}
                onChange={(e: any) => set("extension_name", e.target.value)}
              />
              <label className="-mt-2 flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={noExtension}
                  onChange={(e) => setNoExtension(e.target.checked)}
                />{" "}
                {en ? "I have no extension name" : "Wala akong extension name"}
              </label>
              <div
                ref={(el) => {
                  fieldRefs.current.sex = el;
                }}
              >
                <Select
                  label={en ? "Sex *" : "Kasarian *"}
                  options={["Male", "Female", "Others"]}
                  value={form.sex}
                  error={fieldErrors.sex}
                  onChange={(v: string) => {
                    set("sex", v);
                    clearErr("sex");
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  ref={(el) => {
                    fieldRefs.current.birth_month = el;
                  }}
                >
                  <Select
                    label={en ? "Birth Month *" : "Buwan *"}
                    options={months}
                    value={form.birth_month}
                    error={fieldErrors.birth_month}
                    onChange={(v: string) => {
                      set("birth_month", v);
                      clearErr("birth_month");
                    }}
                  />
                </div>
                <div
                  ref={(el) => {
                    fieldRefs.current.birth_day = el;
                  }}
                >
                  <Select
                    label={en ? "Day *" : "Araw *"}
                    options={days}
                    value={form.birth_day}
                    error={fieldErrors.birth_day}
                    onChange={(v: string) => {
                      set("birth_day", v);
                      clearErr("birth_day");
                    }}
                  />
                </div>
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.birth_year = el;
                }}
              >
                <Field
                  label={en ? "Birth Year (YYYY) *" : "Taon *"}
                  maxLength={4}
                  value={form.birth_year}
                  error={fieldErrors.birth_year}
                  onChange={(e: any) => {
                    set("birth_year", e.target.value);
                    clearErr("birth_year");
                  }}
                />
              </div>
              {renderTutorialCard(
                1,
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
            </div>

            <div id="tut-step-2" className={wrapperCls(2)}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {en ? "Address" : "Tirahan"}
              </p>
              <div
                ref={(el) => {
                  fieldRefs.current.region = el;
                }}
              >
                <Select
                  label="Region *"
                  options={PH_REGIONS as any}
                  value={form.region}
                  error={fieldErrors.region}
                  onChange={(v: string) => {
                    set("region", v);
                    set("province", "");
                    set("city", "");
                    clearErr("region");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.province = el;
                }}
              >
                <Select
                  label="Province *"
                  options={provinceOptions}
                  value={form.province}
                  disabled={!form.region}
                  error={fieldErrors.province}
                  onChange={(v: string) => {
                    set("province", v);
                    set("city", "");
                    clearErr("province");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.city = el;
                }}
              >
                <Select
                  label={en ? "City / Municipality *" : "Lungsod *"}
                  options={cityOptions}
                  value={form.city}
                  disabled={!form.province}
                  error={fieldErrors.city}
                  onChange={(v: string) => {
                    set("city", v);
                    clearErr("city");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.barangay = el;
                }}
              >
                <Field
                  label="Barangay *"
                  value={form.barangay}
                  error={fieldErrors.barangay}
                  onChange={(e: any) => {
                    set("barangay", e.target.value);
                    clearErr("barangay");
                  }}
                  onBlur={() => set("barangay", toProperCase(form.barangay))}
                />
              </div>
              {renderTutorialCard(
                2,
                "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          </>
        )}

        {wizardStep === 2 && (
          <>
            <div id="tut-step-1" className={wrapperCls(1)}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {en ? "Vehicle and Franchise" : "Sasakyan at Pransisa"}
              </p>
              <Select
                label={en ? "Denomination *" : "Uri ng Sasakyan *"}
                options={denominations}
                value={form.denomination}
                error={fieldErrors.denomination}
                onChange={(v: string) => {
                  set("denomination", v);
                  clearErr("denomination");
                }}
              />
              <div
                ref={(el) => {
                  fieldRefs.current.case_number = el;
                }}
              >
                <Field
                  label="Case Number * (2020-XXXX)"
                  value={form.case_number}
                  error={fieldErrors.case_number}
                  onChange={(e: any) => {
                    set("case_number", formatCaseNumber(e.target.value));
                    clearErr("case_number");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.operator_name = el;
                }}
              >
                <Field
                  label={en ? "Operator's Name *" : "Pangalan ng Operator *"}
                  value={form.operator_name}
                  error={fieldErrors.operator_name}
                  onChange={(e: any) => {
                    set("operator_name", e.target.value);
                    clearErr("operator_name");
                  }}
                  onBlur={() => set("operator_name", toProperCaseKeepAcronyms(form.operator_name))}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.cooperative_name = el;
                }}
              >
                <Field
                  label={en ? "Cooperative Name *" : "Pangalan ng Kooperatiba *"}
                  placeholder={en ? "e.g. Quezon City TODA Inc." : "hal. Quezon City TODA Inc."}
                  value={form.cooperative_name}
                  error={fieldErrors.cooperative_name}
                  onChange={(e: any) => {
                    set("cooperative_name", e.target.value);
                    clearErr("cooperative_name");
                  }}
                  onBlur={() =>
                    set("cooperative_name", toProperCaseKeepAcronyms(form.cooperative_name))
                  }
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.plate_number = el;
                }}
              >
                <Field
                  label="Plate Number * (ABC 1234)"
                  value={form.plate_number}
                  error={fieldErrors.plate_number}
                  onChange={(e: any) => {
                    set("plate_number", formatPlateNumber(e.target.value));
                    clearErr("plate_number");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.chassis_number = el;
                }}
              >
                <Field
                  label="Chassis Number *"
                  value={form.chassis_number}
                  error={fieldErrors.chassis_number}
                  onChange={(e: any) => {
                    set("chassis_number", e.target.value);
                    clearErr("chassis_number");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.license_number = el;
                }}
              >
                <Field
                  label={`${en ? "Driver's License Number *" : "License Number *"} (${licenseNumberPlaceholder(form.denomination)})`}
                  description={form.denomination ? dlCodeHint(form.denomination, en) : undefined}
                  value={form.license_number}
                  error={fieldErrors.license_number}
                  onChange={(e: any) => {
                    set("license_number", formatLicenseNumber(e.target.value));
                    clearErr("license_number");
                  }}
                />
              </div>
              {renderTutorialCard(
                1,
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
            </div>

            <div id="tut-step-2" className={wrapperCls(2)}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {en ? "Contact" : "Kontak"}
              </p>
              <div
                ref={(el) => {
                  fieldRefs.current.mobile = el;
                }}
              >
                <Field
                  label={en ? "Mobile Number *" : "Numero *"}
                  placeholder="09XX XXX XXXX"
                  value={formatMobileDisplay(form.mobile)}
                  error={fieldErrors.mobile}
                  onChange={(e: any) => {
                    set("mobile", formatMobileDisplay(e.target.value));
                    clearErr("mobile");
                  }}
                />
              </div>
              {renderTutorialCard(
                2,
                "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          </>
        )}

        {wizardStep === 3 && (
          <>
            <div id="tut-step-1" className={wrapperCls(1)}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {en ? "Account Security" : "Seguridad ng Account"}
              </p>
              <div
                ref={(el) => {
                  fieldRefs.current.password = el;
                }}
              >
                <Field
                  label={en ? "Password *" : "Password *"}
                  type="password"
                  description={
                    en
                      ? "8+ chars, a number, a special char."
                      : "8+ karakter, may numero at special char."
                  }
                  value={form.password}
                  error={fieldErrors.password}
                  onChange={(e: any) => {
                    set("password", e.target.value);
                    clearErr("password");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.confirm_password = el;
                }}
              >
                <Field
                  label={en ? "Confirm Password *" : "Kumpirmahin *"}
                  type="password"
                  value={form.confirm_password}
                  error={fieldErrors.confirm_password}
                  onChange={(e: any) => {
                    set("confirm_password", e.target.value);
                    clearErr("confirm_password");
                  }}
                />
              </div>
              {renderTutorialCard(
                1,
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
            </div>

            <div id="tut-step-2" className={wrapperCls(2)}>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {en ? "Account Recovery" : "Pagbawi ng Account"}
              </p>
              <div
                ref={(el) => {
                  fieldRefs.current.security_question = el;
                }}
              >
                <Select
                  label={en ? "Security Question 1 *" : "Tanong 1 *"}
                  options={SECURITY_QUESTIONS.map((q: any) => (en ? q.en : q.fil))}
                  value={
                    form.security_question
                      ? en
                        ? SECURITY_QUESTIONS.find((q: any) => q.key === form.security_question)?.en
                        : SECURITY_QUESTIONS.find((q: any) => q.key === form.security_question)?.fil
                      : ""
                  }
                  error={fieldErrors.security_question}
                  onChange={(v: string) => {
                    const q = SECURITY_QUESTIONS.find((q: any) => (en ? q.en : q.fil) === v);
                    set("security_question", q?.key || "");
                    clearErr("security_question");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.security_answer = el;
                }}
              >
                <Field
                  label={en ? "Your Answer *" : "Sagot *"}
                  value={form.security_answer}
                  error={fieldErrors.security_answer}
                  onChange={(e: any) => {
                    set("security_answer", e.target.value);
                    clearErr("security_answer");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.security_question_2 = el;
                }}
              >
                <Select
                  label={en ? "Security Question 2 *" : "Tanong 2 *"}
                  options={SECURITY_QUESTIONS.filter(
                    (q: any) => q.key !== form.security_question,
                  ).map((q: any) => (en ? q.en : q.fil))}
                  value={
                    form.security_question_2
                      ? en
                        ? SECURITY_QUESTIONS.find((q: any) => q.key === form.security_question_2)
                            ?.en
                        : SECURITY_QUESTIONS.find((q: any) => q.key === form.security_question_2)
                            ?.fil
                      : ""
                  }
                  error={fieldErrors.security_question_2}
                  onChange={(v: string) => {
                    const q = SECURITY_QUESTIONS.find((q: any) => (en ? q.en : q.fil) === v);
                    set("security_question_2", q?.key || "");
                    clearErr("security_question_2");
                  }}
                />
              </div>
              <div
                ref={(el) => {
                  fieldRefs.current.security_answer_2 = el;
                }}
              >
                <Field
                  label={en ? "Your Answer *" : "Sagot *"}
                  value={form.security_answer_2}
                  error={fieldErrors.security_answer_2}
                  onChange={(e: any) => {
                    set("security_answer_2", e.target.value);
                    clearErr("security_answer_2");
                  }}
                />
              </div>

              <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-[11px] leading-relaxed text-slate-500">
                <strong className="text-[#f5a623]">
                  {en ? "DATA PRIVACY CONSENT" : "PAHINTULOT SA DATA PRIVACY"}
                </strong>{" "}
                —{" "}
                {en
                  ? "Under RA 10173, your data will be used solely for the Fuel Subsidy Program."
                  : "Alinsunod sa RA 10173, gagamitin lamang ang datos para sa Fuel Subsidy Program."}
              </div>
              <label className="flex items-start gap-2 text-[12px] text-slate-500">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                />
                {en
                  ? "I consent to the collection and processing of my personal data."
                  : "Pumapayag ako sa pagkolekta at pagproseso ng aking datos."}
              </label>
              {fieldErrors.consent && (
                <span className="text-[11px] font-semibold text-red-500">
                  ⚠️ {fieldErrors.consent}
                </span>
              )}
              {renderTutorialCard(
                2,
                "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={goNext}
          className="flex-1 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] shadow-sm"
        >
          {wizardStep < 3
            ? en
              ? "Continue"
              : "Magpatuloy"
            : en
              ? "Continue to Verification"
              : "Magpatuloy sa Verification"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        {en ? "Already have an account?" : "Mayroon nang account?"}{" "}
        <Link to="/login" className="font-bold text-[#f5a623] underline hover:text-[#1b2b4b]">
          {en ? "Sign in" : "Mag-sign in"}
        </Link>
      </p>
    </MobileShell>
  );
}
