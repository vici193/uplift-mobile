/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  FileStack,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  User,
  CalendarDays,
  MessagesSquare,
  QrCode,
} from "lucide-react";
import admin from "@/assets/admin.png";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AdminBottomNav } from "@/components/mobile/AdminBottomNav";
import { supabase } from "@/supabase";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { en } = useSession();
  const [kpi, setKpi] = useState({
    drivers: 0,
    apps: 0,
    approved: 0,
    events: 0,
    unverified: 0,
    grievances: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [
      { data: evts },
      { data: apps },
      { data: drivers },
      { data: approved },
      { data: unverified },
      { data: griev },
    ] = await Promise.all([
      supabase.from("payout_events").select("id"),
      supabase
        .from("applications")
        .select("id, drivers(full_name), payout_events(program_name), applied_at")
        .eq("status", "pending")
        .order("applied_at", { ascending: false })
        .limit(5),
      supabase.from("drivers").select("id"),
      supabase.from("applications").select("id").eq("status", "approved"),
      supabase.from("drivers").select("id").eq("verification_status", "unverified"),
      supabase.from("grievances").select("id").eq("is_draft", false),
    ]);
    setKpi({
      drivers: drivers?.length || 0,
      apps: apps?.length || 0,
      approved: approved?.length || 0,
      events: evts?.length || 0,
      unverified: unverified?.length || 0,
      grievances: griev?.length || 0,
    });
    setRecent(apps || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MobileShell bottomNav={<AdminBottomNav />}>
      <div className="relative px-5 pt-4">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1b2b4b] p-6 text-white shadow-xl transition-all duration-300 hover:bg-[#253960]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f5a623_0%,transparent_70%)] opacity-10" />
          <img
            src={admin}
            alt="Admin"
            className="absolute -bottom-7 -right-3 z-10 w-[160px] object-contain opacity-100 drop-shadow-2xl transition-transform duration-500 hover:scale-105"
          />
          <div className="relative z-20 flex items-start">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white shadow-xl">
                <User className="h-8 w-8 text-[#1b2b4b]" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/70">
                  {loading ? (en ? "Loading..." : "Loading...") : "SUBI"}
                </p>
                <p className="text-[18px] font-extrabold">
                  {en ? "Admin Panel Desk" : "Admin Panel Desk"}
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />{" "}
                  {en ? "Subsidy Core Suite" : "Pangunahing Sistema ng Subsidy"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6 px-5 pb-8">
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[14px] font-extrabold text-[#1b2b4b]">
              {en ? "Today's Overview" : "Buod Ngayon"}
            </h2>
            <Link
              to="/admin/applications"
              className="text-[11px] font-bold text-[#f5a623] hover:underline"
            >
              {en ? "View all" : "Tingnan lahat"}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: en ? "Pending Applications" : "Mga Nakabinbing Aplikasyon",
                value: kpi.apps,
                color: "bg-amber-50 text-amber-600",
                Icon: FileStack,
              },
              {
                label: en ? "Unverified Users" : "Hindi Kumpirmadong Gumagamit",
                value: kpi.unverified,
                color: "bg-blue-50 text-blue-600",
                Icon: ShieldCheck,
              },
              {
                label: en ? "Help Requests" : "Mga Hiling ng Tulong",
                value: kpi.grievances,
                color: "bg-red-50 text-red-600",
                Icon: HelpCircle,
              },
            ].map(({ label, value, color, Icon }) => (
              <div
                key={label}
                className="group flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:border-[#f5a623] hover:bg-[#f5a623]"
              >
                <div
                  className={`mb-2 grid h-10 w-10 place-items-center rounded-full ${color} transition-colors group-hover:bg-[#1b2b4b]/10`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-black text-[#1b2b4b] group-hover:text-[#1b2b4b]">
                  {value}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-[#1b2b4b]/70">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 text-center text-[11px] font-bold text-[#8c8b88]">
            <div className="rounded-2xl border border-gray-100 bg-white p-3">
              {kpi.drivers}{" "}
              <span className="font-medium">
                {en ? "total drivers" : "kabuuang bilang ng mga tsuper"}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-[14px] font-extrabold text-[#1b2b4b]">
            {en ? "Quick Actions" : "Mabilisang Aksyon"}
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {[
              { Icon: CalendarDays, label: en ? "Events" : "Kaganapan", to: "/admin/events" },
              {
                Icon: FileStack,
                label: en ? "Applications" : "Aplikasyon",
                to: "/admin/applications",
              },
              { Icon: ShieldCheck, label: en ? "Verify" : "Kumpirmahin", to: "/admin/verify" },
              { Icon: MessagesSquare, label: en ? "Support" : "Suporta", to: "/admin/support" },
              { Icon: QrCode, label: en ? "Release" : "Ilabas", to: "/admin/claims" },
            ].map((q) => (
              <Link
                key={q.label}
                to={q.to}
                className="group flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-[#f5a623] hover:bg-[#f5a623]"
              >
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-gray-50 group-hover:bg-[#1b2b4b]/10">
                  <q.Icon className="h-5 w-5 text-[#1b2b4b]" />
                </div>
                <p className="text-[9px] font-extrabold leading-tight text-[#1b2b4b]">{q.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-[14px] font-extrabold text-[#1b2b4b]">
            {en ? "Recent Pending Applications" : "Kamakailang Nakabinbing Aplikasyon"}
          </h2>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 p-6 text-center text-[12px] text-[#8c8b88]">
                {en ? "No pending applications." : "Walang nakabinbing aplikasyon."}
              </div>
            ) : (
              recent.map((a: any, i: number) => (
                <Link
                  key={i}
                  to="/admin/applications"
                  className="flex items-center gap-4 rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1b2b4b] text-sm font-black text-white">
                    {(a.drivers?.full_name || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1b2b4b]">
                      {a.drivers?.full_name}
                    </p>
                    <p className="truncate text-[11px] text-[#8c8b88]">
                      {a.payout_events?.program_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[#8c8b88]">
                      {new Date(a.applied_at).toLocaleDateString()}
                    </p>
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
