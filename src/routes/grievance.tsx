/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ChevronRight, Plus, Flag, HelpCircle } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/grievance")({
  component: GrievanceThreadPage,
  validateSearch: searchSchema,
});

function getThreadMessages(c: any) {
  const msgs =
    c.is_draft || c.status === "draft"
      ? []
      : [
          {
            id: `opening-${c.id}`,
            message: c.message,
            sent_by: "driver",
            created_at: c.created_at,
          },
        ];
  const extra = (c.grievance_messages || [])
    .slice()
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return [...msgs, ...extra];
}

// --- Tutorial logic for the Landing Page ---
function getLandingTutSteps(en: boolean, showNewForm: boolean, hasGrievances: boolean) {
  const steps = [];

  if (hasGrievances) {
    steps.push({
      title: en ? "Your Grievances" : "Iyong mga Reklamo",
      desc: en
        ? "Here is a list of your filed grievances. Tap any of them to view the full conversation or reply to the agency."
        : "Narito ang listahan ng iyong mga inihain na reklamo. I-tap ang alinman sa mga ito upang makita ang buong pag-uusap o sumagot sa ahensya.",
      target: "tut-grievance-list",
    });
  }

  if (showNewForm) {
    steps.push({
      title: en ? "Grievance Form" : "Pormularyo ng Reklamo",
      desc: en
        ? "Select the rejected application, choose a topic, and write your message clearly so the agency can review your case."
        : "Piliin ang tinanggihang aplikasyon, pumili ng paksa, at isulat nang malinaw ang iyong mensahe upang masuri ng ahensya ang iyong kaso.",
      target: "tut-grievance-form",
    });
  } else {
    steps.push({
      title: en ? "File a Grievance" : "Maghain ng Reklamo",
      desc: en
        ? "Tap here to start filing a new formal grievance against a rejected application."
        : "I-tap dito upang magsimulang maghain ng bagong pormal na reklamo laban sa tinanggihang aplikasyon.",
      target: "tut-new-grievance-btn",
    });
  }

  return steps;
}

function GrievancesLandingPage() {
  const navigate = useNavigate();
  const { en, apps, concerns, driverId, refreshConcerns } = useSession();

  const [showNewForm, setShowNewForm] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [subQuestion, setSubQuestion] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const currentDraftIdRef = useRef<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<any>(null);

  const [tutStep, setTutStep] = useState(0);

  const grievances = concerns.filter((c: any) => c.is_grievance);
  const rejectedApps = apps.filter((a: any) => a.status === "rejected");

  useEffect(() => {
    refreshConcerns();
  }, []);

  const grouped: Record<string, any[]> = {};
  grievances.forEach((g: any) => {
    const name =
      g.applications?.payout_events?.program_name ||
      (en ? "General Grievance" : "Pangkalahatang Reklamo");
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(g);
  });

  const hasGrievances = Object.keys(grouped).length > 0;
  const steps = getLandingTutSteps(en, showNewForm, hasGrievances);

  // Tutorial scroll logic
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
  }, [tutStep, en, showNewForm, hasGrievances]);

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

  function handleMessageChange(value: string) {
    setMessage(value);
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(async () => {
      if (!value.trim()) {
        if (currentDraftIdRef.current) {
          await supabase.from("grievances").delete().eq("id", currentDraftIdRef.current);
          currentDraftIdRef.current = null;
          await refreshConcerns();
        }
        return;
      }
      if (!appId) return;
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
            application_id: appId,
            concern_type: subQuestion || (en ? "File a Grievance" : "Maghain ng Reklamo"),
            message: value,
            draft_message: value,
            is_draft: true,
            status: "draft",
            is_grievance: true,
          })
          .select()
          .single();
        if (data) currentDraftIdRef.current = data.id;
      }
      await refreshConcerns();
    }, 1500);
    setAutoSaveTimer(timer);
  }

  async function submitGrievance() {
    if (!message.trim() || !appId) return;
    if (currentDraftIdRef.current) {
      await supabase
        .from("grievances")
        .update({ message, is_draft: false, status: "submitted" })
        .eq("id", currentDraftIdRef.current);
    } else {
      await supabase.from("grievances").insert({
        driver_id: driverId,
        application_id: appId,
        concern_type: subQuestion || (en ? "File a Grievance" : "Maghain ng Reklamo"),
        message,
        is_draft: false,
        status: "submitted",
        is_grievance: true,
      });
    }
    setShowNewForm(false);
    setMessage("");
    setAppId(null);
    setSubQuestion(null);
    currentDraftIdRef.current = null;
    await refreshConcerns();
  }

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar
        title={en ? "My Grievances" : "Aking mga Reklamo"}
        subtitle={
          en
            ? "Track and file grievances for rejected applications"
            : "Subaybayan at maghain ng reklamo"
        }
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
        {!hasGrievances && !showNewForm && (
          <div className="rounded-2xl border-2 border-dashed border-[#e6e8eb] p-10 text-center text-[#8c8b88]">
            {en ? "No grievances filed yet." : "Wala pang naisumiteng reklamo."}
          </div>
        )}

        {hasGrievances && (
          <div
            id="tut-grievance-list"
            className={cn(
              "relative flex flex-col gap-4 transition-all",
              isHighlighted("tut-grievance-list")
                ? "z-[250] rounded-3xl bg-white p-3 shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            {Object.entries(grouped).map(([name, items]) => (
              <div key={name}>
                <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#1b2b4b]">
                  <Flag className="h-3.5 w-3.5 text-red-500" /> {name}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => navigate({ to: "/grievance", search: { id: g.id } })}
                      className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4 text-left hover:bg-red-100"
                    >
                      <div>
                        <p className="text-[13px] font-bold text-[#1b2b4b]">
                          {g.is_draft || g.status === "draft"
                            ? en
                              ? "📝 Draft"
                              : "📝 Draft"
                            : new Date(g.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-[#8c8b88]">{g.message}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#c1c1c1]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {renderTutorialCard(
              "tut-grievance-list",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>
        )}

        {showNewForm ? (
          <div
            id="tut-grievance-form"
            className={cn(
              "relative transition-all",
              isHighlighted("tut-grievance-form")
                ? "z-[250] rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            <div className="rounded-2xl border border-[#f0f0f0] bg-white p-4">
              <p className="mb-3 font-extrabold text-[#1b2b4b]">
                {en ? "File a New Grievance" : "Maghain ng Bagong Reklamo"}
              </p>
              <label className="mb-1 block text-[12px] font-bold text-[#8c8b88]">
                {en
                  ? "Which rejected application is this about? *"
                  : "Aling tinanggihang aplikasyon? *"}
              </label>
              <select
                className="mb-3 w-full rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
                value={appId || ""}
                onChange={(e) => setAppId(e.target.value)}
              >
                <option value="">
                  {en ? "Select an application..." : "Pumili ng aplikasyon..."}
                </option>
                {rejectedApps.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.payout_events?.program_name}
                  </option>
                ))}
              </select>
              {rejectedApps.length === 0 && (
                <p className="mb-3 text-[11px] text-[#8c8b88]">
                  {en
                    ? "You have no rejected applications to file a grievance against."
                    : "Wala kang tinanggihang aplikasyon."}
                </p>
              )}

              {appId && (
                <div className="mb-3">
                  <label className="mb-1 block text-[12px] font-bold text-[#8c8b88]">
                    {en ? "What's this about? (optional)" : "Tungkol saan ito? (opsyonal)"}
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
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
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setSubQuestion((cur) => (cur === opt.label ? null : opt.label))
                        }
                        className={`flex items-center justify-between rounded-xl border p-3 text-left text-[13px] font-semibold transition-all ${subQuestion === opt.label ? "border-red-300 bg-red-50 text-red-700" : "border-gray-100 bg-[#f8f9fa] text-[#1b2b4b] hover:bg-gray-100"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="mb-1 block text-[12px] font-bold text-[#8c8b88]">
                {en ? "Your Message" : "Ang Iyong Mensahe"}
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
                placeholder={
                  en
                    ? "Explain why you believe this decision should be reconsidered..."
                    : "Ipaliwanag kung bakit dapat muling isaalang-alang ang desisyong ito..."
                }
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
              />
              {message.trim() && (
                <p className="mt-1 text-[11px] text-[#8c8b88]">
                  💾 {en ? "Auto-saving draft..." : "Awtomatikong nini-save..."}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={submitGrievance}
                  disabled={!appId || !message.trim()}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {en ? "Submit Grievance" : "Isumite"}
                </button>
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setMessage("");
                    setAppId(null);
                    setSubQuestion(null);
                    currentDraftIdRef.current = null;
                  }}
                  className="flex-1 rounded-xl border border-[#1b2b4b]/20 py-3 text-sm font-bold text-[#1b2b4b]"
                >
                  {en ? "Cancel" : "Kanselahin"}
                </button>
              </div>
            </div>
            {renderTutorialCard(
              "tut-grievance-form",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>
        ) : (
          <div
            id="tut-new-grievance-btn"
            className={cn(
              "relative transition-all",
              isHighlighted("tut-new-grievance-btn")
                ? "z-[250] rounded-2xl bg-white shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            <button
              onClick={() => setShowNewForm(true)}
              disabled={rejectedApps.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 py-4 text-sm font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />{" "}
              {en ? "File a New Grievance" : "Maghain ng Bagong Reklamo"}
            </button>
            {renderTutorialCard(
              "tut-new-grievance-btn",
              "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// --- Tutorial logic for the Thread Page ---
function getThreadTutSteps(en: boolean, isDraft: boolean) {
  return [
    {
      title: en ? "Conversation History" : "Kasaysayan ng Pag-uusap",
      desc: en
        ? "Read previous messages between you and the agency."
        : "Basahin ang mga nakaraang mensahe sa pagitan mo at ng ahensya.",
      target: "tut-thread-history",
    },
    {
      title: en ? "Reply Box" : "Kahon ng Tugon",
      desc: isDraft
        ? en
          ? "Finish your drafted message and send it."
          : "Tapusin ang iyong burador na mensahe at ipadala ito."
        : en
          ? "Write a follow-up message to the agency here."
          : "Sumulat ng follow-up na mensahe sa ahensya rito.",
      target: "tut-thread-input",
    },
  ];
}

function GrievanceThreadPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { en, concerns, refreshConcerns } = useSession();

  const concern = concerns.find((c: any) => c.id === id);

  const [draftMessage, setDraftMessage] = useState(concern?.draft_message || "");
  const [draftTimer, setDraftTimer] = useState<any>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  const [tutStep, setTutStep] = useState(0);

  // Poll for new agency replies while viewing this thread
  useEffect(() => {
    const interval = setInterval(() => refreshConcerns(), 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (concern && !concern.is_draft && concern.status !== "draft") {
      const thread = getThreadMessages(concern);
      const last = thread[thread.length - 1];
      if (last && last.sent_by === "admin" && !concern.driver_seen_reply) {
        supabase
          .from("grievances")
          .update({ driver_seen_reply: true })
          .eq("id", concern.id)
          .then(() => refreshConcerns());
      }
    }
  }, [concern?.id, concern?.driver_seen_reply]);

  const isDraft = concern?.is_draft || concern?.status === "draft";
  const steps = getThreadTutSteps(en, isDraft);

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
  }, [tutStep, en, isDraft]);

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

  function handleDraftChange(value: string) {
    setDraftMessage(value);
    if (draftTimer) clearTimeout(draftTimer);
    const timer = setTimeout(async () => {
      if (!concern) return;
      if (!value.trim()) {
        await supabase.from("grievances").delete().eq("id", concern.id);
        navigate({ to: "/myconcern" });
        await refreshConcerns();
        return;
      }
      await supabase.from("grievances").update({ draft_message: value }).eq("id", concern.id);
    }, 1500);
    setDraftTimer(timer);
  }

  async function submitConcern() {
    if (!concern) return;
    const message = draftMessage ?? concern.draft_message;
    if (!message?.trim()) return;
    await supabase
      .from("grievances")
      .update({ message, is_draft: false, status: "submitted" })
      .eq("id", concern.id);
    await refreshConcerns();
  }

  async function sendFollowUp() {
    if (!followUpText.trim() || !concern) return;
    setSendingFollowUp(true);
    await supabase
      .from("grievance_messages")
      .insert({ grievance_id: concern.id, message: followUpText, sent_by: "driver" });
    setFollowUpText("");
    setSendingFollowUp(false);
    await refreshConcerns();
  }

  // ── No id given: show a "My Grievances" landing page instead of a dead end ──
  if (!id) {
    return <GrievancesLandingPage />;
  }

  if (!concern) {
    return (
      <MobileShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-[#8c8b88]">
            {en ? "Concern not found." : "Hindi nahanap ang alalahanin."}
          </p>
          <button
            onClick={() => navigate({ to: "/myconcern" })}
            className="mt-4 font-bold text-[#f5a623] underline"
          >
            {en ? "Back to My Concerns" : "Bumalik sa Aking mga Alalahanin"}
          </button>
        </div>
      </MobileShell>
    );
  }

  const programName =
    concern.applications?.payout_events?.program_name ||
    (en ? "General Concern" : "Pangkalahatang Alalahanin");
  const thread = getThreadMessages(concern);

  return (
    <MobileShell>
      <TopBar
        title={""} // Title handled in the body below for this layout
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

      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 bg-white/90 px-6 pb-4 pt-4 backdrop-blur-xl">
        <button
          onClick={() => navigate({ to: "/myconcern" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
        </button>
        <div>
          <h1 className="font-bold text-[#1b2b4b]">📋 {programName}</h1>
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[#8c8b88]">{concern.concern_type}</p>
            {concern.is_grievance && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                ⚑ {en ? "Grievance" : "Reklamo"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-4 pt-4">
        <div
          id="tut-thread-history"
          className={cn(
            "relative flex flex-col gap-3 transition-all",
            isHighlighted("tut-thread-history")
              ? "z-[250] rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-[#f5a623]"
              : "",
          )}
        >
          {thread.length === 0 && !isDraft && (
            <p className="text-center text-sm italic text-[#8c8b88]">
              {en ? "No messages yet." : "Wala pang mensahe."}
            </p>
          )}

          {thread.map((m: any) => {
            const isDriver = m.sent_by === "driver";
            return (
              <div
                key={m.id}
                className={`flex max-w-[85%] flex-col ${isDriver ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 text-[13px] leading-relaxed ${isDriver ? "rounded-[14px_14px_4px_14px] bg-[#1b2b4b] text-white" : "rounded-[14px_14px_14px_4px] border border-emerald-200 bg-emerald-50 text-[#1b2b4b]"}`}
                >
                  {m.message}
                </div>
                <p className="mt-1 text-[10px] text-[#8c8b88]">
                  {isDriver ? (en ? "You" : "Ikaw") : `🏛️ ${en ? "Agency" : "Ahensya"}`} ·{" "}
                  {new Date(m.created_at).toLocaleString("en-PH", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}

          {!isDraft && thread.length > 0 && thread[thread.length - 1].sent_by === "driver" && (
            <div className="max-w-[85%] self-start">
              <div className="rounded-[14px_14px_14px_4px] border border-gray-100 bg-[#f8f9fa] px-4 py-2.5 text-[12px] italic text-[#8c8b88]">
                ⏳{" "}
                {en
                  ? "Waiting for the agency to respond..."
                  : "Naghihintay ng tugon mula sa ahensya..."}
              </div>
            </div>
          )}
          {renderTutorialCard(
            "tut-thread-history",
            "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
          )}
        </div>
      </div>

      <div
        id="tut-thread-input"
        className={cn(
          "relative mt-auto transition-all",
          isHighlighted("tut-thread-input")
            ? "z-[250] rounded-t-3xl bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] ring-4 ring-[#f5a623]"
            : "",
        )}
      >
        {isDraft ? (
          <div className="mx-5 mb-8 rounded-2xl border border-[#f5a623]/30 bg-[#fffaf0] p-4">
            <p className="mb-2 text-[12px] font-semibold text-[#f5a623]">
              📝{" "}
              {en
                ? "This concern hasn't been sent yet. Finish writing it and submit when ready."
                : "Hindi pa naipapadala ito. Tapusin at isumite kapag handa na."}
            </p>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-gray-100 bg-white p-3 text-sm"
              value={draftMessage ?? concern.draft_message ?? ""}
              onChange={(e) => handleDraftChange(e.target.value)}
              placeholder={en ? "Your concern..." : "Ang iyong alalahanin..."}
            />
            <p className="mb-2 mt-1 text-[11px] text-[#8c8b88]">
              💾 {en ? "Auto-saving as you type..." : "Awtomatikong nini-save..."}
            </p>
            <button
              onClick={submitConcern}
              className="w-full rounded-xl bg-[#1b2b4b] py-3 text-sm font-bold text-white"
            >
              {en ? "Send" : "Ipadala"}
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2 border-t border-gray-100 bg-white p-4">
            <textarea
              className="min-h-[44px] flex-1 rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder={en ? "Write a follow-up message..." : "Magsulat ng follow-up..."}
            />
            <button
              onClick={sendFollowUp}
              disabled={sendingFollowUp || !followUpText.trim()}
              className="rounded-xl bg-[#1b2b4b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {sendingFollowUp ? "..." : en ? "Send" : "Ipadala"}
            </button>
          </div>
        )}
        {renderTutorialCard(
          "tut-thread-input",
          "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
        )}
      </div>
    </MobileShell>
  );
}
