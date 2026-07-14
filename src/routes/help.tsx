import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, HelpCircle, Mail } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

const faqs = [
  { q: "How do I use this app?", a: "This app helps you apply for and track fuel subsidies. Use the home dashboard to view active programs, tap 'Apply' to start your application, and monitor your status under 'My Subsidies'. Ensure your eGov PH account is linked to handle verification and payments." },
  { q: "How do I apply for a subsidy?", a: "Go to the 'Apply' section, choose a program that fits your vehicle, and follow the on-screen steps. Approval typically takes 24–48 hours depending on volume." },
  { q: "How will I receive my funds?", a: "Approved subsidies are credited directly to your eGov PH linked wallet. Ensure your digital wallet is active and fully verified to receive incoming transfers." },
  { q: "Can I file a grievance?", a: "Yes. Head to the 'My concerns' section on the home page to file a formal grievance. Our dedicated support team reviews all submissions within 24 hours." },
  { q: "How do I update my documents?", a: "Open your Profile, select 'Edit my information', and re-upload the necessary documents. Our team will re-validate your profile once changes are submitted." },
  { q: "Are there age requirements for drivers?", a: "Yes, you must be at least 18 years old and hold a valid, non-expired Professional Driver's License." },
  { q: "What if my application is rejected?", a: "Rejected applications will display a specific reason in the 'My Subsidies' section. You can correct the issues mentioned and re-submit your application immediately." },
  { q: "Is my personal data secure?", a: "Absolutely. All information synced via eGov PH is encrypted and used solely for identity verification and subsidy processing. We do not sell or share your data." },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <MobileShell>
      <TopBar title="Need help?" />
      
      <div className="space-y-6 px-5 pt-4 pb-24">
        <div className="rounded-[32px] bg-[#1b2b4b] p-8 text-white shadow-xl flex flex-col items-center text-center">
            <div className="bg-white/10 p-4 rounded-full mb-4">
                <HelpCircle className="h-8 w-8 text-[#f5a623]" />
            </div>
          <p className="text-xl font-black">We're here to help</p>
          <p className="text-xs text-white/60 mt-1 max-w-[200px]">Browse our knowledge base for quick solutions to your questions.</p>
        </div>

        <section>
          <h2 className="mb-4 text-[14px] font-extrabold text-[#1b2b4b] uppercase tracking-wider px-1">Frequently asked</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="group overflow-hidden rounded-[24px] bg-white border border-[#f0f0f0] shadow-sm transition-all hover:border-[#f5a623]/30 hover:shadow-md">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left transition-all"
                >
                  <span className="text-sm font-bold text-[#1b2b4b] pr-4">{f.q}</span>
                  <ChevronDown className={cn(
                      "h-5 w-5 text-[#c1c1c1] transition-transform duration-300 group-hover:text-[#f5a623]", 
                      open === i && "rotate-180"
                  )} />
                </button>
                {open === i && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-xs leading-relaxed text-[#8c8b88] bg-gray-50 p-4 rounded-xl">{f.a}</p>
                    </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-[24px] bg-gray-50 p-6 text-center border border-gray-100 shadow-sm">
            <Mail className="h-8 w-8 mx-auto text-[#1b2b4b] mb-3" />
            <p className="font-bold text-sm text-[#1b2b4b]">Still need assistance?</p>
            <p className="text-xs text-[#8c8b88] mt-1 mb-4">Our support team is available 24/7 via email.</p>
            <Link to="/message-admin" className="block bg-[#1b2b4b] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#2a3f68] transition-all">Contact Admin</Link>
        </div>
      </div>
    </MobileShell>
  );
}
