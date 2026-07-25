import { HelpCircle } from "lucide-react";
import { useSession } from "@/lib/session-context";

// Shown once, right after a brand-new driver finishes the auto-run onboarding
// tour (Home -> Subsidies -> Apply -> Edit Profile). Reminds them that every
// page's walkthrough can be replayed later via that page's "?" icon.
export function OnboardingOutroModal() {
  const { en, showOnboardingOutro, closeOnboardingOutro } = useSession();

  if (!showOnboardingOutro) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-[28px] bg-[#1b2b4b] p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5a623]">
          <HelpCircle className="h-7 w-7 text-[#1b2b4b]" />
        </div>
        <h2 className="text-lg font-bold text-white">{en ? "You're all set!" : "Handa ka na!"}</h2>
        <p className="mt-2 text-sm text-white/80">
          {en
            ? "Need help on a page later? Just tap the ? icon anytime to see that page's guide again."
            : "Kailangan ng tulong sa isang page mamaya? I-tap lang ang ? icon sa sa kanang itaas na bahagi ng screen sa anumang oras para makita ulit ang gabay ng page na iyon."}
        </p>
        <button
          onClick={closeOnboardingOutro}
          className="mt-6 w-full rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b] transition-transform hover:scale-105 active:scale-95"
        >
          {en ? "Got it" : "Nakuha ko"}
        </button>
      </div>
    </div>
  );
}
