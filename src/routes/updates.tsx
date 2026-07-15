/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, Bell, Calendar, Info } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { UserBottomNav } from "@/components/mobile/UserBottomNav";
import { TopBar } from "@/components/mobile/TopBar";
import { useSession } from "@/lib/session-context";

export const Route = createFileRoute("/updates")({
  component: UpdatesPage,
});

// Ported directly from dashboard.jsx's Notifications() — same logic, same modal data shape.
// Real notifications here are computed fresh from live data each render, not stored records,
// so (unlike mobile's mockup) there's no separate "/updates-detail" page — tapping an item
// opens a modal with the full details and relevant action, exactly like your working app does.
function buildNotifs(en: boolean, apps: any[], appointment: any, driver: any, openEvents: any[]) {
  const notifs: any[] = [];
  const now = new Date();
  const existingEventIds = apps.map((a) => a.event_id);

  if (driver) {
    if (driver.verification_status === "verified") {
      notifs.push({
        sortDate: now,
        type: "approved",
        time: en ? "Verification" : "Verification",
        msg: en
          ? "✅ Your account has been verified. Future applications will auto-fill."
          : "✅ Na-verify na ang iyong account. Awtomatikong mapupunan ang mga susunod na aplikasyon.",
        modal: {
          icon: "✅",
          title: en ? "Account Verified!" : "Na-verify ang Account!",
          body: en
            ? "Your identity has been verified. Future subsidy applications will auto-fill from your profile."
            : "Na-verify na ang iyong pagkakakilanlan. Awtomatikong mapupunan ang mga susunod na aplikasyon.",
          closeLabel: en ? "Got it" : "Nakuha ko",
        },
      });
    } else if (driver.verification_status === "rejected") {
      notifs.push({
        sortDate: now,
        type: "rejected",
        time: en ? "Verification" : "Verification",
        msg: en
          ? `❌ Verification rejected. Please correct: ${driver.verification_notes || "flagged fields"}`
          : `❌ Tinanggihan ang verification. Pakitama: ${driver.verification_notes || "mga field"}`,
        modal: {
          icon: "❌",
          title: en ? "Verification Rejected" : "Tinanggihan ang Verification",
          body: en
            ? `Please correct: ${driver.verification_notes}`
            : `Pakitama: ${driver.verification_notes}`,
          action: "editprofile",
          actionLabel: en ? "Edit My Information" : "I-edit ang Aking Impormasyon",
          closeLabel: en ? "Later" : "Mamaya na",
        },
      });
    } else {
      notifs.push({
        sortDate: now,
        type: "info",
        time: en ? "Verification" : "Verification",
        msg: en
          ? "⏳ Verification is being reviewed. Expect results within 5–7 business days."
          : "⏳ Sinusuri ang verification. Asahan ang resulta sa loob ng 5–7 araw ng trabaho.",
        modal: null,
      });
    }
  }

  (openEvents || []).forEach((ev) => {
    if (existingEventIds.includes(ev.id)) return;
    if (!ev.application_deadline || new Date(ev.application_deadline) < now) return;
    const publishedRecently =
      (now.getTime() - new Date(ev.created_at || now).getTime()) / (1000 * 60 * 60 * 24) <= 3;
    if (publishedRecently) {
      const deadlineStr = new Date(ev.application_deadline).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      notifs.unshift({
        sortDate: new Date(ev.created_at || now),
        type: "info",
        time: en ? "New" : "Bago",
        msg: en
          ? `📢 New subsidy available: ${ev.program_name} (${ev.program_amount}). Apply before ${deadlineStr}.`
          : `📢 Bagong subsidy: ${ev.program_name} (${ev.program_amount}). Mag-apply bago ang ${deadlineStr}.`,
        modal: {
          icon: "📢",
          title: en ? "New Subsidy Available!" : "Bagong Subsidy!",
          body: en
            ? `${ev.program_name} (${ev.program_amount}) is now open. Deadline: ${deadlineStr}.`
            : `Bukas na ang ${ev.program_name} (${ev.program_amount}). Deadline: ${deadlineStr}.`,
          action: { type: "apply", eventId: ev.id },
          actionLabel: en ? "Apply Now" : "Mag-apply Na",
          closeLabel: en ? "Maybe Later" : "Mamaya Na Lang",
        },
      });
    }
  });

  apps.forEach((a: any) => {
    const deadline = a.payout_events?.application_deadline;
    if (deadline) {
      const hoursLeft = (new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursLeft > 0 && hoursLeft <= 48) {
        notifs.unshift({
          sortDate: now,
          type: "rejected",
          time: hoursLeft <= 24 ? (en ? "Today" : "Ngayon") : en ? "Tomorrow" : "Bukas",
          msg: `⚠️ ${en ? "Deadline for" : "Deadline ng"} ${a.payout_events?.program_name}: ${new Date(deadline).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
          modal: null,
        });
      }
    }
    if (a.status === "approved") {
      notifs.push({
        sortDate: new Date(a.updated_at || a.applied_at),
        type: "approved",
        time: en ? "Recent" : "Kamakailan",
        msg: en
          ? `🎉 ${a.payout_events?.program_name} approved! Claim at ${a.payout_events?.venue} on ${a.payout_events?.event_date}.`
          : `🎉 Naaprubahan ang ${a.payout_events?.program_name}! Kunin sa ${a.payout_events?.venue} sa ${a.payout_events?.event_date}.`,
        modal: {
          icon: "🎉",
          title: en ? "Application Approved!" : "Naaprubahan ang Aplikasyon!",
          body: en
            ? `Your application for ${a.payout_events?.program_name} was approved. Claim at ${a.payout_events?.venue} on ${a.payout_events?.event_date}.`
            : `Naaprubahan ang ${a.payout_events?.program_name}. Kunin sa ${a.payout_events?.venue} sa ${a.payout_events?.event_date}.`,
          action: { type: "view_subsidy", appId: a.id },
          actionLabel: en ? "View Details" : "Tingnan ang Detalye",
          closeLabel: en ? "Got it" : "Nakuha ko",
        },
      });
    } else if (a.status === "pending") {
      notifs.push({
        sortDate: new Date(a.applied_at),
        type: "info",
        time: en ? "Recent" : "Kamakailan",
        msg: en
          ? `${a.payout_events?.program_name} application is pending review.`
          : `Ang aplikasyon sa ${a.payout_events?.program_name} ay naghihintay ng review.`,
        modal: null,
      });
    } else if (a.status === "rejected" && a.rejection_fields) {
      notifs.push({
        sortDate: new Date(a.updated_at || a.applied_at),
        type: "rejected",
        time: en ? "Recent" : "Kamakailan",
        msg: en
          ? `❌ ${a.payout_events?.program_name} rejected. Reason: ${a.rejection_fields}`
          : `❌ Tinanggihan ang ${a.payout_events?.program_name}. Dahilan: ${a.rejection_fields}`,
        modal: {
          icon: "❌",
          title: en ? "Application Rejected" : "Tinanggihan ang Aplikasyon",
          body: en
            ? `Your application for ${a.payout_events?.program_name} was rejected. Reason: ${a.rejection_fields}.`
            : `Tinanggihan ang ${a.payout_events?.program_name}. Dahilan: ${a.rejection_fields}.`,
          action: "editprofile",
          actionLabel: en ? "Edit My Information" : "I-edit ang Impormasyon",
          action2: { type: "view_subsidy", appId: a.id },
          action2Label: en ? "View Application" : "Tingnan ang Aplikasyon",
          closeLabel: en ? "Later" : "Mamaya na",
        },
      });
    }
  });

  if (appointment) {
    notifs.push({
      sortDate: new Date(appointment.created_at || now),
      type: "appointment",
      time: en ? "Recent" : "Kamakailan",
      msg: en
        ? `📅 Appointment confirmed: ${appointment.assigned_date}, ${appointment.time_slot}, ${appointment.venue}.`
        : `📅 Nakumpirma ang appointment: ${appointment.assigned_date}, ${appointment.time_slot}, ${appointment.venue}.`,
      modal: {
        icon: "📅",
        title: en ? "Appointment Confirmed" : "Nakumpirma ang Appointment",
        body: en
          ? `Your payout slot is on ${appointment.assigned_date} at ${appointment.time_slot}, ${appointment.venue}. Ref: ${appointment.reference_code}`
          : `Ang iyong slot ay sa ${appointment.assigned_date} sa ${appointment.time_slot}, ${appointment.venue}. Ref: ${appointment.reference_code}`,
        action: { type: "view_subsidy", appId: appointment.application_id },
        actionLabel: en ? "View My Subsidies" : "Tingnan ang Mga Subsidy",
        closeLabel: en ? "Got it" : "Nakuha ko",
      },
    });
  }

  notifs.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  return notifs;
}

const typeIcon: Record<string, any> = {
  approved: CheckCircle2,
  rejected: AlertTriangle,
  appointment: Calendar,
  info: Info,
};
const typeCls: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-amber-50 text-amber-600",
  appointment: "bg-blue-50 text-blue-600",
  info: "bg-[#f8f9fa] text-[#1b2b4b]",
};

function UpdatesPage() {
  const { en, apps, appointment, driver, openEvents } = useSession();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<any>(null);

  const notifs = buildNotifs(en, apps, appointment, driver, openEvents);

  function handleAction(action: any) {
    if (!action) return;
    if (typeof action === "string") {
      if (action === "editprofile") navigate({ to: "/profile" });
    } else if (action.type === "apply") {
      navigate({ to: "/apply" });
    } else if (action.type === "view_subsidy") {
      navigate({ to: "/subsidies-detail", search: { id: action.appId } });
    }
    setActiveModal(null);
  }

  return (
    <MobileShell bottomNav={<UserBottomNav />}>
      <TopBar
        title={en ? "Updates" : "Mga Update"}
        subtitle={en ? "Tap any item for details and actions" : "I-tap ang item para sa detalye"}
      />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#e6e8eb] p-10 text-center">
            <Bell className="h-8 w-8 text-[#c1c1c1]" />
            <p className="mt-4 font-bold text-[#1b2b4b]">
              {en ? "No updates yet." : "Wala pang update."}
            </p>
          </div>
        ) : (
          notifs.map((n, i) => {
            const Icon = typeIcon[n.type] || Info;
            return (
              <button
                key={i}
                onClick={() => n.modal && setActiveModal(n.modal)}
                disabled={!n.modal}
                className="group flex w-full items-start gap-4 rounded-[28px] border border-[#f0f0f0] bg-white p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-lg disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <div
                  className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl ${typeCls[n.type] || typeCls.info}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium leading-relaxed text-[#1b2b4b]">
                      {n.msg}
                    </p>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-[#8c8b88]">
                    {n.time}
                    {n.modal ? ` · ${en ? "tap for details" : "i-tap para sa detalye"}` : ""}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* NEW UPDATED MODAL STRUCTURE */}
      {activeModal && (
        <div
          // Use absolute inset-0 to cover the full height of the scroll container
          className="absolute inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          {/* Use sticky top-0 with 100dvh height to perfectly center the modal box in the user's view, regardless of scroll position */}
          <div className="pointer-events-none sticky top-0 flex h-[100dvh] w-full items-center justify-center p-6">
            <div
              className="pointer-events-auto max-h-[85vh] w-full max-w-xs overflow-y-auto rounded-[32px] bg-white p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto text-4xl">{activeModal.icon}</div>
              <h3 className="mt-3 text-lg font-black text-[#1b2b4b]">{activeModal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8c8b88]">{activeModal.body}</p>
              <div className="mt-6 flex flex-col gap-2">
                {activeModal.action && (
                  <button
                    onClick={() => handleAction(activeModal.action)}
                    className="rounded-full bg-[#f5a623] py-3 text-sm font-bold text-[#1b2b4b]"
                  >
                    {activeModal.actionLabel}
                  </button>
                )}
                {activeModal.action2 && (
                  <button
                    onClick={() => handleAction(activeModal.action2)}
                    className="rounded-full border border-[#1b2b4b]/20 py-3 text-sm font-bold text-[#1b2b4b]"
                  >
                    {activeModal.action2Label}
                  </button>
                )}
                <button
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-[#1b2b4b]/20 py-3 text-sm font-bold text-[#1b2b4b]"
                >
                  {activeModal.closeLabel || (en ? "Close" : "Isara")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}