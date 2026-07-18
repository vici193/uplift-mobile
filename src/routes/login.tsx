import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Loader2, AlertTriangle, ShieldAlert, HelpCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/uplift-logo.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const tutSteps = (en: boolean) => [
  {
    text: en
      ? "Look for the language button in the top-left corner of any screen to switch between English and Filipino. It's available everywhere in the app, not just here."
      : "Hanapin ang pindutan ng wika sa kaliwang itaas ng kahit anong pahina upang magpalit sa pagitan ng Ingles at Filipino. Maaari itong gamitin saanman sa aplikasyon, hindi lamang dito.",
    target: "global-lang-toggle",
  },
  {
    text: en
      ? "Enter your registered mobile number and secure password here to access your account."
      : "Ilagay ang iyong nakarehistrong numero ng telepono at ligtas na password rito upang mabuksan ang iyong account.",
    target: "tut-step-2",
  },
  {
    text: en
      ? "Don't have an account yet? Click here to register and create your PARA profile."
      : "Wala ka pang rehistro? Pindutin ito upang magrehistro at gumawa ng iyong pagkakakilanlan sa PARA.",
    target: "tut-step-3",
  },
  {
    text: en
      ? "If you forgot your password or changed your mobile number, use these links to recover your account."
      : "Kung nakalimutan mo ang iyong password o nagpalit ka ng numero, gamitin ang mga pagpipiliang ito upang mabawi ang iyong account.",
    target: "tut-step-4",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, en } = useSession();
  const [tutStep, setTutStep] = useState(0);
  const steps = tutSteps(en);

  useEffect(() => {
    if (tutStep > 0) {
      // Skip scrolling for Step 1 because the language toggle is a fixed element
      if (tutStep === 1) return;

      const target = steps[tutStep - 1]?.target;
      const el = document.getElementById(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        const targetScrollY = window.scrollY + rect.top - window.innerHeight * 0.18;
        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }
    }
  }, [tutStep, en]);

  useEffect(() => {
    const langHighlightClasses = [
      "z-[250]",
      "!bg-white",
      "ring-4",
      "ring-[#f5a623]",
      "scale-110",
      "shadow-2xl",
    ];
    const btn = document.getElementById("global-lang-toggle");
    if (!btn) return;
    if (tutStep === 1) btn.classList.add(...langHighlightClasses);
    else btn.classList.remove(...langHighlightClasses);
    return () => btn.classList.remove(...langHighlightClasses);
  }, [tutStep]);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!mobile || !password) return;
    setLoading(true);
    setError("");

    const { supabase } = await import("@/supabase");
    const { data } = await supabase
      .from("drivers")
      .select("id, password")
      .eq("mobile", mobile)
      .single();

    if (!data) {
      setLoading(false);
      setError(
        en
          ? "Mobile number not found. Please sign up first."
          : "Hindi nahanap ang numero ng telepono. Mangyaring magrehistro muna.",
      );
      return;
    }
    if (data.password !== password) {
      setLoading(false);
      setError(
        en
          ? "Incorrect password. Please try again."
          : "Mali ang password. Mangyaring subukan muli.",
      );
      return;
    }

    await handleLogin(mobile, () => {
      setLoading(false);
      navigate({ to: "/home" });
    });
  };

  const renderTutorialCard = (stepNum: number, positionClasses: string) => {
    if (tutStep !== stepNum) return null;
    return (
      <div className={`absolute z-[300] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl ${positionClasses}`}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
            {tutStep}/{steps.length}
          </div>
          <h3 className="text-lg font-bold text-white">
            {en ? "Sign-In Guide" : "Gabay sa Pagpasok"}
          </h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{steps[tutStep - 1].text}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setTutStep(0)}
            className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            {en ? "Skip" : "Laktawan"}
          </button>
          <button
            onClick={() => (tutStep < steps.length ? setTutStep((s) => s + 1) : setTutStep(0))}
            className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
          >
            {tutStep === steps.length ? (en ? "Finish" : "Tapusin") : en ? "Next" : "Susunod"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-x-hidden overflow-y-auto bg-slate-50 font-sans text-[#1b2b4b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#1b2b4b_1.5px,transparent_1.5px)] bg-[length:24px_24px] opacity-[0.02] mix-blend-overlay" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f5a623] opacity-[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-[#1b2b4b] opacity-[0.04] blur-[120px]" />

      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-slate-50/90 px-6 pb-4 pt-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#1b2b4b] shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-semibold tracking-wide text-[#1b2b4b]">LOGIN</h1>
        </div>
        <button
          onClick={() => setTutStep(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#f5a623] shadow-sm"
          title={en ? "Open Tutorial" : "Buksan ang Gabay"}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

      {/* FIXED: Uses fixed positioning to perfectly align right above the globally fixed language button */}
      {tutStep === 1 && (
        <div className="fixed bottom-38 left-14 sm:left-6 z-[300] w-[300px] sm:w-[320px] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">1/{steps.length}</div>
            <h3 className="text-lg font-bold text-white">{en ? "Sign-In Guide" : "Gabay sa Pagpasok"}</h3>
          </div>
          <p className="mb-6 text-sm text-white/80">{steps[0].text}</p>
          <div className="flex gap-3">
            <button onClick={() => setTutStep(0)} className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">{en ? "Skip" : "Laktawan"}</button>
            <button onClick={() => setTutStep(2)} className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95">{en ? "Next" : "Susunod"}</button>
          </div>
        </div>
      )}

      <div className="relative flex flex-col px-6 pb-8 pt-2">
        <div className="mx-auto flex h-28 w-28 items-center justify-center">
          <img
            src={logo}
            alt="UPLIFT"
            className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(245,166,35,0.2)]"
          />
        </div>

        <h1 className="mt-4 text-center text-3xl font-bold text-[#1b2b4b]">
          {en ? "Welcome back to" : "Maligayang pagbabalik sa"}{" "}
          <span className="text-[#f5a623]">PARA!</span>
        </h1>
        <p className="mt-2 text-center text-[13px] font-medium text-slate-500">
          {en
            ? "Sign in to continue managing your subsidies."
            : "Mag Sign-in upang ipagpatuloy ang pamamahala ng iyong subsidy."}
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            {error}
          </div>
        )}

        <div
          id="tut-step-2"
          className={cn(
            "mt-10 flex flex-col gap-4 rounded-2xl transition-all",
            tutStep === 2 ? "relative z-[250] bg-white p-4 shadow-2xl ring-4 ring-[#f5a623]" : ""
          )}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-[#1b2b4b]">
              {en ? "Mobile number" : "Numero ng Telepono"}
            </span>
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all shadow-sm ${
                tutStep === 2
                  ? "border-slate-200 bg-white"
                  : "border-slate-200 bg-white focus-within:border-[#f5a623] focus-within:ring-4 focus-within:ring-[#f5a623]/10"
              }`}
            >
              <Phone
                className={`h-5 w-5 ${tutStep === 2 ? "text-[#1b2b4b]/60" : "text-slate-400"}`}
              />
              <input
                placeholder="09XX XXX XXXX"
                className="flex-1 bg-transparent text-[15px] font-medium text-[#1b2b4b] outline-none placeholder:text-slate-400"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-[#1b2b4b]">
              {en ? "Password" : "password"}
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={en ? "Enter your password" : "Ilagay ang iyong password"}
                className={`w-full rounded-2xl border px-4 py-3.5 pr-12 text-[15px] font-medium outline-none shadow-sm transition-all placeholder:text-slate-400 ${
                  tutStep === 2
                    ? "border-slate-200 bg-white text-[#1b2b4b]"
                    : "border-slate-200 bg-white text-[#1b2b4b] focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${tutStep === 2 ? "text-slate-400 hover:text-[#1b2b4b]" : "text-slate-400 hover:text-[#1b2b4b]"}`}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {renderTutorialCard(2, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]")}
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="relative z-10 mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_20px_rgba(245,166,35,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(245,166,35,0.3)] active:scale-95 disabled:scale-100 disabled:opacity-70"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin text-[#1b2b4b]" />}
          {loading ? (en ? "Signing in..." : "Signing-in...") : en ? "Sign In" : "Sign In"}
        </button>

        <div
          id="tut-step-4"
          className={cn(
            "mt-8 flex justify-between rounded-2xl text-[13px] font-semibold transition-all",
            tutStep === 4 ? "relative z-[250] bg-white px-4 py-3 shadow-2xl ring-4 ring-[#f5a623]" : "px-2"
          )}
        >
          <Link
            to="/forgot-password"
            className="text-slate-500 underline underline-offset-4 transition-colors hover:text-[#f5a623]"
          >
            {en ? "Forgot password?" : "Nakalimutan ang password?"}
          </Link>
          <Link
            to="/change-number"
            className="text-slate-500 underline underline-offset-4 transition-colors hover:text-[#f5a623]"
          >
            {en ? "Changed your number?" : "Nagpalit ng numero?"}
          </Link>
          {renderTutorialCard(4, "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]")}
        </div>

        <div className="relative z-10 mt-8 flex items-start gap-3 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/10 p-4 text-[12px] leading-relaxed text-[#1b2b4b] shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#f5a623]" />
          <p>
            <strong className="font-bold text-[#f5a623]">
              {en ? "Security Note:" : "Paalala sa Kaligtasan:"}
            </strong>{" "}
            {en
              ? "PARA will never ask for your password or OTP over calls or SMS."
              : "Hindi kailanman hihingiin ng PARA ang iyong password o kodigo sa pamamagitan ng tawag o mensahe."}
          </p>
        </div>

        <div
          id="tut-step-3"
          className={cn(
            "mt-8 text-center text-sm font-medium transition-all",
            tutStep === 3 ? "relative z-[250] rounded-2xl bg-white p-3 shadow-2xl ring-4 ring-[#f5a623] text-[#1b2b4b]" : "text-slate-500"
          )}
        >
          {en ? "No account yet?" : "Wala ka pang rehistro?"}{" "}
          <Link
            to="/signup"
            className="font-bold text-[#f5a623] underline underline-offset-4 transition-all hover:text-[#1b2b4b]"
          >
            {en ? "Sign up" : "Magrehistro"}
          </Link>
          {renderTutorialCard(3, "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]")}
        </div>
      </div>
    </MobileShell>
  );
}