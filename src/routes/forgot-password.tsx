/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, HelpCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";
import { securityQuestionLabel } from "@/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

const tutSteps = (en: boolean) => [
  en
    ? "This is the 4-step process to recover your account. Enter the mobile number registered to your account to begin."
    : "Ito ang 4-hakbang na proseso para mabawi ang iyong account. Ilagay ang numerong nakarehistro sa iyong account para magsimula.",
  en
    ? "Your account has been found. Now answer your first security question."
    : "Nahanap na ang iyong account. Sagutin ngayon ang iyong unang security question.",
  en
    ? "One more question to go. Answer your second security question."
    : "Isa pang tanong na lang. Sagutin ang iyong pangalawang security question.",
  en
    ? "Almost done! Set your new password, confirm it, then submit to complete the reset."
    : "Halos tapos na! Itakda ang bagong password, kumpirmahin ito, pagkatapos isumite para makumpleto ang pag-reset.",
];

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { en } = useSession();

  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [tutStep, setTutStep] = useState(0);
  const steps = tutSteps(en);

  useEffect(() => {
    if (tutStep > 0) setTutStep(step);
  }, [step]);

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

  async function handleFindAccount(e: any) {
    e.preventDefault();
    if (!mobile) return;
    setLoading(true);
    setError("");
    const { data } = await supabase
      .from("drivers")
      .select("id, security_question, security_question_2")
      .eq("mobile", mobile)
      .single();
    setLoading(false);
    if (!data) {
      setError(en ? "Mobile number not found." : "Hindi nahanap ang numero.");
      return;
    }
    if (!data.security_question || !data.security_question_2) {
      setError(
        en
          ? "This account doesn't have both security questions set up. Please contact support."
          : "Kulang ang security questions ng account na ito. Makipag-ugnayan sa suporta.",
      );
      return;
    }
    setSecurityQuestion(data.security_question);
    setSecurityQuestion2(data.security_question_2);
    setStep(2);
  }

  async function handleVerifyFirstAnswer(e: any) {
    e.preventDefault();
    if (!securityAnswer) return;
    setLoading(true);
    setError("");
    const { data } = await supabase
      .from("drivers")
      .select("security_answer")
      .eq("mobile", mobile)
      .single();
    setLoading(false);
    if (data?.security_answer !== securityAnswer.trim().toLowerCase()) {
      setError(en ? "Incorrect answer. Please try again." : "Maling sagot. Subukan muli.");
      return;
    }
    setStep(3);
  }

  async function handleVerifySecondAnswer(e: any) {
    e.preventDefault();
    if (!securityAnswer2) return;
    setLoading(true);
    setError("");
    const { data } = await supabase
      .from("drivers")
      .select("security_answer_2")
      .eq("mobile", mobile)
      .single();
    setLoading(false);
    if (data?.security_answer_2 !== securityAnswer2.trim().toLowerCase()) {
      setError(en ? "Incorrect answer. Please try again." : "Maling sagot. Subukan muli.");
      return;
    }
    setStep(4);
  }

  function validateNewPassword() {
    if (newPassword.length < 8)
      return en
        ? "Password must be at least 8 characters."
        : "Dapat hindi bababa sa 8 karakter ang password.";
    if (!/[0-9]/.test(newPassword))
      return en
        ? "Password must contain at least one number."
        : "Dapat may kasamang numero ang password.";
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPassword))
      return en
        ? "Password must contain at least one special character."
        : "Dapat may kasamang special character ang password.";
    if (newPassword !== confirmPassword)
      return en ? "Passwords do not match." : "Hindi magkatugma ang mga password.";
    return null;
  }

  async function handleResetPassword(e: any) {
    e.preventDefault();
    const pwError = validateNewPassword();
    if (pwError) {
      setError(pwError);
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase
      .from("drivers")
      .update({ password: newPassword })
      .eq("mobile", mobile);
    setLoading(false);
    if (err) {
      setError(
        en ? "Something went wrong. Please try again." : "May nangyaring mali. Subukan muli.",
      );
      return;
    }
    setSuccess(true);
  }

  const highlightCls = (n: number) =>
    tutStep === n ? "relative z-[250] bg-white p-4 shadow-2xl ring-4 ring-[#f5a623]" : "";
  const labelCls = (n: number) => "text-[#1b2b4b]";
  const inputCls = (n: number) =>
    tutStep === n
      ? "border-slate-300 bg-slate-50 text-[#1b2b4b]"
      : "border-slate-200 bg-white text-[#1b2b4b] shadow-sm focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/10";

  const renderTutorialCard = (stepNum: number, positionClasses: string) => {
    if (tutStep !== stepNum) return null;
    return (
      <div className={`absolute z-[300] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl ${positionClasses}`}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
            {tutStep}/4
          </div>
          <h3 className="text-lg font-bold text-white">
            {en ? "Forgot Password Guide" : "Gabay sa Nakalimutang Password"}
          </h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{steps[tutStep - 1]}</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            setTutStep(0);
          }}
          className="w-full rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
        >
          {en ? "Got it" : "Nakuha ko"}
        </button>
      </div>
    );
  };

  if (success) {
    return (
      <MobileShell className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-[#1b2b4b]">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-xl font-bold">
          {en ? "Password reset successful." : "Matagumpay na na-reset ang password."}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {en
            ? "You can now sign in with your new password."
            : "Maaari ka nang mag-sign in gamit ang bagong password."}
        </p>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="mt-6 w-full rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] shadow-sm"
        >
          {en ? "Go to Sign In" : "Pumunta sa Sign In"}
        </button>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 px-6 pb-8 pt-10 text-[#1b2b4b]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-wide">
          {en ? "Forgot Password" : "Nakalimutan ang Password"}
        </h1>
        <button
          onClick={() => setTutStep(step)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#f5a623] shadow-sm"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

      <div className="relative z-10 mt-6 flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${step >= n ? "bg-[#f5a623]" : "bg-slate-200"}`}
          />
        ))}
      </div>

      {error && (
        <div className="relative z-10 mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" /> {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleFindAccount} className="mt-6 flex flex-col gap-4">
          <div id="tut-step-1" className={`rounded-2xl transition-all ${highlightCls(1)}`}>
            <label className={`text-[13px] font-semibold ${labelCls(1)}`}>
              {en ? "Mobile Number" : "Numero ng Telepono"}
            </label>
            <input
              className={`mt-1.5 w-full rounded-2xl border px-4 py-3.5 text-[15px] font-medium outline-none transition-all ${inputCls(1)}`}
              placeholder="09XX XXX XXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            {renderTutorialCard(1, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]")}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="relative z-10 mt-2 flex items-center justify-center gap-2 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] shadow-sm disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}{" "}
            {loading ? "..." : en ? "Continue" : "Magpatuloy"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyFirstAnswer} className="mt-6 flex flex-col gap-4">
          <div className="relative z-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
            ✓ {en ? `Account found for ${mobile}` : `Nahanap ang account para sa ${mobile}`}
          </div>
          <div id="tut-step-2" className={`rounded-2xl transition-all ${highlightCls(2)}`}>
            <label className={`text-[13px] font-semibold ${labelCls(2)}`}>
              {securityQuestionLabel(securityQuestion, en)}
            </label>
            <input
              className={`mt-1.5 w-full rounded-2xl border px-4 py-3.5 text-[15px] font-medium outline-none transition-all ${inputCls(2)}`}
              placeholder={en ? "Your answer" : "Sagot mo"}
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
            <p className={`mt-1 text-[11px] text-slate-500`}>
              {en ? "Not case-sensitive." : "Hindi case-sensitive."}
            </p>
            {renderTutorialCard(2, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]")}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="relative z-10 mt-2 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] shadow-sm disabled:opacity-60"
          >
            {loading ? "..." : en ? "Verify Answer" : "I-verify ang Sagot"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="relative z-10 text-center text-[13px] text-slate-500 hover:text-[#1b2b4b]"
          >
            ← {en ? "Back" : "Bumalik"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleVerifySecondAnswer} className="mt-6 flex flex-col gap-4">
          <div className="relative z-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
            ✓ {en ? "First question correct." : "Tama ang unang tanong."}
          </div>
          <div id="tut-step-3" className={`rounded-2xl transition-all ${highlightCls(3)}`}>
            <label className={`text-[13px] font-semibold ${labelCls(3)}`}>
              {securityQuestionLabel(securityQuestion2, en)}
            </label>
            <input
              className={`mt-1.5 w-full rounded-2xl border px-4 py-3.5 text-[15px] font-medium outline-none transition-all ${inputCls(3)}`}
              placeholder={en ? "Your answer" : "Sagot mo"}
              value={securityAnswer2}
              onChange={(e) => setSecurityAnswer2(e.target.value)}
            />
            <p className={`mt-1 text-[11px] text-slate-500`}>
              {en ? "Not case-sensitive." : "Hindi case-sensitive."}
            </p>
            {renderTutorialCard(3, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]")}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="relative z-10 mt-2 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] shadow-sm disabled:opacity-60"
          >
            {loading ? "..." : en ? "Verify Answer" : "I-verify ang Sagot"}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="relative z-10 text-center text-[13px] text-slate-500 hover:text-[#1b2b4b]"
          >
            ← {en ? "Back" : "Bumalik"}
          </button>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
          <div className="relative z-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
            ✓{" "}
            {en
              ? "Identity confirmed. Set your new password."
              : "Nakumpirma ang pagkakakilanlan. Itakda ang bagong password."}
          </div>
          <div
            id="tut-step-4"
            className={`flex flex-col gap-4 rounded-2xl transition-all ${highlightCls(4)}`}
          >
            <div>
              <label className={`text-[13px] font-semibold ${labelCls(4)}`}>
                {en ? "New Password" : "Bagong Password"}
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showNewPw ? "text" : "password"}
                  className={`w-full rounded-2xl border px-4 py-3.5 pr-12 text-[15px] font-medium outline-none transition-all ${inputCls(4)}`}
                  placeholder={en ? "Enter new password" : "Ilagay ang bagong password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1b2b4b]"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className={`mt-1 text-[11px] text-slate-500`}>
                {en
                  ? "At least 8 characters, with a number and a special character."
                  : "Hindi bababa sa 8 karakter, may numero at special character."}
              </p>
            </div>
            <div>
              <label className={`text-[13px] font-semibold ${labelCls(4)}`}>
                {en ? "Confirm New Password" : "Kumpirmahin ang Bagong Password"}
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  className={`w-full rounded-2xl border px-4 py-3.5 pr-12 text-[15px] font-medium outline-none transition-all ${inputCls(4)}`}
                  placeholder={en ? "Re-enter new password" : "Ulitin ang bagong password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1b2b4b]"
                  tabIndex={-1}
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {renderTutorialCard(4, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]")}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="relative z-10 mt-2 rounded-full bg-[#f5a623] py-4 font-bold text-[#1b2b4b] shadow-sm disabled:opacity-60"
          >
            {loading ? "..." : en ? "Reset Password" : "I-reset ang Password"}
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="relative z-10 text-center text-[13px] text-slate-500 hover:text-[#1b2b4b]"
          >
            ← {en ? "Back" : "Bumalik"}
          </button>
        </form>
      )}

      <p className="relative z-10 mt-6 text-center text-[13px] text-slate-500">
        <Link to="/login" className="underline hover:text-[#f5a623]">
          ← {en ? "Back to Sign In" : "Bumalik sa Sign In"}
        </Link>
      </p>
    </MobileShell>
  );
}