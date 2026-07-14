/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  HelpCircle,
  Info,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/subsidies")({
  component: SubsidiesPage,
});

const tutSteps = (en: boolean) => [
  en
    ? "This explains how the subsidy program works — apply once, upload requirements, and track your progress in real-time."
    : "Ipinapaliwanag dito kung paano gumagana ang subsidy program — mag-apply nang isang beses, mag-upload ng requirements, at subaybayan ang progreso.",
  en
    ? "This is an example of an Approved application. It will show a green pill. Click on it to view your appointment details and QR code."
    : "Ito ay halimbawa ng naaprubahang aplikasyon. Mayroon itong kulay berdeng pill. I-click ito para makita ang detalye ng appointment at QR code.",
  en
    ? "If the agency sends you a message, a 'New Response!' badge appears. Click the card to read the instructions or reply to them."
    : "Kapag nagpadala ng mensahe ang ahensya, lalabas ang 'Bagong Tugon!' badge. I-click ang card para basahin at sagutin ito.",
  en
    ? "A Pending application means the agency is still reviewing your documents. Check back later for updates."
    : "Ang nakabinbing aplikasyon ay nangangahulugang sinusuri pa ng ahensya ang iyong mga dokumento. Balikan ito mamaya para sa mga update.",
  en
    ? "A Rejected application will show a red pill. Click on it to read the agency's feedback so you can correct your details and reapply."
    : "Ang tinanggihang aplikasyon ay may pulang pill. I-click ito upang mabasa ang mensahe ng ahensya nang maitama mo ang iyong detalye at makapag-apply muli.",
];

function statusMeta(app: any, en: boolean) {
  const hasNewMessage = app.application_messages?.length > 0 && !app.driver_seen_latest;
  const hasAnyMessage = app.application_messages?.length > 0;

  if (app.status === "claimed")
    return {
      label: en ? "Claimed" : "Natanggap",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Icon: CheckCircle2,
    };
  if (app.status === "approved")
    return {
      label: en ? "Approved" : "Naaprubahan",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Icon: CheckCircle2,
    };
  if (app.status === "rejected")
    return {
      label: en ? "Rejected" : "Tinanggihan",
      cls: "bg-red-50 text-red-700 border-red-100",
      Icon: XCircle,
    };
  if (hasNewMessage)
    return {
      label: en ? "New Response!" : "Bagong Tugon!",
      cls: "bg-blue-50 text-blue-700 border-blue-100",
      Icon: AlertTriangle,
    };
  if (hasAnyMessage)
    return {
      label: en ? "Response Received" : "May Tugon",
      cls: "bg-blue-50 text-blue-700 border-blue-100",
      Icon: Clock,
    };
  return {
    label: en ? "Under Review" : "Sinusuri",
    cls: "bg-amber-50 text-amber-700 border-amber-100",
    Icon: Clock,
  };
}

function SubsidiesPage() {
  const { en, apps } = useSession();
  const [tutStep, setTutStep] = useState(0);
  const steps = tutSteps(en);

  // Steps 2–5 always show the same illustrative example card, regardless of what
  // this particular driver's real applications look like — keeps the tutorial
  // uniform and predictable for every user instead of depending on their data.
  const demoCard = (kind: "approved" | "response" | "pending" | "rejected") => {
    const meta = {
      approved: {
        label: en ? "Approved" : "Naaprubahan",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
        Icon: CheckCircle2,
        name: en ? "Sample Approved Application" : "Halimbawang Naaprubahan",
      },
      response: {
        label: en ? "New Response!" : "Bagong Tugon!",
        cls: "bg-blue-50 text-blue-700 border-blue-100",
        Icon: AlertTriangle,
        name: en ? "Sample Application with a Reply" : "Halimbawang May Tugon",
      },
      pending: {
        label: en ? "Under Review" : "Sinusuri",
        cls: "bg-amber-50 text-amber-700 border-amber-100",
        Icon: Clock,
        name: en ? "Sample Pending Application" : "Halimbawang Nakabinbin",
      },
      rejected: {
        label: en ? "Rejected" : "Tinanggihan",
        cls: "bg-red-50 text-red-700 border-red-100",
        Icon: XCircle,
        name: en ? "Sample Rejected Application" : "Halimbawang Tinanggihan",
      },
    }[kind];
    return (
      <div
        id="tut-highlight-card"
        className="relative z-[250] block rounded-[28px] border border-[#f5a623] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-4 ring-[#f5a623]"
      >
        <span className="absolute -top-2.5 left-5 rounded-full bg-[#1b2b4b] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
          {en ? "Example only" : "Halimbawa lamang"}
        </span>
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1b2b4b] to-[#2c4270] text-white shadow-md">
            <FileText className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold text-[#1b2b4b]">{meta.name}</p>
          </div>
        </div>
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${meta.cls}`}
          >
            <meta.Icon className="h-3 w-3" /> {meta.label}
          </span>
        </div>
      </div>
    );
  };

  const demoKind =
    tutStep === 2
      ? "approved"
      : tutStep === 3
        ? "response"
        : tutStep === 4
          ? "pending"
          : "rejected";

  useEffect(() => {
    if (tutStep === 0) return;
    const targetId = tutStep === 1 ? "tut-step-1" : "tut-highlight-card";
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tutStep]);

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar
        title={en ? "My Subsidies" : "Aking mga Subsidy"}
        subtitle={
          en ? `Managing ${apps.length} applications` : `Pinamamahalaan: ${apps.length} aplikasyon`
        }
        right={
          <button
            onClick={() => setTutStep(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-[#f5a623]"
            title={en ? "Open Tutorial" : "Buksan ang Tutorial"}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        }
      />

      {tutStep > 0 && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-6 backdrop-blur-[2px]">
          <div className="w-full max-w-xs rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
                {tutStep}/{steps.length}
              </div>
              <h3 className="text-lg font-bold text-white">
                {en ? "My Subsidies Guide" : "Gabay sa Aking mga Subsidy"}
              </h3>
            </div>
            <p className="mb-6 text-sm text-white/80">{steps[tutStep - 1]}</p>
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

      <div className="flex flex-col gap-6 px-5 pb-24 pt-2">
        <div
          id="tut-step-1"
          className={`relative overflow-hidden rounded-[24px] bg-[#1b2b4b] p-6 text-white shadow-xl transition-all ${tutStep === 1 ? "relative z-[250] ring-4 ring-[#f5a623]" : ""}`}
        >
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-white/10 blur-3xl" />
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10">
              <Info className="h-5 w-5 text-[#f5a623]" />
            </div>
            <div>
              <h3 className="font-bold text-white">{en ? "How it works" : "Paano ito Gumagana"}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-white/70">
                {en
                  ? "Apply once, upload requirements, and track your progress in real-time."
                  : "Mag-apply nang isang beses, mag-upload ng requirements, at subaybayan ang iyong progreso."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-extrabold text-[#1b2b4b]">
            {en ? "Your Applications" : "Iyong mga Aplikasyon"}
          </h2>

          {apps.length > 0 ? (
            <div className="space-y-4">
              {apps.map((app: any) => {
                const s = statusMeta(app, en);
                return (
                  <Link
                    key={app.id}
                    to="/subsidies-detail"
                    search={{ id: app.id }}
                    className="block rounded-[28px] border border-[#f0f0f0] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:border-[#f5a623]/30 hover:shadow-lg active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1b2b4b] to-[#2c4270] text-white shadow-md">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-extrabold text-[#1b2b4b]">
                          {app.payout_events?.program_name || (en ? "Subsidy" : "Subsidy")}
                        </p>
                        <p className="text-[12px] font-medium text-[#8c8b88]">
                          {app.payout_events?.program_agency || ""}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#c1c1c1]" />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${s.cls}`}
                      >
                        <s.Icon className="h-3 w-3" /> {s.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {tutStep >= 2 && demoCard(demoKind)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#e6e8eb] p-10 text-center">
              <FileText className="h-8 w-8 text-[#c1c1c1]" />
              <p className="mt-4 font-bold text-[#1b2b4b]">
                {en ? "No applications yet" : "Wala pang aplikasyon"}
              </p>
              {tutStep >= 2 && <div className="mt-4 w-full">{demoCard(demoKind)}</div>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/help"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#f0f0f0] bg-white py-4 text-[13px] font-bold text-[#1b2b4b] transition-all hover:bg-[#f8f9fa] active:scale-95"
          >
            <HelpCircle className="h-4 w-4" /> {en ? "Need help?" : "Kailangan ng tulong?"}
          </Link>
          <Link
            to="/apply"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#f5a623] py-4 text-[13px] font-bold text-[#1b2b4b] shadow-lg transition-all hover:bg-[#ffb94a] active:scale-95"
          >
            <Plus className="h-4 w-4" /> {en ? "New application" : "Bagong aplikasyon"}
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}
