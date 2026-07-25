import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  FileText,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  Clock,
  User,
  BusFront,
  Edit,
  MessageSquare,
  BookOpen,
  ChevronUp,
} from "lucide-react";
import jeep from "@/assets/jeep.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function getGreeting(en: boolean) {
  const h = new Date().getHours();
  if (h < 12) return en ? "Good morning" : "Magandang umaga";
  if (h < 18) return en ? "Good afternoon" : "Magandang hapon";
  return en ? "Good evening" : "Magandang gabi";
}

function tutorialSteps(en: boolean, showVerification: boolean) {
  const steps = [
    {
      title: en ? "Welcome to SUBI!" : "Maligayang pagdating sa SUBI!",
      desc: en
        ? "Let's take a quick look around. This is your Home page — your profile status, name, and active subsidies show up here."
        : "Tara, mabilisang tour lang. Ito ang iyong Home page — makikita rito ang status ng iyong profile, pangalan, at mga aktibong subsidy.",
      target: "welcome-area",
    },
  ];
  if (showVerification) {
    steps.push({
      title: en ? "Verify Your Account" : "I-verify ang Account",
      desc: en
        ? "Upload your Driver's License and a selfie holding it here to get verified. Already rejected? You can resubmit your documents in the same place, or edit your information first if that's what needs correcting."
        : "I-upload dito ang iyong Driver's License at selfie kasama ito para ma-verify. Natanggihan na? Maaari kang mag-resubmit ng dokumento dito rin, o i-edit muna ang impormasyon kung iyon ang kailangang itama.",
      target: "verification-upload",
    });
  }
  steps.push(
    {
      title: en ? "Latest Updates" : "Pinakabagong Update",
      desc: en
        ? "Check application status and important updates here."
        : "Tingnan dito ang status ng aplikasyon at mahahalagang update.",
      target: "latest-updates",
    },
    {
      title: en ? "Apply for Subsidy" : "Mag-apply ng Subsidy",
      desc: en
        ? "Browse payout events and apply for subsidies."
        : "Tingnan ang mga payout event at mag-apply ng subsidy.",
      target: "apply-subsidy",
    },
    {
      title: en ? "My Subsidies" : "Ang Aking mga Subsidy",
      desc: en
        ? "Summary of your active, approved, and pending applications."
        : "Buod ng iyong aktibo, naaprubahan, at nakabinbing aplikasyon.",
      target: "my-subsidies",
    },
  );
  steps.push({
    title: en ? "Help & Support" : "Tulong at Suporta",
    desc: en
      ? "Access FAQs, guides, and contact support."
      : "I-access ang FAQ, mga gabay, at makipag-ugnayan sa suporta.",
    target: "support-sections",
  });
  return steps;
}

function HomePage() {
  const navigate = useNavigate();
  const {
    en,
    driver,
    apps,
    showTutorial,
    setShowTutorial,
    refreshApps,
    handleUploadDocument,
    onboardingTourActive,
    advanceOnboardingTour,
    endOnboardingTour,
  } = useSession();
  const [dashFiles, setDashFiles] = useState<FileList | null>(null);
  const [uploadingDash, setUploadingDash] = useState(false);

  const pending = apps.filter(
    (a) => a.status !== "approved" && a.status !== "claimed" && a.status !== "rejected",
  ).length;
  const approved = apps.filter((a) => a.status === "approved" || a.status === "claimed").length;
  const active = apps.length;

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    if (onboardingTourActive && tutorialStep === 0) setTutorialStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingTourActive]);

  useEffect(() => {
    refreshApps();
    const interval = setInterval(() => refreshApps(), 15000);
    return () => clearInterval(interval);
  }, []);

  const steps = tutorialSteps(en, driver?.verification_status !== "verified");
  const isHighlighted = (target: string) =>
    tutorialStep > 0 && steps[tutorialStep - 1]?.target === target;

  useEffect(() => {
    if (tutorialStep > 0) {
      const target = steps[tutorialStep - 1]?.target;
      const el = document.getElementById(target);
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - window.innerHeight * 0.18,
          behavior: "smooth",
        });
      }
    }
  }, [tutorialStep, en]);

  const recentUpdates = apps
    .filter((a) => a.status === "approved" || a.status === "rejected")
    .slice(0, 2)
    .map((a) => ({
      id: a.id, // <-- Added ID to pass into the Link
      title:
        a.status === "approved"
          ? en
            ? "Application approved"
            : "Naaprubahan ang aplikasyon"
          : en
            ? "Application rejected"
            : "Tinanggihan ang aplikasyon",
      desc: a.payout_events?.program_name || (en ? "Subsidy application" : "Aplikasyon ng subsidy"),
      icon: a.status === "approved" ? CheckCircle2 : AlertTriangle,
      color: a.status === "approved" ? "bg-[#10b981]" : "bg-red-500",
    }));

  const renderTutorialCard = (targetId: string, positionClasses: string) => {
    if (tutorialStep === 0 || steps[tutorialStep - 1]?.target !== targetId) return null;
    const stepData = steps[tutorialStep - 1];
    return (
      <div
        className={`absolute z-[300] rounded-3xl border-2 border-[#f5a623] bg-[#1b2b4b] p-6 shadow-2xl ${positionClasses}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-sm font-bold text-[#1b2b4b]">
            {tutorialStep}/{steps.length}
          </div>
          <h3 className="text-lg font-bold text-white">{stepData.title}</h3>
        </div>
        <p className="mb-6 text-sm text-white/80">{stepData.desc}</p>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setTutorialStep(0);
              setShowTutorial(false);
              if (onboardingTourActive) endOnboardingTour();
            }}
            className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            {en ? "Skip" : "Laktawan"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (tutorialStep < steps.length) setTutorialStep((s) => s + 1);
              else {
                setTutorialStep(0);
                setShowTutorial(false);
                if (onboardingTourActive) advanceOnboardingTour();
              }
            }}
            className="flex-1 rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
          >
            {tutorialStep === steps.length ? (en ? "Finish" : "Tapusin") : en ? "Next" : "Susunod"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <MobileShell
      bottomNav={
        <div className="fixed bottom-0 z-[100] w-full max-w-md border-t bg-white">
          <div className="relative">
            <div
              className={cn(
                "absolute bottom-25 right-6 z-[101] transition-all duration-300",
                tutorialStep > 0 ? "hidden" : "flex",
              )}
            >
              <button
                onClick={() => setTutorialStep(1)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5a623] text-[#1b2b4b] opacity-50 shadow-lg hover:scale-105 hover:opacity-100 active:scale-95"
              >
                <HelpCircle size={28} />
              </button>
            </div>
            <UserBottomNav />
          </div>
        </div>
      }
    >
      <div className="relative min-h-screen pb-24">
        {/* Dim backdrop alone; tutorial boxes are rendered inline to flow correctly underneath highlighted elements */}
        {tutorialStep > 0 && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]" />
        )}

        <div
          className={cn(
            "px-5 pb-2 pt-6 transition-all duration-300 relative",
            isHighlighted("welcome-area")
              ? "z-[250] m-2 rounded-[36px] border-4 border-[#f5a623] bg-white shadow-2xl"
              : "",
          )}
          id="welcome-area"
        >
          <div className="group relative overflow-hidden rounded-[32px] border-[8px] border-white bg-[#1b2b4b] p-6 shadow-xl transition-all duration-300 hover:border-[#1b2b4b] hover:bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
            <img
              src={jeep}
              alt="Jeepney"
              className="absolute -bottom-8 -right-20 z-10 w-[320px] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
            />
            <div className="relative z-20 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#f5a623] bg-[#e6e8eb]">
                  <User className="h-7 w-7 text-[#1b2b4b]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-white transition-colors duration-300 group-hover:text-[#1b2b4b]">
                  <p className="text-[13px] font-medium opacity-80">{getGreeting(en)},</p>
                  <h1 className="text-xl font-extrabold tracking-wide">
                    {driver?.name || "Driver"}.
                  </h1>
                  {driver?.verification_status === "verified" && (
                    <span className="mt-1.5 inline-flex w-max items-center gap-1.5 rounded-full border border-[#10b981]/40 bg-[#10b981]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={3} />{" "}
                      {en ? "Verified Driver" : "Verified na Driver"}
                    </span>
                  )}
                  {driver?.verification_status === "unverified" && (
                    <span className="mt-1.5 inline-flex w-max items-center gap-1.5 rounded-full border border-[#f5a623]/40 bg-[#f5a623]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {driver.license_url
                        ? en
                          ? "Verification in review"
                          : "Sinusuri ang Verification"
                        : en
                          ? "Verification needed"
                          : "Kailangan ng Verification"}
                    </span>
                  )}
                  {driver?.verification_status === "rejected" && (
                    <span className="mt-1.5 inline-flex w-max items-center gap-1.5 rounded-full border border-red-400/40 bg-red-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {en ? "Verification rejected" : "Tinanggihan ang Verification"}
                    </span>
                  )}
                </div>
              </div>
              <Link
                to="/updates"
                className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
              >
                <Bell className="h-5 w-5 text-white group-hover:text-[#1b2b4b]" />
                {recentUpdates.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-[#1b2b4b] bg-[#f5a623] text-[11px] font-extrabold text-[#1b2b4b]">
                    {recentUpdates.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
          {renderTutorialCard(
            "welcome-area",
            "top-full left-1/2 -translate-x-1/2 mt-2 w-[300px] sm:w-[320px]",
          )}
        </div>

        <div className="flex flex-col gap-8 px-5 pb-8 pt-2">
          {driver?.verification_status !== "verified" && (
            <div
              id="verification-upload"
              className={cn(
                "rounded-[24px] border-2 border-dashed border-[#f5a623]/50 bg-[#fffaf0] p-5 transition-all relative",
                isHighlighted("verification-upload")
                  ? "z-[250] border-solid bg-white shadow-2xl ring-4 ring-[#f5a623]"
                  : "",
              )}
            >
              <p className="mb-1 text-[14px] font-extrabold text-[#1b2b4b]">
                🪪 {en ? "Submit Verification Documents" : "Mag-submit ng Dokumento"}
              </p>
              <ul className="mb-3 list-disc pl-4 text-[11px] leading-relaxed text-[#8c8b88]">
                <li>
                  {en
                    ? "Selfie while holding your Driver's License"
                    : "Selfie habang hawak ang iyong Driver's License"}
                </li>
                <li>{en ? "Front of Driver's License" : "Harap ng Driver's License"}</li>
                <li>{en ? "Back of Driver's License" : "Likod ng Driver's License"}</li>
                <li>
                  {en
                    ? "Supporting document (OR/CR, franchise cert, etc.)"
                    : "Suportang dokumento (OR/CR, franchise cert, atbp.)"}
                </li>
              </ul>

              {driver?.verification_status === "rejected" && (
                <button
                  onClick={() => navigate({ to: "/edit" })}
                  className="mb-3 flex items-center gap-1.5 rounded-full border border-[#1b2b4b]/20 bg-white px-3 py-1.5 text-[11px] font-bold text-[#1b2b4b] hover:bg-gray-50"
                >
                  ✏️ {en ? "Edit My Information" : "I-edit ang Aking Impormasyon"}
                </button>
              )}

              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#f5a623]/40 bg-white p-4 text-center">
                <span className="text-2xl">{dashFiles && dashFiles.length > 0 ? "✅" : "📂"}</span>
                <span className="text-[12px] font-semibold text-[#1b2b4b]">
                  {dashFiles && dashFiles.length > 0
                    ? `${dashFiles.length} ${en ? "file(s) selected" : "file(s) napili"}`
                    : en
                      ? "Tap to select files (JPG, PNG, PDF, Word, Excel)"
                      : "I-tap para pumili ng mga file"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) setDashFiles(e.target.files);
                  }}
                />
              </label>

              {dashFiles && dashFiles.length > 0 && (
                <button
                  onClick={async () => {
                    setUploadingDash(true);
                    await handleUploadDocument(Array.from(dashFiles));
                    setDashFiles(null);
                    setUploadingDash(false);
                  }}
                  disabled={uploadingDash}
                  className="mt-3 w-full rounded-2xl bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] disabled:opacity-60"
                >
                  {uploadingDash
                    ? en
                      ? "Uploading..."
                      : "Ina-upload..."
                    : en
                      ? `Submit ${dashFiles.length} Document(s)`
                      : `Isumite ang ${dashFiles.length} Dokumento`}
                </button>
              )}

              {renderTutorialCard(
                "verification-upload",
                "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
              )}
            </div>
          )}

          <section
            id="latest-updates"
            className={cn(
              "transition-all duration-300 relative",
              isHighlighted("latest-updates")
                ? "z-[250] rounded-[36px] border-4 border-[#f5a623] bg-white p-2 shadow-2xl"
                : "",
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[16px] font-extrabold text-[#1b2b4b]">
                {en ? "Latest updates" : "Pinakabagong Update"}
              </h2>
              <Link to="/updates" className="text-[12px] font-bold text-[#f5a623] hover:underline">
                {en ? "See all" : "Lahat"}
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentUpdates.length === 0 ? (
                <div className="rounded-[24px] border border-[#f0f0f0] bg-white p-4 text-center text-[13px] text-[#8c8b88]">
                  {en ? "No updates yet." : "Wala pang update."}
                </div>
              ) : (
                recentUpdates.map((update, i) => (
                  <Link
                    to="/subsidies-detail" // <-- Changed from /updates to /subsidies-detail
                    search={{ id: update.id }} // <-- Passed the specific application ID
                    key={i}
                    className="flex items-center gap-3 rounded-[24px] border border-[#f0f0f0] bg-[#ffffff] p-4 shadow-sm"
                  >
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${update.color} shadow-sm`}
                    >
                      <update.icon className="h-5 w-5 text-[#ffffff]" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-[14px] font-bold text-[#1b2b4b]">
                        {update.title}
                      </p>
                      <p className="truncate text-[12px] text-[#8c8b88]">{update.desc}</p>
                    </div>
                    <ChevronRight className="ml-1 h-5 w-5 text-[#8c8b88]" />
                  </Link>
                ))
              )}
            </div>
            {renderTutorialCard(
              "latest-updates",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </section>

          <div
            id="apply-subsidy"
            className={cn(
              "relative transition-all duration-300",
              isHighlighted("apply-subsidy")
                ? "z-[250] rounded-[32px] border-4 border-[#f5a623] bg-white p-2 shadow-2xl"
                : "",
            )}
          >
            <Link
              to="/apply"
              className="group relative flex items-center gap-4 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#f5a623] to-[#ffd166] p-5 shadow-lg transition-all"
            >
              <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#1b2b4b]">
                <BusFront className="h-8 w-8 text-[#f5a623]" strokeWidth={2} />
              </div>
              <div className="relative flex min-w-0 flex-1 flex-col justify-center">
                <span className="inline-flex w-max items-center gap-1 rounded-full bg-[#1b2b4b]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1b2b4b]">
                  <Star className="h-3 w-3 fill-[#1b2b4b]" />{" "}
                  {en ? "Available Now" : "Available Ngayon"}
                </span>
                <p className="mt-1 text-[18px] font-extrabold leading-tight text-[#1b2b4b]">
                  {en ? "Apply for Subsidy" : "Mag-apply para sa Subsidy"}
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-[#1b2b4b]/70">
                  {en
                    ? "Multiple programs · Check eligibility"
                    : "Mga programa · Tingnan ang eligibility"}
                </p>
              </div>
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffffff]">
                <ChevronRight className="h-6 w-6 text-[#1b2b4b]" strokeWidth={2.5} />
              </div>
            </Link>
            {renderTutorialCard(
              "apply-subsidy",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </div>

          <section
            id="my-subsidies"
            className={cn(
              "transition-all duration-300 relative",
              isHighlighted("my-subsidies")
                ? "z-[250] rounded-[36px] border-4 border-[#f5a623] bg-white p-2 shadow-2xl"
                : "",
            )}
          >
            <h2 className="mb-4 px-1 text-[16px] font-extrabold text-[#1b2b4b]">
              {en ? "My Subsidies" : "Ang Aking mga Subsidy"}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: en ? "Active" : "Aktibo",
                  val: active,
                  icon: FileText,
                  color: "text-[#3b82f6]",
                },
                {
                  label: en ? "Approved" : "Naaprubahan",
                  val: approved,
                  icon: CheckCircle2,
                  color: "text-[#10b981]",
                },
                {
                  label: en ? "Pending" : "Nakabinbin",
                  val: pending,
                  icon: Clock,
                  color: "text-[#f5a623]",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[24px] border border-[#f0f0f0] bg-[#ffffff] p-4 text-center shadow-sm"
                >
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xl font-black leading-none text-[#1b2b4b]">{s.val}</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8c8b88]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {renderTutorialCard(
              "my-subsidies",
              "top-full left-1/2 -translate-x-1/2 mt-4 w-[300px] sm:w-[320px]",
            )}
          </section>

          <div
            className={cn(
              "flex flex-col gap-4 transition-all duration-300 relative",
              isHighlighted("support-sections")
                ? "z-[250] rounded-[40px] border-4 border-[#f5a623] bg-white p-2 shadow-2xl"
                : "",
            )}
            id="support-sections"
          >
            <div className="rounded-[32px] border border-[#f0f0f0] bg-white p-5 shadow-sm">
              <button
                onClick={() => setExpandedSection(expandedSection === "help" ? null : "help")}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f5a623]/10 text-[#f5a623]">
                    <HelpCircle size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#1b2b4b]">
                      {en ? "FAQs & Guides" : "FAQ at mga Gabay"}
                    </p>
                    <p className="text-[11px] text-[#8c8b88]">
                      {en ? "Find help and support" : "Humanap ng tulong"}
                    </p>
                  </div>
                </div>
                {expandedSection === "help" ? <ChevronUp size={20} /> : <ChevronRight size={20} />}
              </button>
              {expandedSection === "help" && (
                <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                  <Link
                    to="/help"
                    className="flex items-center justify-between rounded-2xl p-3 text-[13px] font-bold text-[#1b2b4b] hover:bg-gray-50"
                  >
                    {en ? "Read FAQs" : "Basahin ang FAQ"} <BookOpen size={16} />
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-[#f0f0f0] bg-white p-5 shadow-sm">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === "concerns" ? null : "concerns")
                }
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#1b2b4b]">
                      {en ? "My concerns" : "Aking mga Alalahanin"}
                    </p>
                    <p className="text-[11px] text-[#8c8b88]">
                      {en ? "Grievances & issues" : "Mga hinaing at isyu"}
                    </p>
                  </div>
                </div>
                {expandedSection === "concerns" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
              {expandedSection === "concerns" && (
                <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                  <Link
                    to="/myconcern"
                    className="flex items-center justify-between rounded-2xl p-3 text-[13px] font-bold text-[#1b2b4b] hover:bg-gray-50"
                  >
                    {en ? "View my concerns" : "Tingnan ang aking mga alalahanin"}{" "}
                    <MessageSquare size={16} />
                  </Link>
                  <Link
                    to="/grievance"
                    className="flex items-center justify-between rounded-2xl p-3 text-[13px] font-bold text-[#1b2b4b] hover:bg-gray-50"
                  >
                    {en ? "File a Grievance" : "Mag-file ng Reklamo"} <Edit size={16} />
                  </Link>
                </div>
              )}
            </div>

            {/* Pop upwards for the last item to prevent overflow at the bottom of the screen */}
            {renderTutorialCard(
              "support-sections",
              "bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] sm:w-[320px]",
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
