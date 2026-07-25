/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, HelpCircle, Plus } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/myconcern")({
  component: MyConcernsPage,
});

const getTutSteps = (en: boolean) => [
  {
    title: en ? "Your Concerns" : "Iyong mga Alalahanin",
    desc: en
      ? "This is the My Concerns page. This is where all your concerns and grievances live, grouped by subsidy. Tap any entry to see the full conversation and any reply from the agency."
      : "Ito ang My Concerns page. Dito makikita ang lahat ng iyong alalahanin, hinati-hati ayon sa subsidy. I-tap ang alinman para makita ang buong usapan.",
    target: "tut-concern-list",
  },
  {
    title: en ? "File a New Concern" : "Mag-file ng Bagong Alalahanin",
    desc: en
      ? "Didn't find your concern above? Tap 'File a New Concern' to send a new question directly to the agency."
      : "Hindi mo nahanap ang alalahanin mo? I-tap ang 'Mag-file ng Bagong Alalahanin'.",
    target: "tut-new-btn",
  },
  {
    title: en ? "Type of Concern" : "Uri ng Alalahanin",
    desc: en
      ? "Start by picking the Type of Concern that best matches your situation."
      : "Magsimula sa pagpili ng Uri ng Alalahanin.",
    target: "tut-form-type",
  },
  {
    title: en ? "Select Subsidy" : "Pumili ng Subsidy",
    desc: en
      ? "Then choose which subsidy this is about — required unless you're just asking how to use the app."
      : "Piliin kung aling subsidy ito tungkol.",
    target: "tut-form-subsidy",
  },
  {
    title: en ? "Write your Message" : "Isulat ang Mensahe",
    desc: en
      ? "Finally, describe your concern. Your draft saves automatically as you type."
      : "Ilarawan ang iyong alalahanin. Awtomatikong na-save ang draft.",
    target: "tut-form-message",
  },
];

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
function getLastMessage(c: any) {
  const t = getThreadMessages(c);
  return t.length ? t[t.length - 1] : null;
}

function statusBadge(c: any, en: boolean) {
  if (c.is_draft || c.status === "draft")
    return { text: `📝 ${en ? "Draft" : "Draft"}`, cls: "bg-[#fffaf0] text-[#f5a623]" };
  const last = getLastMessage(c);
  if (last && last.sent_by === "admin" && !c.driver_seen_reply)
    return {
      text: `🔔 ${en ? "New Update!" : "Bagong Update!"}`,
      cls: "bg-emerald-50 text-emerald-700",
    };
  if (last && last.sent_by === "admin")
    return {
      text: `👁️ ${en ? "View Response" : "Tingnan ang Tugon"}`,
      cls: "bg-[#fffaf0] text-[#b5790a]",
    };
  return {
    text: `⏳ ${en ? "Awaiting Response" : "Naghihintay ng Tugon"}`,
    cls: "bg-gray-100 text-[#8c8b88]",
  };
}

function MyConcernsPage() {
  const navigate = useNavigate();
  const {
    en,
    apps,
    concerns,
    driverId,
    refreshConcerns,
    onboardingTourActive,
    advanceOnboardingTour,
    endOnboardingTour,
  } = useSession();
  const [tutStep, setTutStep] = useState(0);

  useEffect(() => {
    if (onboardingTourActive && tutStep === 0) setTutStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingTourActive]);
  const steps = getTutSteps(en);

  useEffect(() => {
    refreshConcerns();
    const interval = setInterval(() => refreshConcerns(), 10000);
    return () => clearInterval(interval);
  }, []);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newConcernAppId, setNewConcernAppId] = useState<string | null>(null);
  const [newConcernType, setNewConcernType] = useState("");
  const [newConcernMessage, setNewConcernMessage] = useState("");
  const currentDraftIdRef = useRef<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<any>(null);

  // Manage form visibility during tutorial
  useEffect(() => {
    if (tutStep === 0) return;
    if (tutStep < 3) {
      setShowNewForm(false);
    } else {
      setShowNewForm(true);
    }
  }, [tutStep]);

  // Smooth scroll to highlighted element
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

  function handleNewMessageChange(value: string) {
    setNewConcernMessage(value);
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
      if (currentDraftIdRef.current) {
        await supabase
          .from("grievances")
          .update({
            draft_message: value,
            message: value,
            concern_type: newConcernType || "General",
          })
          .eq("id", currentDraftIdRef.current);
      } else {
        const { data } = await supabase
          .from("grievances")
          .insert({
            driver_id: driverId,
            application_id: newConcernAppId || null,
            concern_type: newConcernType || "General",
            message: value,
            draft_message: value,
            is_draft: true,
            status: "draft",
          })
          .select()
          .single();
        if (data) currentDraftIdRef.current = data.id;
      }
      await refreshConcerns();
    }, 1500);
    setAutoSaveTimer(timer);
  }

  async function submitNewConcern() {
    const subsidyOptional = newConcernType === "How to Use This App" || newConcernType === "Other";
    if (!newConcernMessage.trim() || (!subsidyOptional && !newConcernAppId)) return;
    if (currentDraftIdRef.current) {
      await supabase
        .from("grievances")
        .update({ message: newConcernMessage, is_draft: false, status: "submitted" })
        .eq("id", currentDraftIdRef.current);
    } else {
      await supabase.from("grievances").insert({
        driver_id: driverId,
        application_id: newConcernAppId,
        concern_type: newConcernType || "General",
        message: newConcernMessage,
        is_draft: false,
        status: "submitted",
      });
    }
    setShowNewForm(false);
    setNewConcernMessage("");
    setNewConcernType("");
    setNewConcernAppId(null);
    currentDraftIdRef.current = null;
    await refreshConcerns();
  }

  const grouped: Record<string, any[]> = {};
  concerns.forEach((c: any) => {
    const name =
      c.applications?.payout_events?.program_name ||
      (en ? "General Concern" : "Pangkalahatang Alalahanin");
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(c);
  });

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar
        title={en ? "My Concerns" : "Aking mga Alalahanin"}
        subtitle={en ? "All your concerns in one place" : "Lahat ng alalahanin sa iisang lugar"}
        onBack={() => navigate({ to: "/home" })}
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
        {Object.keys(grouped).length === 0 && !showNewForm && (
          <div
            id={Object.keys(grouped).length === 0 ? "tut-concern-list" : undefined}
            className={cn(
              "rounded-2xl border-2 border-dashed border-[#e6e8eb] p-10 text-center text-[#8c8b88] transition-all",
              isHighlighted("tut-concern-list")
                ? "relative z-[250] bg-white shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            {en ? "No concerns filed yet." : "Wala pang naisumiteng alalahanin."}
            {Object.keys(grouped).length === 0 &&
              renderTutorialCard(
                "tut-concern-list",
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
          </div>
        )}

        <div className="relative">
          {Object.entries(grouped).map(([programName, items], gIdx) => (
            <div key={programName} className="mb-4">
              <p className="mb-2 text-[13px] font-bold text-[#1b2b4b]">📋 {programName}</p>
              <div className="flex flex-col gap-2">
                {items.map((c: any, iIdx: number) => {
                  const badge = statusBadge(c, en);
                  // Only target the very first item overall instead of the whole mapped list
                  const isFirstTarget = gIdx === 0 && iIdx === 0;
                  return (
                    <div
                      key={c.id}
                      id={isFirstTarget ? "tut-concern-list" : undefined}
                      className={cn(
                        "transition-all",
                        isFirstTarget && isHighlighted("tut-concern-list")
                          ? "relative z-[250] rounded-2xl bg-white p-1 shadow-2xl ring-4 ring-[#f5a623]"
                          : "",
                      )}
                    >
                      <button
                        onClick={() => navigate({ to: "/grievance", search: { id: c.id } })}
                        className="flex w-full items-center justify-between rounded-2xl border border-[#f0f0f0] bg-white p-4 text-left hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-[13px] font-bold text-[#1b2b4b]">{c.concern_type}</p>
                          <p className="text-[11px] text-[#8c8b88]">
                            {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                          <ChevronRight className="h-4 w-4 text-[#c1c1c1]" />
                        </div>
                      </button>
                      {isFirstTarget &&
                        renderTutorialCard(
                          "tut-concern-list",
                          "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {showNewForm ? (
          <div className="rounded-2xl border border-[#f0f0f0] bg-white p-4">
            <p className="mb-3 font-extrabold text-[#1b2b4b]">
              {en ? "New Concern" : "Bagong Alalahanin"}
            </p>

            <div
              id="tut-form-type"
              className={cn(
                "relative transition-all",
                isHighlighted("tut-form-type")
                  ? "z-[250] rounded-xl bg-white p-2 shadow-2xl ring-4 ring-[#f5a623] -m-2"
                  : "",
              )}
            >
              <label className="mb-1 block text-[12px] font-bold text-[#8c8b88]">
                {en ? "Type of Concern" : "Uri ng Alalahanin"}
              </label>
              <select
                className="mb-3 w-full rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
                value={newConcernType}
                onChange={(e) => setNewConcernType(e.target.value)}
              >
                <option value="">{en ? "Select..." : "Pumili..."}</option>
                <option value="Application Issue">
                  {en ? "Application Issue" : "Problema sa Aplikasyon"}
                </option>
                <option value="Payout Issue">{en ? "Payout Issue" : "Problema sa Payout"}</option>
                <option value="Eligibility Question">
                  {en ? "Eligibility Question" : "Tanong sa Kwalipikasyon"}
                </option>
                <option value="Document Concern">
                  {en ? "Document Concern" : "Alalahanin sa Dokumento"}
                </option>
                <option value="How to Use This App">
                  {en ? "How to Use This App" : "Paano Gamitin ang App"}
                </option>
                <option value="Other">{en ? "Other" : "Iba pa"}</option>
              </select>
              {renderTutorialCard(
                "tut-form-type",
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
            </div>

            <div
              id="tut-form-subsidy"
              className={cn(
                "relative transition-all",
                isHighlighted("tut-form-subsidy")
                  ? "z-[250] rounded-xl bg-white p-2 shadow-2xl ring-4 ring-[#f5a623] -m-2"
                  : "",
              )}
            >
              <label className="mb-1 block text-[12px] font-bold text-[#8c8b88]">
                {newConcernType === "How to Use This App" || newConcernType === "Other"
                  ? en
                    ? "Which subsidy? (optional)"
                    : "Aling subsidy? (opsyonal)"
                  : en
                    ? "Which subsidy is this about? *"
                    : "Aling subsidy? *"}
              </label>
              <select
                className="mb-3 w-full rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
                value={newConcernAppId || ""}
                onChange={(e) => setNewConcernAppId(e.target.value)}
              >
                <option value="">{en ? "Select a subsidy..." : "Pumili ng subsidy..."}</option>
                {apps.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.payout_events?.program_name} ({a.status})
                  </option>
                ))}
              </select>
              {renderTutorialCard(
                "tut-form-subsidy",
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
            </div>

            <div
              id="tut-form-message"
              className={cn(
                "relative transition-all",
                isHighlighted("tut-form-message")
                  ? "z-[250] rounded-xl bg-white p-2 shadow-2xl ring-4 ring-[#f5a623] -m-2"
                  : "",
              )}
            >
              <label className="mb-1 block text-[12px] font-bold text-[#8c8b88]">
                {en ? "Your Message" : "Ang Iyong Mensahe"}
              </label>
              <textarea
                className="min-h-[80px] w-full rounded-xl border border-gray-100 bg-[#f8f9fa] p-3 text-sm"
                placeholder={en ? "Describe your concern..." : "Ilarawan ang iyong alalahanin..."}
                value={newConcernMessage}
                onChange={(e) => handleNewMessageChange(e.target.value)}
              />
              {newConcernMessage.trim() && (
                <p className="mt-1 text-[11px] text-[#8c8b88]">
                  💾 {en ? "Auto-saving draft..." : "Awtomatikong nini-save..."}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={submitNewConcern}
                  className="flex-1 rounded-xl bg-[#1b2b4b] py-3 text-sm font-bold text-white"
                >
                  {en ? "Submit Concern" : "Isumite"}
                </button>
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setNewConcernMessage("");
                    setNewConcernType("");
                    setNewConcernAppId(null);
                    currentDraftIdRef.current = null;
                  }}
                  className="flex-1 rounded-xl border border-[#1b2b4b]/20 py-3 text-sm font-bold text-[#1b2b4b]"
                >
                  {en ? "Cancel" : "Kanselahin"}
                </button>
              </div>
              {renderTutorialCard(
                "tut-form-message",
                "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          </div>
        ) : (
          <div
            id="tut-new-btn"
            className={cn(
              "relative transition-all",
              isHighlighted("tut-new-btn")
                ? "z-[250] rounded-2xl bg-white shadow-2xl ring-4 ring-[#f5a623]"
                : "",
            )}
          >
            <button
              onClick={() => setShowNewForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#f0f0f0] bg-white py-4 text-sm font-bold text-[#1b2b4b] hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />{" "}
              {en ? "File a New Concern" : "Mag-file ng Bagong Alalahanin"}
            </button>
            {renderTutorialCard(
              "tut-new-btn",
              "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
