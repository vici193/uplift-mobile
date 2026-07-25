/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/supabase";

export const Route = createFileRoute("/apply")({
  component: ApplyBrowsePage,
});

const tutSteps = (en: boolean) => [
  en
    ? "This is Available Subsidies. Every open payout event you qualify for shows up here."
    : "Ito ang Mga Bukas na Subsidy. Lalabas dito ang lahat ng bukas na kaganapan sa pagbabayad kung saan ka karapat-dapat.",
  en
    ? "Each card shows the program's amount, agency, payout schedule, venue, and the application deadline — take note of the deadline, since late applications won't be accepted."
    : "Ipinapakita ng bawat kard ang halaga, ahensya, takdang oras ng pagbabayad, takdang lugar, at huling araw ng pagpapasa — pansinin ang huling araw, dahil hindi tatanggapin ang mga nahuling aplikasyon.",
  en
    ? "Tap 'Apply' on a subsidy you qualify for to start your application. Once you've applied, this turns into a status pill instead."
    : "Pindutin ang 'Magpasa' sa subsidy kung saan ka karapat-dapat para simulan ang aplikasyon. Kapag nakapagpasa ka na, magiging tanda ng kalagayan na lamang ito.",
];

function statusMeta(status: string, en: boolean) {
  if (status === "approved" || status === "claimed")
    return {
      label: en ? "Approved" : "Naaprubahan",
      cls: "bg-emerald-50 text-emerald-700",
      Icon: CheckCircle2,
    };
  if (status === "rejected")
    return { label: en ? "Rejected" : "Tinanggihan", cls: "bg-red-50 text-red-700", Icon: XCircle };
  return { label: en ? "Pending" : "Nakabinbin", cls: "bg-amber-50 text-amber-700", Icon: Clock };
}

function ApplyBrowsePage() {
  const navigate = useNavigate();
  const { en, driver, driverId, onboardingTourActive, advanceOnboardingTour, endOnboardingTour } =
    useSession();

  const [events, setEvents] = useState<any[]>([]);
  const [existing, setExisting] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`uplift_archived_${driverId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [tutStep, setTutStep] = useState(0);

  useEffect(() => {
    if (onboardingTourActive && tutStep === 0) setTutStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingTourActive]);
  const steps = tutSteps(en);

  function toggleArchive(eventId: string) {
    setArchivedIds((prev) => {
      const next = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      localStorage.setItem(`uplift_archived_${driverId}`, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    async function load() {
      const { data: evts } = await supabase
        .from("payout_events")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true });
      const { data: apps } = await supabase
        .from("applications")
        .select("event_id, status")
        .eq("driver_id", driverId);
      const now = new Date();
      const stillOpen = (evts || [])
        .filter((e: any) => !e.application_deadline || new Date(e.application_deadline) > now)
        .filter((e: any) => {
          if (!e.qualified_denominations) return true;
          const allowed = e.qualified_denominations
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
          return allowed.length === 0 || allowed.includes(driver?.denomination);
        });
      setEvents(stillOpen);
      const appMap: Record<string, string> = {};
      (apps || []).forEach((a: any) => (appMap[a.event_id] = a.status));
      setExisting(appMap);
      setLoading(false);
    }
    load();
  }, [driverId, driver?.denomination]);

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

  const displayEvents = events.filter((e) =>
    showArchived ? archivedIds.includes(e.id) : !archivedIds.includes(e.id),
  );

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
            {en ? "Apply Guide" : "Gabay sa Pagpapasa"}
          </h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{steps[tutStep - 1]}</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setTutStep(0);
              if (onboardingTourActive) endOnboardingTour();
            }}
            className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            {en ? "Skip" : "Laktawan"}
          </button>
          <button
            onClick={() => {
              if (tutStep < steps.length) {
                setTutStep((s) => s + 1);
              } else {
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

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar
        title={en ? "Available Subsidies" : "Mga Bukas na Subsidy"}
        subtitle={
          en
            ? "Browse and apply for open payout events"
            : "Tingnan at magpasa ng aplikasyon sa mga bukas na kaganapan sa pagbabayad"
        }
        // FORCE navigation back to home specifically to break history loops
        onBack={() => navigate({ to: "/home" })}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived((s) => !s)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[#1b2b4b]"
              title={en ? "Toggle archived" : "Ipakita ang mga archived"}
            >
              {showArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setTutStep(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[#f5a623]"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {tutStep > 0 && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />}

      <div className="flex flex-col gap-4 px-5 pb-24 pt-4">
        {loading ? (
          <div className="rounded-2xl border-2 border-dashed border-[#e6e8eb] p-10 text-center text-[#8c8b88]">
            {en ? "Loading..." : "Loading..."}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#e6e8eb] p-10 text-center text-[#8c8b88]">
            {showArchived
              ? en
                ? "No archived events."
                : "Walang nakatagong kaganapan."
              : en
                ? "No open payout events at the moment."
                : "Walang bukas na kaganapan sa pagbabayad sa ngayon."}
          </div>
        ) : (
          displayEvents.map((event, i) => {
            const appStatus = existing[event.id];
            const s = appStatus ? statusMeta(appStatus, en) : null;
            return (
              <div
                key={event.id}
                id={i === 0 ? "tut-step-1" : undefined}
                className={`rounded-[24px] border p-5 shadow-sm transition-all ${tutStep === 1 && i === 0 ? "relative z-[250] border-[#f5a623] bg-white ring-4 ring-[#f5a623]" : "border-[#f0f0f0] bg-white"}`}
              >
                <div
                  id={i === 0 ? "tut-step-2" : undefined}
                  className={`${tutStep === 2 && i === 0 ? "relative z-[250] -m-2 rounded-2xl bg-white p-2 ring-4 ring-[#f5a623]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-extrabold text-[#1b2b4b]">
                      {event.program_name}
                    </p>
                    <p className="shrink-0 text-[14px] font-black text-[#f5a623]">
                      ₱{event.program_amount}
                    </p>
                  </div>
                  <p className="text-[12px] font-medium text-[#8c8b88]">{event.program_agency}</p>

                  <div className="mt-3 flex flex-col gap-1 text-[12px] text-[#8c8b88]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {event.event_date} · {event.time_start}–
                      {event.time_end}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {event.venue}
                    </span>
                    {event.application_deadline && (
                      <span className="flex items-center gap-1.5 font-bold text-red-500">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {en ? "Apply before:" : "Magpasa bago ang:"}{" "}
                        {new Date(event.application_deadline).toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <div className="mt-2 rounded-xl bg-[#f8f9fa] p-2.5 text-[12px] leading-relaxed text-[#8c8b88]">
                      📋 {event.description}
                    </div>
                  )}

                  {i === 0 &&
                    renderTutorialCard(2, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px]")}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {appStatus === "rejected" ? (
                    <button
                      onClick={() => toggleArchive(event.id)}
                      className="text-[12px] font-bold text-[#8c8b88] underline"
                    >
                      {archivedIds.includes(event.id)
                        ? en
                          ? "Unarchive"
                          : "Ibalik"
                        : en
                          ? "Archive"
                          : "Itago"}
                    </button>
                  ) : (
                    <span />
                  )}

                  <div
                    id={i === 0 ? "tut-step-3" : undefined}
                    className={`${tutStep === 3 && i === 0 ? "relative z-[250] rounded-2xl bg-white p-1.5 ring-4 ring-[#f5a623]" : ""}`}
                  >
                    {s ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${s.cls}`}
                      >
                        <s.Icon className="h-3.5 w-3.5" /> {s.label}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          navigate({ to: "/apply-detail", search: { eventId: event.id } })
                        }
                        className="rounded-full border-2 border-[#1b2b4b] px-4 py-1.5 text-[13px] font-bold text-[#1b2b4b]"
                      >
                        {en ? "Apply" : "Magpasa ng Aplikasyon"}
                      </button>
                    )}

                    {i === 0 &&
                      renderTutorialCard(3, "top-full right-0 mt-4 w-[280px] sm:w-[300px]")}
                  </div>
                </div>

                {i === 0 &&
                  renderTutorialCard(1, "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px]")}
              </div>
            );
          })
        )}
        <Link
          to="/home"
          className="mt-2 block text-center text-xs font-bold text-[#8c8b88] hover:text-[#1b2b4b]"
        >
          ← {en ? "Back to Home" : "Bumalik sa Pambungad"}
        </Link>
      </div>
    </MobileShell>
  );
}
