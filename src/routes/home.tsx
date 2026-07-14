import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, CheckCircle2, FileText, IdCard, HelpCircle, AlertTriangle, ChevronRight, Star, Clock, User, BusFront, Edit, MessageSquare, BookOpen, ChevronUp } from "lucide-react";
import jeep from "@/assets/jeep.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { myApplications } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const tutorialSteps = [
  { id: 1, title: "Welcome Area", desc: "Your profile status, name, and active subsidies.", target: "welcome-area" },
  { id: 2, title: "Latest Updates", desc: "Check application status and important updates here.", target: "latest-updates" },
  { id: 3, title: "Apply for Subsidy", desc: "Browse payout events and apply for subsidies.", target: "apply-subsidy" },
  { id: 4, title: "Quick Actions", desc: "Manage profile, track status, or sync records.", target: "quick-actions" },
  { id: 5, title: "My Subsidies", desc: "Summary of your active, approved, and pending apps.", target: "my-subsidies" },
  { id: 6, title: "Help & Support", desc: "Access FAQs, guides, and contact support.", target: "support-sections" }
];

function HomePage() {
  const pending = myApplications.filter((a) => a.status === "pending").length;
  const approved = myApplications.filter((a) => a.status === "approved").length;
  const active = myApplications.length;

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    if (tutorialStep > 0) {
      const el = document.getElementById(tutorialSteps[tutorialStep - 1].target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tutorialStep]);

  const isHighlighted = (step: number) => tutorialStep === step;

  return (
    <MobileShell bottomNav={
      <div className="fixed bottom-0 w-full max-w-md z-[100] bg-white border-t">
        <div className="relative">
          <div className={cn("absolute bottom-25 right-6 z-[101] transition-all duration-300", tutorialStep > 0 ? "hidden" : "flex")}>
            <button 
              onClick={() => setTutorialStep(1)}
              className="h-14 w-14 rounded-full bg-[#f5a623] text-[#1b2b4b] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 opacity-50 hover:opacity-100"
            >
              <HelpCircle size={28} />
            </button>
          </div>
          <UserBottomNav />
        </div>
      </div>
    }>
      <div className="relative min-h-screen pb-24">
        {tutorialStep > 0 && (
          <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-6 backdrop-blur-[2px]">
            <div className={cn(
              "absolute z-[300] w-full max-w-xs p-4 transition-all duration-500",
              tutorialStep <= 2 ? "bottom-24" : "top-30"
            )}>
              <div className="bg-[#1b2b4b] border-2 border-[#f5a623] rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#f5a623] text-[#1b2b4b] w-10 h-10 rounded-full flex items-center justify-center font-bold">{tutorialStep} / 6</div>
                    <h3 className="text-lg font-bold text-white">{tutorialSteps[tutorialStep - 1].title}</h3>
                </div>
                <p className="text-sm text-white/80 mb-6">{tutorialSteps[tutorialStep - 1].desc}</p>
                <div className="flex gap-3">
                  <button onClick={() => setTutorialStep(0)} className="flex-1 py-3 rounded-full border border-white/20 text-white font-bold text-sm">Skip</button>
                  <button 
                    onClick={() => tutorialStep < 6 ? setTutorialStep(s => s + 1) : setTutorialStep(0)} 
                    className="flex-1 py-3 rounded-full bg-[#f5a623] text-[#1b2b4b] font-bold text-sm"
                  >
                    {tutorialStep === 6 ? "Finish" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={cn("px-5 pt-6 pb-2 transition-all duration-300", isHighlighted(1) ? "relative z-[250] bg-white border-4 border-[#f5a623] rounded-[36px] m-2 shadow-2xl" : "")} id="welcome-area">
          <div className="group relative overflow-hidden bg-[#1b2b4b] p-6 rounded-[32px] shadow-xl border-[8px] border-white transition-all duration-300 hover:bg-white hover:border-[#1b2b4b]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
            <img src={jeep} alt="Jeepney" className="absolute -right-20 -bottom-8 w-[320px] object-contain drop-shadow-2xl z-10 transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-20 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e6e8eb] border-2 border-[#f5a623]">
                  <User className="h-7 w-7 text-[#1b2b4b]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-white transition-colors duration-300 group-hover:text-[#1b2b4b]">
                  <p className="text-[13px] font-medium opacity-80">Good morning,</p>
                  <h1 className="text-xl font-extrabold tracking-wide">Juan Santos</h1>
                  <span className="mt-1.5 inline-flex w-max items-center gap-1.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={3} /> Verified Driver
                  </span>
                </div>
              </div>
              <Link to="/updates" className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95">
                <Bell className="h-5 w-5 text-white group-hover:text-[#1b2b4b]" />
                <span className="absolute -right-1 -top-1 grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-[#1b2b4b] bg-[#f5a623] text-[11px] font-extrabold text-[#1b2b4b]">2</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 px-5 pb-8 pt-2">
          <section id="latest-updates" className={cn("transition-all duration-300", isHighlighted(2) ? "z-[250] bg-white border-4 border-[#f5a623] rounded-[36px] p-2" : "")}>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[16px] font-extrabold text-[#1b2b4b]">Latest updates</h2>
              <Link to="/updates" className="text-[12px] font-bold text-[#f5a623] hover:underline">See all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { title: "Subsidy application received", desc: "We're reviewing your documents", icon: FileText, color: "bg-[#f5a623]" },
                { title: "Verification approved", desc: "Your license is now verified", icon: CheckCircle2, color: "bg-[#10b981]" }
              ].map((update, i) => (
                <Link to="/updates" key={i} className="flex items-center gap-3 rounded-[24px] bg-[#ffffff] p-4 shadow-sm border border-[#f0f0f0]">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${update.color} shadow-sm`}>
                    <update.icon className="h-5 w-5 text-[#ffffff]" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <p className="truncate text-[14px] font-bold text-[#1b2b4b]">{update.title}</p>
                    <p className="truncate text-[12px] text-[#8c8b88]">{update.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#8c8b88] ml-1" />
                </Link>
              ))}
            </div>
          </section>

          <Link to="/apply" id="apply-subsidy" className={cn("group relative flex items-center gap-4 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#f5a623] to-[#ffd166] p-5 shadow-lg transition-all", isHighlighted(3) ? "z-[250] border-4 border-[#f5a623] bg-white" : "")}>
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#1b2b4b]">
              <BusFront className="h-8 w-8 text-[#f5a623]" strokeWidth={2} />
            </div>
            <div className="relative min-w-0 flex-1 flex flex-col justify-center">
              <span className="inline-flex w-max items-center gap-1 rounded-full bg-[#1b2b4b]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#1b2b4b] uppercase tracking-wider">
                <Star className="h-3 w-3 fill-[#1b2b4b]" /> Available Now
              </span>
              <p className="mt-1 text-[18px] font-extrabold text-[#1b2b4b] leading-tight">Apply for Subsidy</p>
              <p className="mt-0.5 text-[11px] font-bold text-[#1b2b4b]/70">Multiple programs · Check eligibility</p>
            </div>
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffffff]">
              <ChevronRight className="h-6 w-6 text-[#1b2b4b]" strokeWidth={2.5} />
            </div>
          </Link>

          <section id="quick-actions" className={cn("transition-all duration-300", isHighlighted(4) ? "z-[250] bg-white border-4 border-[#f5a623] rounded-[36px] p-2" : "")}>
            <h2 className="mb-4 px-1 text-[16px] font-extrabold text-[#1b2b4b]">Quick actions</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Edit Info", desc: "Manage profile", icon: Edit, to: "/profile" },
                { label: "Track", desc: "View status", icon: FileText, to: "/subsidies" },
                { label: "e-Gov", desc: "Sync records", icon: IdCard, to: "/profile" }
              ].map((item) => (
                <Link key={item.label} to={item.to} className="group flex flex-col items-center justify-center gap-2 rounded-[28px] bg-[#ffffff] p-5 text-center shadow-sm border border-[#f0f0f0] transition-all hover:bg-[#f5a623]">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[#f5a623]/10 border border-[#f5a623]/20 group-hover:bg-[#1b2b4b]/10">
                    <item.icon className="h-7 w-7 text-[#f5a623] group-hover:text-[#1b2b4b]" />
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-[12px] font-extrabold text-[#1b2b4b] leading-tight">{item.label}</span>
                    <span className="text-[9px] font-bold text-[#8c8b88] leading-tight">{item.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section id="my-subsidies" className={cn("transition-all duration-300", isHighlighted(5) ? "z-[250] bg-white border-4 border-[#f5a623] rounded-[36px] p-2" : "")}>
            <h2 className="mb-4 px-1 text-[16px] font-extrabold text-[#1b2b4b]">My Subsidies</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Active", val: active, icon: FileText, color: "text-[#3b82f6]" },
                { label: "Approved", val: approved, icon: CheckCircle2, color: "text-[#10b981]" },
                { label: "Pending", val: pending, icon: Clock, color: "text-[#f5a623]" }
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center justify-center gap-1.5 rounded-[24px] bg-[#ffffff] p-4 text-center shadow-sm border border-[#f0f0f0]">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xl font-black text-[#1b2b4b] leading-none">{s.val}</span>
                  <span className="text-[9px] font-extrabold text-[#8c8b88] uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          <div className={cn("flex flex-col gap-4 transition-all duration-300", isHighlighted(6) ? "z-[250] bg-white border-4 border-[#f5a623] rounded-[40px] p-2" : "")} id="support-sections">
              <div className="rounded-[32px] bg-white border border-[#f0f0f0] p-5 shadow-sm">
                  <button onClick={() => setExpandedSection(expandedSection === "help" ? null : "help")} className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f5a623]/10 text-[#f5a623]"><HelpCircle size={20} /></div>
                          <div className="text-left">
                              <p className="font-bold text-[#1b2b4b]">FAQs & Guides</p>
                              <p className="text-[11px] text-[#8c8b88]">Find help and support</p>
                          </div>
                      </div>
                      {expandedSection === "help" ? <ChevronUp size={20} /> : <ChevronRight size={20} />}
                  </button>
                  {expandedSection === "help" && (
                      <div className="mt-5 space-y-2 pt-4 border-t border-gray-100">
                          <Link to="/help" className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 font-bold text-[13px] text-[#1b2b4b]">Read FAQs <BookOpen size={16} /></Link>
                          <Link to="/message-admin" className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 font-bold text-[13px] text-[#1b2b4b]">Message Support <MessageSquare size={16} /></Link>
                      </div>
                  )}
              </div>

              <div className="rounded-[32px] bg-white border border-[#f0f0f0] p-5 shadow-sm">
                  <button onClick={() => setExpandedSection(expandedSection === "concerns" ? null : "concerns")} className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-500"><AlertTriangle size={20} /></div>
                          <div className="text-left">
                              <p className="font-bold text-[#1b2b4b]">My concerns</p>
                              <p className="text-[11px] text-[#8c8b88]">Grievances & issues</p>
                          </div>
                      </div>
                      {expandedSection === "concerns" ? <ChevronUp size={20} /> : <ChevronRight size={20} />}
                  </button>
                  {expandedSection === "concerns" && (
                      <div className="mt-5 space-y-2 pt-4 border-t border-gray-100">
                          <Link to="/myconcern" className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 font-bold text-[13px] text-[#1b2b4b]">View my concerns <MessageSquare size={16} /></Link>
                          <Link to="/grievance" className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 font-bold text-[13px] text-[#1b2b4b]">File a Grievance <Edit size={16} /></Link>
                      </div>
                  )}
              </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}