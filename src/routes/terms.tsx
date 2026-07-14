import { createFileRoute, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  FileSignature, 
  ShieldCheck, 
  Share2, 
  Database, 
  SearchCheck, 
  UserCog 
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/terms")({
  component: TermsAndPrivacy,
});

const termsData = [
  {
    title: "Terms of Service",
    description: "By using UPLIFT you agree to provide truthful information for subsidy applications. Fraudulent claims may result in permanent account suspension and referral to authorities.",
    icon: FileSignature,
  },
  {
    title: "Privacy Policy",
    description: "Your personal data is used solely to process subsidy applications and coordinate with partner government agencies. We do not sell your data. You may request deletion at any time.",
    icon: ShieldCheck,
  },
  {
    title: "Data sharing",
    description: "Verified information may be shared with LTFRB, LTO, and DOE for eligibility validation. e-Gov PH access is read-only.",
    icon: Share2,
  },
];

const privacyDetails = [
  {
    title: "What we collect",
    description: "Name, phone, driver's license details, vehicle info, and documents you upload for verification and subsidy applications.",
    icon: Database,
  },
  {
    title: "Why we collect it",
    description: "To verify eligibility, process subsidies, and coordinate with partner government agencies (LTFRB, LTO, DOE).",
    icon: SearchCheck,
  },
  {
    title: "Your rights",
    description: "You may request access, correction, or deletion of your data at any time via Settings or by contacting our data protection officer.",
    icon: UserCog,
  },
];

function TermsAndPrivacy() {
  const router = useRouter();

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-y-auto bg-[#1b2b4b] font-sans text-[#ffffff]">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f5a623] opacity-10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-[#ffffff] opacity-5 blur-[120px]" />

      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#ffffff]/10 bg-[#1b2b4b]/80 px-6 py-5 backdrop-blur-md">
        <button
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffffff]/10 transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-wide text-[#ffffff]">
          Terms & Privacy
        </h1>
      </div>

      <div className="relative z-10 flex flex-col gap-6 px-5 py-6">
        
        <div className="flex flex-col gap-4">
          <h2 className="px-2 text-sm font-bold uppercase tracking-widest text-[#f5a623]">
            General Information
          </h2>
          {termsData.map((item, index) => (
            <div
              key={index}
              className="group relative w-full cursor-pointer rounded-[28px] bg-[#e6e8eb] p-[6px] shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#f5a623] hover:shadow-[0_8px_25px_rgba(245,166,35,0.4)] active:scale-[0.98]"
            >
              <div className="flex h-full w-full items-start gap-4 rounded-[22px] border border-[#e6e8eb] bg-[#ffffff] p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fef3c7] text-[#1b2b4b] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#f5a623]">
                  <item.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-[#1b2b4b]">
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[#8c8b88]">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="my-2 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ffffff]/20 to-transparent" />

        <div className="flex flex-col gap-4 pb-10">
          <h2 className="px-2 text-sm font-bold uppercase tracking-widest text-[#f5a623]">
            Privacy Specifics
          </h2>
          {privacyDetails.map((item, index) => (
            <div
              key={index}
              className="group relative w-full cursor-pointer rounded-[28px] bg-[#e6e8eb] p-[6px] shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#f5a623] hover:shadow-[0_8px_25px_rgba(245,166,35,0.4)] active:scale-[0.98]"
            >
              <div className="flex h-full w-full items-start gap-4 rounded-[22px] border border-[#e6e8eb] bg-[#ffffff] p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fef3c7] text-[#1b2b4b] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#f5a623]">
                  <item.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-[#1b2b4b]">
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[#8c8b88]">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}