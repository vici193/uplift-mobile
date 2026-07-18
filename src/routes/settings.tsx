import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Globe, Moon, Lock, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function Toggle({ initial }: { initial?: boolean }) {
  const [on, setOn] = useState(initial ?? false);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`h-7 w-12 rounded-full p-1 transition-all duration-300 ${on ? "bg-[#f5a623]" : "bg-gray-200"}`}
    >
      <div className={`h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

function SettingsPage() {
  const { en } = useSession();

  const settingItems = en ? [
    { icon: Bell, label: "Push notifications", active: true },
    { icon: Bell, label: "SMS notifications", active: false },
    { icon: Moon, label: "Dark mode", active: false },
  ] : [
    { icon: Bell, label: "Mga abiso sa aplikasyon", active: true },
    { icon: Bell, label: "Mga abiso sa SMS", active: false },
    { icon: Moon, label: "Dark Mode", active: false },
  ];

  return (
    <MobileShell>
      <TopBar title={en ? "Settings" : "Mga Pagsasaayos"} onBack={() => history.back()} />

      <div className="px-5 pt-4 pb-24 space-y-6">

        {/* Account Preferences */}
        <div className="bg-white border border-[#f0f0f0] rounded-[24px] p-2 shadow-sm">
          {settingItems.map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-3">
              <div className="h-10 w-10 rounded-2xl bg-gray-50 grid place-items-center">
                <item.icon size={18} className="text-[#1b2b4b]" />
              </div>
              <p className="flex-1 text-sm font-bold text-[#1b2b4b]">{item.label}</p>
              <Toggle initial={item.active} />
            </div>
          ))}
        </div>

        {/* Account & Security */}
        <div className="bg-white border border-[#f0f0f0] rounded-[24px] p-2 shadow-sm">
          <div className="flex items-center gap-4 p-3">
            <div className="h-10 w-10 rounded-2xl bg-gray-50 grid place-items-center">
              <Globe size={18} className="text-[#1b2b4b]" />
            </div>
            <p className="flex-1 text-sm font-bold text-[#1b2b4b]">{en ? "Language" : "Wika"}</p>
            <select className="text-xs font-bold text-[#f5a623] bg-transparent focus:outline-none">
              <option>English</option>
              <option>Filipino</option>
            </select>
          </div>

          <Link to="/password" className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-all rounded-xl">
            <div className="h-10 w-10 rounded-2xl bg-gray-50 grid place-items-center">
              <Lock size={18} className="text-[#1b2b4b]" />
            </div>
            <p className="flex-1 text-sm font-bold text-[#1b2b4b]">{en ? "Security & Password" : "Seguridad at Password"}</p>
            <ChevronRight size={18} className="text-[#c1c1c1]" />
          </Link>
        </div>

        {/* Support & Legal */}
        <div className="bg-white border border-[#f0f0f0] rounded-[24px] p-2 shadow-sm">
          <Link to="/help" className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-all rounded-xl">
            <div className="h-10 w-10 rounded-2xl bg-gray-50 grid place-items-center">
              <HelpCircle size={18} className="text-[#1b2b4b]" />
            </div>
            <p className="flex-1 text-sm font-bold text-[#1b2b4b]">{en ? "Help & FAQs" : "Help & FAQs"}</p>
            <ChevronRight size={18} className="text-[#c1c1c1]" />
          </Link>
          <Link to="/terms" className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-all rounded-xl">
            <div className="h-10 w-10 rounded-2xl bg-gray-50 grid place-items-center">
              <FileText size={18} className="text-[#1b2b4b]" />
            </div>
            <p className="flex-1 text-sm font-bold text-[#1b2b4b]">{en ? "Terms & Privacy" : "Mga Tuntunin at Pagiging Pribado"}</p>
            <ChevronRight size={18} className="text-[#c1c1c1]" />
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}