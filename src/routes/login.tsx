import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Loader2, AlertTriangle, ShieldAlert, HelpCircle } from "lucide-react";
import logo from "@/assets/uplift-logo.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const tutSteps = (en: boolean) => [
  {
    text: en
      ? "Click this button at the top right if you want to change the interface language between English and Filipino."
      : "I-click ang button na ito sa kanang itaas kung gusto mong palitan ang wika ng interface sa Ingles o Filipino.",
  },
  {
    text: en
      ? "Enter your registered mobile number and your secure password here to access your account."
      : "Ilagay ang iyong rehistradong numero ng telepono at secure na password dito upang ma-access ang iyong account.",
  },
  {
    text: en
      ? "Don't have an account yet? Click here to register and create your UPLIFT profile."
      : "Wala ka pang account? I-click ito para mag-rehistro at gumawa ng iyong UPLIFT profile.",
  },
  {
    text: en
      ? "If you forgot your password or changed your mobile number, use these links to recover your account."
      : "Kung nakalimutan mo ang iyong password o nagpalit ka ng numero, gamitin ang mga link na ito upang mabawi ang iyong account.",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, en, setLang } = useSession();
  const [tutStep, setTutStep] = useState(0);
  const steps = tutSteps(en);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!mobile || !password) return;
    setLoading(true);
    setError("");

    // handleLogin looks up by mobile+password against the `drivers` table (real Supabase logic)
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
          : "Hindi nahanap ang numero. Mag-sign up muna.",
      );
      return;
    }
    if (data.password !== password) {
      setLoading(false);
      setError(en ? "Incorrect password. Please try again." : "Mali ang password. Subukan muli.");
      return;
    }

    await handleLogin(mobile, () => {
      setLoading(false);
      navigate({ to: "/home" });
    });
  };

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-x-hidden overflow-y-auto bg-[#1b2b4b] font-sans text-[#ffffff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_1.5px,transparent_1.5px)] bg-[length:24px_24px] opacity-[0.07] mix-blend-overlay" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f5a623] opacity-10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-[#ffffff] opacity-5 blur-[120px]" />

      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-[#1b2b4b]/90 px-6 pb-4 pt-8 backdrop-blur-md">
        <h1 className="text-xl font-semibold tracking-wide text-[#ffffff]">LOGIN</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTutStep(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ffffff]/20 bg-[#ffffff]/10 text-[#f5a623]"
            title={en ? "Open Tutorial" : "Buksan ang Tutorial"}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            id="tut-step-0"
            onClick={() => setLang((l) => (l === "en" ? "fil" : "en"))}
            className={`rounded-full border border-[#ffffff]/20 bg-[#ffffff]/10 px-3 py-1.5 text-xs font-semibold text-[#ffffff] transition-all ${tutStep === 1 ? "relative z-[250] ring-4 ring-[#f5a623]" : ""}`}
          >
            {en ? "Filipino" : "English"}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col px-6 pb-8 pt-2">
        <div className="mx-auto flex h-28 w-28 items-center justify-center">
          <img
            src={logo}
            alt="UPLIFT"
            className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]"
          />
        </div>

        <h1 className="mt-4 text-center text-3xl font-bold text-[#ffffff]">
          {en ? "Welcome back to," : "Maligayang pagbabalik sa,"}{" "}
          <span className="text-[#f5a623]">UPLIFT!</span>
        </h1>
        <p className="mt-2 text-center text-[13px] font-medium text-[#8c8b88]">
          {en
            ? "Sign in to continue managing your subsidies."
            : "Mag-sign in para ipagpatuloy ang pamamahala ng iyong subsidy."}
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-400/10 p-3 text-[13px] text-white">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        <label
          id="tut-step-2"
          className={`mt-10 flex flex-col gap-1.5 rounded-2xl transition-all ${tutStep === 2 ? "relative z-[250] bg-[#1b2b4b] p-3 ring-4 ring-[#f5a623]" : ""}`}
        >
          <span className="text-[13px] font-semibold text-[#ffffff]">
            {en ? "Mobile number" : "Numero ng Telepono"}
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-[#ffffff]/20 bg-[#ffffff]/5 px-4 py-3.5 transition-all focus-within:border-[#f5a623] focus-within:bg-[#ffffff]/10 focus-within:ring-4 focus-within:ring-[#f5a623]/10">
            <Phone className="h-5 w-5 text-[#8c8b88]" />
            <input
              placeholder="09XX XXX XXXX"
              className="flex-1 bg-transparent text-[15px] font-medium text-[#ffffff] outline-none placeholder:text-[#8c8b88]/50"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
        </label>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#ffffff]">
            {en ? "Password" : "Password"}
          </span>
          <input
            type="password"
            placeholder={en ? "Enter your password" : "Ilagay ang iyong password"}
            className="w-full rounded-2xl border border-[#ffffff]/20 bg-[#ffffff]/5 px-4 py-3.5 text-[15px] font-medium text-[#ffffff] outline-none transition-all placeholder:text-[#8c8b88]/50 focus:border-[#f5a623] focus:bg-[#ffffff]/10 focus:ring-4 focus:ring-[#f5a623]/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] shadow-[0_4px_20px_rgba(245,166,35,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(245,166,35,0.4)] active:scale-95 disabled:scale-100 disabled:opacity-70"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin text-[#1b2b4b]" />}
          {loading ? (en ? "Signing in..." : "Sumasagi...") : en ? "Sign In" : "Mag-Sign In"}
        </button>

        <div
          id="tut-step-4"
          className={`mt-8 flex justify-between rounded-2xl px-2 text-[13px] font-semibold transition-all ${tutStep === 4 ? "relative z-[250] bg-[#1b2b4b] py-3 ring-4 ring-[#f5a623]" : ""}`}
        >
          <Link
            to="/forgot-password"
            className="text-[#ffffff] underline underline-offset-4 transition-colors hover:text-[#f5a623]"
          >
            {en ? "Forgot password?" : "Nakalimutan ang password?"}
          </Link>
          <Link
            to="/change-number"
            className="text-[#ffffff] underline underline-offset-4 transition-colors hover:text-[#f5a623]"
          >
            {en ? "Changed your number?" : "Nagpalit ng numero?"}
          </Link>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/10 p-4 text-[12px] leading-relaxed text-[#ffffff] shadow-[inset_0_0_15px_rgba(245,166,35,0.05)]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#f5a623]" />
          <p>
            <strong className="font-bold text-[#f5a623]">
              {en ? "Security Note:" : "Paalala sa Seguridad:"}
            </strong>{" "}
            {en
              ? "UPLIFT will never ask for your password or OTP over calls or SMS."
              : "Hindi kailanman hihingi ang UPLIFT ng password o OTP sa tawag o SMS."}
          </p>
        </div>

        <p
          id="tut-step-3"
          className={`mt-8 text-center text-sm font-medium text-[#8c8b88] transition-all ${tutStep === 3 ? "relative z-[250] rounded-2xl bg-[#1b2b4b] p-3 ring-4 ring-[#f5a623]" : ""}`}
        >
          {en ? "No account yet?" : "Wala pang account?"}{" "}
          <Link
            to="/signup"
            className="font-bold text-[#f5a623] underline underline-offset-4 transition-all hover:text-[#ffffff]"
          >
            {en ? "Sign up" : "Mag-sign up"}
          </Link>
        </p>
      </div>

      {tutStep > 0 && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-6 backdrop-blur-[2px]">
          <div className="w-full max-w-xs rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
                {tutStep}/{steps.length}
              </div>
              <h3 className="text-lg font-bold text-white">
                {en ? "Sign-In Guide" : "Gabay sa Pag-Sign In"}
              </h3>
            </div>
            <p className="mb-6 text-sm text-white/80">{steps[tutStep - 1].text}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setTutStep(0)}
                className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white"
              >
                {en ? "Skip" : "Laktawan"}
              </button>
              <button
                onClick={() => (tutStep < steps.length ? setTutStep((s) => s + 1) : setTutStep(0))}
                className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b]"
              >
                {tutStep === steps.length ? (en ? "Finish" : "Tapusin") : en ? "Next" : "Susunod"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
