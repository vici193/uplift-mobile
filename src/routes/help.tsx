/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ChevronRight, HelpCircle, ListChecks, Flag } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ appId: z.string().optional() });

export const Route = createFileRoute("/help")({
  component: HelpPage,
  validateSearch: searchSchema,
});

function getBusinessDaysStr(fromDate: string | Date) {
  const base = new Date(fromDate);
  const d5 = new Date(base);
  d5.setDate(d5.getDate() + 5);
  const d7 = new Date(base);
  d7.setDate(d7.getDate() + 7);
  const opts: any = { month: "short", day: "numeric" };
  return `${d5.toLocaleDateString("en-US", opts)} – ${d7.toLocaleDateString("en-US", opts)}`;
}

function ConcernThread({ concerns, en }: { concerns: any[]; en: boolean }) {
  if (!concerns || concerns.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="mb-2 text-[13px] font-bold text-[#1b2b4b]">
        💬{" "}
        {en ? "Your previous messages on this topic:" : "Mga nakaraang mensahe mo sa paksang ito:"}
      </div>
      {concerns.map((c: any) => (
        <div key={c.id} className="mb-2.5">
          <div className="rounded-2xl bg-[#f8f9fa] p-3 text-sm text-[#1b2b4b]">
            <div className="mb-1 text-[11px] text-[#8c8b88]">
              {c.is_draft || c.status === "draft" ? (
                <span className="font-semibold text-[#f5a623]">📝 {en ? "Draft" : "Draft"}</span>
              ) : (
                <span>
                  {en ? "You" : "Ikaw"} · {new Date(c.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
            {c.message}
          </div>
          {c.admin_reply && (
            <div className="mt-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-[#1b2b4b]">
              <div className="mb-1 text-[11px] font-bold text-emerald-700">
                🏛️ {en ? "Response from Agency" : "Tugon mula sa Ahensya"} ·{" "}
                {c.replied_at ? new Date(c.replied_at).toLocaleDateString() : ""}
              </div>
              {c.admin_reply}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getTutSteps(en: boolean, selectedApp: any) {
  if (!selectedApp) {
    return [
      {
        title: en ? "My Concerns" : "Aking mga Alalahanin",
        desc: en
          ? "Already sent a concern before? Tap here to see all your past questions and their replies in one place."
          : "May naipadala ka na bang alalahanin dati? Pindutin ito upang makita ang lahat ng iyong mga nakaraang tanong at tugon.",
        target: "tut-my-concerns",
      },
      {
        title: en ? "Select Application" : "Pumili ng Aplikasyon",
        desc: en
          ? "Pick which subsidy application your question is about to get started."
          : "Piliin kung aling aplikasyon para sa subsidy ang tungkol sa iyong tanong upang makapagsimula.",
        target: "tut-app-list",
      },
    ];
  }

  const steps = [
    {
      title: en ? "Application Context" : "Detalye ng Aplikasyon",
      desc: en
        ? "This shows which subsidy application your question will be about."
        : "Ipinapakita nito kung aling aplikasyon para sa subsidy ang tungkol sa iyong tanong.",
      target: "tut-context-header",
    },
    {
      title: en ? "Choose a Topic" : "Pumili ng Paksa",
      desc: en
        ? "Pick the topic that best matches your question — each one leads to a quick, specific answer."
        : "Piliin ang paksang pinakaakma sa iyong tanong — bawat isa ay may mabilis at tiyak na kasagutan.",
      target: "tut-category-list",
    },
  ];

  if (selectedApp.status === "rejected") {
    steps.push({
      title: en ? "File a Grievance" : "Maghain ng Reklamo",
      desc: en
        ? "Since this application was rejected, you also have the option to file a formal grievance if you disagree with the decision."
        : "Dahil tinanggihan ang aplikasyong ito, mayroon ka ring pagpipilian na maghain ng reklamo kung hindi ka sumasang-ayon sa pasya.",
      target: "tut-grievance-btn",
    });
  }

  return steps;
}

function HelpPage() {
  const navigate = useNavigate();
  const { appId } = Route.useSearch();
  const { en, apps, driverId } = useSession();

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [subQuestion, setSubQuestion] = useState<any>(null);
  const [escalateMessage, setEscalateMessage] = useState(
    () => sessionStorage.getItem("uplift_help_draft") || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [concerns, setConcerns] = useState<any[]>([]);
  const [autoSaveTimer, setAutoSaveTimer] = useState<any>(null);
  const currentDraftIdRef = useRef<string | null>(null);

  const [tutStep, setTutStep] = useState(0);

  // Arriving from a specific application's "Need help?" button skips straight to
  // that application's category screen, instead of forcing the app-picker again.
  useEffect(() => {
    if (appId && !selectedApp) {
      const match = apps.find((a: any) => a.id === appId);
      if (match) setSelectedApp(match);
    }
  }, [appId, apps]);

  useEffect(() => setTutStep(0), [selectedApp]);
  useEffect(() => {
    if (category) setTutStep(0);
  }, [category]);

  // Scroll smoothly to the currently highlighted target element
  useEffect(() => {
    if (tutStep > 0) {
      const steps = getTutSteps(en, selectedApp);
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
  }, [tutStep, en, selectedApp]);

  async function loadConcerns(appId: string, concernType: string) {
    const { data } = await supabase
      .from("grievances")
      .select("*")
      .eq("driver_id", driverId)
      .eq("application_id", appId)
      .eq("concern_type", concernType)
      .order("created_at", { ascending: true });
    setConcerns(data || []);
    if (data) {
      for (const c of data) {
        if (c.admin_reply && !c.driver_seen_reply) {
          await supabase.from("grievances").update({ driver_seen_reply: true }).eq("id", c.id);
        }
      }
    }
  }

  function handleMessageChange(value: string) {
    setEscalateMessage(value);
    sessionStorage.setItem("uplift_help_draft", value);
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(async () => {
      if (!value.trim()) {
        if (currentDraftIdRef.current) {
          await supabase.from("grievances").delete().eq("id", currentDraftIdRef.current);
          currentDraftIdRef.current = null;
        }
        sessionStorage.removeItem("uplift_help_draft");
        return;
      }
      if (!selectedApp) return;
      const concernType = subQuestion?.label || category?.label || "General Inquiry";
      if (currentDraftIdRef.current) {
        await supabase
          .from("grievances")
          .update({ draft_message: value, message: value })
          .eq("id", currentDraftIdRef.current);
      } else {
        const { data } = await supabase
          .from("grievances")
          .insert({
            driver_id: driverId,
            application_id: selectedApp.id,
            concern_type: concernType,
            message: value,
            draft_message: value,
            is_draft: true,
            status: "draft",
            is_grievance: category?.key === "grievance",
          })
          .select()
          .single();
        if (data) currentDraftIdRef.current = data.id;
      }
      await loadConcerns(selectedApp.id, concernType);
    }, 1500);
    setAutoSaveTimer(timer);
  }

  async function submitConcernFromHelp() {
    if (!escalateMessage.trim()) return;
    setSubmitting(true);
    const concernType = subQuestion?.label || category?.label || "General Inquiry";
    if (currentDraftIdRef.current) {
      await supabase
        .from("grievances")
        .update({ message: escalateMessage, is_draft: false, status: "submitted" })
        .eq("id", currentDraftIdRef.current);
    } else {
      await supabase.from("grievances").insert({
        driver_id: driverId,
        application_id: selectedApp?.id || null,
        concern_type: concernType,
        message: escalateMessage,
        is_draft: false,
        status: "submitted",
        is_grievance: category?.key === "grievance",
      });
    }
    setEscalateMessage("");
    currentDraftIdRef.current = null;
    sessionStorage.removeItem("uplift_help_draft");
    setSubmitting(false);
    await loadConcerns(selectedApp?.id, concernType);
  }

  const categories = selectedApp
    ? [
        {
          key: "timing",
          label: en
            ? "When will I receive my subsidy?"
            : "Kailan ko matatanggap ang aking subsidy?",
        },
        {
          key: "change",
          label: en
            ? "I'd like to change something about my application"
            : "Gusto kong may baguhin sa aking aplikasyon",
        },
        {
          key: "amount",
          label: en
            ? "I have a concern about the amount or eligibility"
            : "Mayroon akong alalahanin sa halaga o pagiging karapat-dapat",
        },
        {
          key: "venue",
          label: en ? "Issue at the payout venue" : "Problema sa takdang lugar ng pagbabayad",
        },
        { key: "feedback", label: en ? "General feedback" : "Pangkalahatang puna" },
        ...(selectedApp?.status === "rejected"
          ? [{ key: "grievance", label: en ? "File a Grievance" : "Maghain ng Reklamo" }]
          : []),
      ]
    : [];

  const subQuestions: Record<string, { key: string; label: string }[]> = {
    change: [
      {
        key: "wrong_personal",
        label: en
          ? "Wrong personal information (name, birthdate, etc.)"
          : "Maling personal na impormasyon (pangalan, kaarawan, atbp.)",
      },
      {
        key: "wrong_vehicle",
        label: en ? "Wrong vehicle or license details" : "Maling detalye ng sasakyan o lisensya",
      },
      {
        key: "wrong_contact",
        label: en ? "Wrong e-wallet or contact number" : "Maling e-wallet o numero ng telepono",
      },
      { key: "other_correction", label: en ? "Other correction" : "Ibang pagwawasto" },
    ],
    amount: [
      {
        key: "wrong_amount",
        label: en
          ? "I think the subsidy amount is incorrect"
          : "Sa tingin ko ay mali ang halaga ng subsidy",
      },
      {
        key: "not_eligible",
        label: en
          ? "I was told I'm not eligible — why?"
          : "Sinabihan akong hindi ako karapat-dapat — bakit?",
      },
    ],
    venue: [
      {
        key: "venue_closed",
        label: en ? "The venue was closed or moved" : "Sarado o inilipat ang takdang lugar",
      },
      {
        key: "long_line",
        label: en
          ? "Long lines or no slots left when I arrived"
          : "Mahabang pila o wala nang natirang puwang pagdating ko",
      },
      {
        key: "rider_issue",
        label: en
          ? "Issue with the officer or process at the venue"
          : "Problema sa opisyal o proseso sa takdang lugar",
      },
    ],
    feedback: [{ key: "other_feedback", label: en ? "Other" : "Iba pa" }],
    grievance: [
      {
        key: "griev_wrong_info",
        label: en
          ? "My information was incorrectly flagged"
          : "Mali ang pagkakapuna sa aking impormasyon",
      },
      {
        key: "griev_unfair",
        label: en
          ? "I believe the rejection was unfair"
          : "Naniniwala akong hindi patas ang pagtanggi",
      },
      {
        key: "griev_missing_docs",
        label: en
          ? "My documents were not properly reviewed"
          : "Hindi maayos na nasuri ang aking mga dokumento",
      },
      { key: "griev_other", label: en ? "Other grievance" : "Ibang reklamo" },
    ],
  };

  const isHighlighted = (target: string) => {
    const steps = getTutSteps(en, selectedApp);
    return tutStep > 0 && steps[tutStep - 1]?.target === target;
  };

  const renderTutorialCard = (targetId: string, positionClasses: string) => {
    const steps = getTutSteps(en, selectedApp);
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

  const ContextHeader = () =>
    selectedApp ? (
      <div className="rounded-2xl border border-[#f0f0f0] bg-[#f8f9fa] p-4">
        <p className="text-[14px] font-extrabold text-[#1b2b4b]">
          {selectedApp.payout_events?.program_name}
        </p>
        <p className="text-[12px] text-[#8c8b88]">{selectedApp.payout_events?.program_agency}</p>
        <p className="mt-1 text-[11px] text-[#8c8b88]">
          {en ? "Applied:" : "Ipinasa:"} {new Date(selectedApp.applied_at).toLocaleDateString()}
        </p>
      </div>
    ) : null;

  const EscalateBox = ({ placeholder }: { placeholder: string }) => (
    <div className="mt-4 rounded-2xl border border-[#f0f0f0] bg-white p-4">
      <p className="text-[14px] font-extrabold text-[#1b2b4b]">
        {en ? "Tell us more" : "Sabihin sa amin ang karagdagang detalye"}
      </p>
      <p className="mb-3 text-[12px] text-[#8c8b88]">
        {en
          ? "We will forward this to the concerned agency."
          : "Ipapasa namin ito sa kinauukulang ahensya."}
      </p>
      <textarea
        className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm text-[#1b2b4b] outline-none focus:border-[#f5a623]"
        placeholder={placeholder}
        value={escalateMessage}
        onChange={(e) => handleMessageChange(e.target.value)}
      />
      {escalateMessage.trim() && (
        <p className="mt-1 text-[11px] text-[#8c8b88]">
          💾 {en ? "Auto-saving draft..." : "Kusang itinatala ang burador..."}
        </p>
      )}
      <button
        onClick={submitConcernFromHelp}
        disabled={submitting}
        className="mt-3 w-full rounded-xl bg-[#1b2b4b] py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {submitting ? "..." : en ? "Submit" : "Isumite"}
      </button>
    </div>
  );

  // ── Screen 1: pick application ──
  if (!selectedApp) {
    return (
      <MobileShell bottomNav={<UserBottomNav />}>
        <TopBar
          title={en ? "Help Center" : "Sentro ng Tulong"}
          subtitle={en ? "Select a subsidy application" : "Pumili ng aplikasyon para sa subsidy"}
          right={
            <button
              onClick={() => setTutStep(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[#f5a623]"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          }
        />

        {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

        <div className="flex flex-col gap-4 px-5 pb-24 pt-4">
          <div
            id="tut-my-concerns"
            className={cn(
              "relative transition-all",
              isHighlighted("tut-my-concerns")
                ? "z-[250] rounded-2xl bg-white shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            <button
              onClick={() => navigate({ to: "/myconcern" })}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#f0f0f0] bg-white py-4 text-[13px] font-bold text-[#1b2b4b] hover:bg-gray-50"
            >
              <ListChecks className="h-4 w-4" /> {en ? "My Concerns" : "Aking mga Alalahanin"}
            </button>
            {renderTutorialCard(
              "tut-my-concerns",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          <div className="relative flex flex-col gap-3">
            {apps.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[#e6e8eb] p-10 text-center text-[#8c8b88]">
                {en ? "You have no applications yet." : "Wala ka pang aplikasyon."}
              </div>
            ) : (
              apps.map((a: any, i: number) =>
                i === 0 ? (
                  <div key={a.id} className="relative">
                    <button
                      id="tut-app-list"
                      onClick={() => setSelectedApp(a)}
                      className={cn(
                        "w-full rounded-[24px] border p-4 text-left shadow-sm transition-all hover:border-[#f5a623]/30",
                        isHighlighted("tut-app-list")
                          ? "relative z-[250] border-[#f5a623] bg-white shadow-2xl ring-4 ring-[#f5a623]"
                          : "border-[#f0f0f0] bg-white",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-[#1b2b4b]">
                          {a.payout_events?.program_name || "Subsidy"}
                        </p>
                        <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
                      </div>
                      <p className="text-[12px] text-[#8c8b88]">
                        {a.payout_events?.program_agency}
                      </p>
                    </button>
                    {renderTutorialCard(
                      "tut-app-list",
                      "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
                    )}
                  </div>
                ) : (
                  <button
                    key={a.id}
                    onClick={() => setSelectedApp(a)}
                    className="rounded-[24px] border border-[#f0f0f0] bg-white p-4 text-left shadow-sm transition-all hover:border-[#f5a623]/30"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-[#1b2b4b]">
                        {a.payout_events?.program_name || "Subsidy"}
                      </p>
                      <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
                    </div>
                    <p className="text-[12px] text-[#8c8b88]">{a.payout_events?.program_agency}</p>
                  </button>
                ),
              )
            )}
          </div>
        </div>
      </MobileShell>
    );
  }

  // ── Screen 2: category list ──
  if (!category) {
    return (
      <MobileShell bottomNav={<UserBottomNav />}>
        <TopBar
          title={en ? "Help Center" : "Sentro ng Tulong"}
          subtitle={en ? "What do you need help with?" : "Saan mo kailangan ng tulong?"}
          onBack={() => setSelectedApp(null)}
          right={
            <button
              onClick={() => setTutStep(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[#f5a623]"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          }
        />

        {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

        <div className="flex flex-col gap-4 px-5 pb-24 pt-4">
          <div
            id="tut-context-header"
            className={cn(
              "relative transition-all",
              isHighlighted("tut-context-header")
                ? "z-[250] rounded-2xl bg-white shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            {ContextHeader()}
            {renderTutorialCard(
              "tut-context-header",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          <div
            id="tut-category-list"
            className={cn(
              "relative flex flex-col gap-3 transition-all",
              isHighlighted("tut-category-list")
                ? "z-[250] rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            {categories
              .filter((c) => c.key !== "grievance")
              .map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    if (c.key === "timing") {
                      setCategory(c);
                      setSubQuestion({ key: "timing_answer", label: c.label });
                      loadConcerns(selectedApp.id, c.label);
                    } else {
                      setCategory(c);
                    }
                  }}
                  className="flex items-center justify-between rounded-2xl border border-[#f0f0f0] bg-white p-4 text-left hover:bg-gray-50"
                >
                  <span className="text-sm font-bold text-[#1b2b4b]">{c.label}</span>
                  <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
                </button>
              ))}
            {renderTutorialCard(
              "tut-category-list",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          {categories.some((c) => c.key === "grievance") && (
            <div
              id="tut-grievance-btn"
              className={cn(
                "relative transition-all",
                isHighlighted("tut-grievance-btn")
                  ? "z-[250] rounded-2xl bg-white shadow-2xl ring-4 ring-[#f5a623]"
                  : "",
              )}
            >
              {categories
                .filter((c) => c.key === "grievance")
                .map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      setCategory(c);
                      loadConcerns(selectedApp.id, c.label);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border-l-4 border-red-400 bg-red-50 p-4 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-red-600">
                      <Flag className="h-4 w-4" /> {c.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-red-300" />
                  </button>
                ))}
              {/* This one renders above the highlighted button to avoid clipping out of the screen bottom */}
              {renderTutorialCard(
                "tut-grievance-btn",
                "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          )}
        </div>
      </MobileShell>
    );
  }

  // ── Timing answer screen (fully computed, no typing needed except optional escalate) ──
  if (category.key === "timing") {
    const status = selectedApp.status;
    const applied = selectedApp.applied_at;
    return (
      <MobileShell bottomNav={<UserBottomNav />}>
        <TopBar
          title={en ? "Subsidy Timing" : "Takdang Oras ng Subsidy"}
          subtitle={selectedApp.payout_events?.program_name}
          onBack={() => {
            setCategory(null);
            setSubQuestion(null);
            setEscalateMessage("");
            sessionStorage.removeItem("uplift_help_draft");
          }}
        />
        <div className="flex flex-col gap-4 px-5 pb-24 pt-4">
          {ContextHeader()}
          {status === "pending" && (
            <div className="rounded-2xl border border-[#f5a623]/30 bg-[#fffaf0] p-4 text-sm text-[#1b2b4b]">
              ⏳{" "}
              {en
                ? `Your application is still under review. Expect a response between ${getBusinessDaysStr(applied)}.`
                : `Nasa ilalim pa ng pagsusuri ang aplikasyon. Asahan ang tugon sa pagitan ng ${getBusinessDaysStr(applied)}.`}
            </div>
          )}
          {status === "approved" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-[#1b2b4b]">
              ✅{" "}
              {en
                ? `Your application was approved! Claim your subsidy at ${selectedApp.payout_events?.venue} on ${selectedApp.payout_events?.event_date}.`
                : `Naaprubahan ang iyong aplikasyon! Kunin ang iyong subsidy sa ${selectedApp.payout_events?.venue} sa darating na ${selectedApp.payout_events?.event_date}.`}
            </div>
          )}
          {status === "rejected" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-[#1b2b4b]">
              ❌{" "}
              {en
                ? `Your application was not approved.${selectedApp.rejection_fields ? ` Reason: ${selectedApp.rejection_fields}.` : ""}`
                : `Hindi naaprubahan ang iyong aplikasyon.${selectedApp.rejection_fields ? ` Dahilan: ${selectedApp.rejection_fields}.` : ""}`}
            </div>
          )}
          <ConcernThread concerns={concerns} en={en} />
          {EscalateBox({
            placeholder: en
              ? "Describe your concern about timing..."
              : "Ilarawan ang iyong alalahanin tungkol sa oras...",
          })}
        </div>
      </MobileShell>
    );
  }

  // ── Sub-question list ──
  if (!subQuestion) {
    return (
      <MobileShell bottomNav={<UserBottomNav />}>
        <TopBar
          title={category.label}
          subtitle={selectedApp.payout_events?.program_name}
          onBack={() => setCategory(null)}
        />
        <div className="flex flex-col gap-4 px-5 pb-24 pt-4">
          {(subQuestions[category.key] || []).map((sq) => (
            <button
              key={sq.key}
              onClick={() => {
                setSubQuestion(sq);
                loadConcerns(selectedApp.id, sq.label);
              }}
              className="flex items-center justify-between rounded-2xl border border-[#f0f0f0] bg-white p-4 text-left hover:bg-gray-50"
            >
              <span className="text-sm font-bold text-[#1b2b4b]">{sq.label}</span>
              <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
            </button>
          ))}
        </div>
      </MobileShell>
    );
  }

  // ── Sub-question resolution ──
  const isProfileFix = ["wrong_personal", "wrong_vehicle", "wrong_contact"].includes(
    subQuestion.key,
  );

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar
        title={subQuestion.label}
        subtitle={selectedApp.payout_events?.program_name}
        onBack={() => setSubQuestion(null)}
      />
      <div className="flex flex-col gap-4 px-5 pb-24 pt-4">
        {ContextHeader()}
        {isProfileFix ? (
          <>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-[#1b2b4b]">
              ✏️{" "}
              {en
                ? "You can correct this directly from your profile. Go to Edit My Information, make the correction, and save."
                : "Maaari mong itama ito nang direkta mula sa iyong pagkakakilanlan. Pumunta sa Baguhin ang Aking Impormasyon, gawin ang pagwawasto, at itala."}
            </div>
            <button
              onClick={() => navigate({ to: "/edit" })}
              className="w-full rounded-2xl bg-[#f5a623] py-4 text-sm font-bold text-[#1b2b4b]"
            >
              {en ? "Go to Edit My Information" : "Pumunta sa Baguhin ang Aking Impormasyon"}
            </button>
          </>
        ) : (
          <>
            <ConcernThread concerns={concerns} en={en} />
            {EscalateBox({
              placeholder: en ? "Describe your concern..." : "Ilarawan ang iyong alalahanin...",
            })}
          </>
        )}
      </div>
    </MobileShell>
  );
}
