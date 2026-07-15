/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  QrCode,
  FileText,
  Eye,
  EyeOff,
  HelpCircle,
  MapPin,
  Calendar,
  RefreshCw,
  Pencil,
} from "lucide-react";
import QRCode from "qrcode";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute("/subsidies-detail")({
  component: SubsidyDetailPage,
  validateSearch: searchSchema,
});

function SubsidyDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { en, apps, allAppointments } = useSession();

  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const app = apps.find((a: any) => a.id === id);
  // Matched by application_id, not event_id — application_id is unique per application
  // and can never drift, unlike event_id which broke if a driver reapplied to the same event.
  const appt = allAppointments.find((a: any) => a.application_id === id);

  useEffect(() => {
    if (showQR && appt?.reference_code && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, appt.reference_code, {
        width: 200,
        margin: 2,
        color: { dark: "#1b2b4b", light: "#ffffff" },
      });
    }
  }, [showQR, appt?.reference_code]);

  if (!app) {
    return (
      <MobileShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-medium text-[#8c8b88]">
            {en ? "Application not found." : "Hindi nahanap ang aplikasyon."}
          </p>
          <Link to="/subsidies" className="mt-4 font-bold text-[#f5a623] underline">
            {en ? "Back to My Subsidies" : "Bumalik sa Aking mga Subsidy"}
          </Link>
        </div>
      </MobileShell>
    );
  }

  const latestMsg =
    app.application_messages?.length > 0
      ? [...app.application_messages].sort(
        (x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime(),
      )[0]
      : null;

  return (
    <MobileShell>
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-100 bg-white/90 px-6 pb-4 pt-8 backdrop-blur-xl">
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else {
              navigate({ to: "/subsidies" });
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-[#1b2b4b]" />
        </button>
        <h1 className="font-bold text-[#1b2b4b]">
          {en ? "Subsidy Details" : "Detalye ng Subsidy"}
        </h1>
      </div>

      <div className="flex flex-col items-center px-6 pb-24 pt-8 text-center">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-[32px] bg-gradient-to-br from-[#1b2b4b] to-[#2c4270] text-white shadow-xl shadow-gray-200">
          <FileText className="h-12 w-12" />
        </div>

        <h1 className="text-2xl font-black leading-tight text-[#1b2b4b]">
          {app.payout_events?.program_name || (en ? "Subsidy" : "Subsidy")}
        </h1>
        <p className="mt-1 text-sm font-bold text-[#f5a623]">
          {app.payout_events?.program_agency || ""}
        </p>

        {/* Rejected: show reason, and offer reapply if the rejection was for fixable fields
            (not blocked by an admin's "do not allow reapply" decision) and the deadline hasn't passed */}
        {app.status === "rejected" && (
          <>
            <div className="mt-8 w-full rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-sm leading-relaxed text-[#1b2b4b]">
              <p className="mb-2 font-bold text-red-600">
                ❌ {en ? "Application Rejected" : "Tinanggihan ang Aplikasyon"}
              </p>
              {app.rejection_fields
                ? en
                  ? `Please correct: ${app.rejection_fields}`
                  : `Pakitama: ${app.rejection_fields}`
                : en
                  ? "See the message below for details."
                  : "Tingnan ang mensahe sa ibaba."}
            </div>

            {(() => {
              const deadline = app.payout_events?.application_deadline;
              const deadlinePassed = deadline ? new Date(deadline) < new Date() : false;
              const canReapply = !!app.rejection_has_fields && !deadlinePassed;
              if (!canReapply) return null;
              return (
                <div className="mt-3 flex w-full flex-col gap-2">
                  <button
                    onClick={() => navigate({ to: "/edit" })}
                    className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1b2b4b] py-3.5 text-sm font-bold text-[#1b2b4b]"
                  >
                    <Pencil className="h-4 w-4" />{" "}
                    {en ? "Fix Details in Profile" : "Ayusin ang Detalye sa Profile"}
                  </button>
                  <button
                    onClick={() =>
                      navigate({ to: "/apply-detail", search: { eventId: app.event_id } })
                    }
                    className="flex items-center justify-center gap-2 rounded-full bg-[#f5a623] py-3.5 text-sm font-bold text-[#1b2b4b] shadow-lg"
                  >
                    <RefreshCw className="h-4 w-4" />{" "}
                    {en ? "Reapply for this Subsidy" : "Mag-reapply para sa Subsidy na ito"}
                  </button>
                </div>
              );
            })()}
          </>
        )}

        {/* Real appointment/QR — only shows once approved AND an appointment exists */}
        {app.status === "approved" && appt && (
          <>
            <div className="mt-8 w-full rounded-[28px] border border-gray-100 bg-white p-5 text-left shadow-sm">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#8c8b88]">
                {en ? "Active Appointment" : "Aktibong Appointment"}
              </p>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#f5a623]" />
                <div>
                  <p className="font-bold text-[#1b2b4b]">{appt.assigned_date}</p>
                  <p className="text-xs text-[#8c8b88]">{appt.time_slot}</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#f5a623]" />
                <div>
                  <p className="font-bold text-[#1b2b4b]">{appt.venue}</p>
                  <p className="text-xs text-[#8c8b88]">
                    {en
                      ? "Bring your Driver's License + reference code"
                      : "Dalhin ang Driver's License + reference code"}
                  </p>
                </div>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-[#8c8b88]">
                {en ? "Ref:" : "Ref:"}{" "}
                <span className="font-bold text-[#f5a623]">{appt.reference_code}</span>
              </div>
            </div>

            <div className="mt-6 w-full">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="font-bold text-[#1b2b4b]">{en ? "My Access QR" : "Aking QR"}</h3>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#8c8b88] transition-colors hover:text-[#1b2b4b]"
                >
                  {showQR ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showQR ? (en ? "Hide QR" : "Itago ang QR") : en ? "Reveal QR" : "Ipakita ang QR"}
                </button>
              </div>

              <div
                className={cn(
                  "flex w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 transition-all duration-500",
                  showQR
                    ? "border-[#f5a623] bg-white p-8 shadow-xl"
                    : "border-[#1b2b4b] bg-[#1b2b4b] p-8 shadow-lg",
                )}
              >
                {showQR ? (
                  <div className="flex flex-col items-center">
                    <canvas ref={canvasRef} className="rounded-lg" />
                    <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-widest text-[#8c8b88]">
                      {en ? "Present at Venue" : "Ipakita sa Venue"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-lg font-bold text-white">
                      {en ? "Secure Access QR" : "Secure Access QR"}
                    </p>
                    <p className="text-xs text-white/60">
                      {en ? "Tap reveal to display code" : "I-tap ang ipakita para makita ang code"}
                    </p>
                    <QrCode className="mt-2 h-16 w-16 text-white/20" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {app.status === "approved" && !appt && (
          <div className="mt-8 w-full rounded-2xl border border-[#f5a623]/30 bg-[#fffaf0] p-4 text-sm text-[#1b2b4b]">
            {en
              ? "Approved — your appointment details will appear here shortly."
              : "Naaprubahan — lalabas dito ang detalye ng appointment sa lalong madaling panahon."}
          </div>
        )}

        {latestMsg && (
          <div className="mt-8 w-full text-left">
            <h3 className="mb-2 font-bold text-[#1b2b4b]">
              {en ? "Instructions from Agency" : "Tagubilin mula sa Ahensya"}
            </h3>
            <div className="rounded-2xl border border-[#f5a623]/20 bg-[#fffaf0] p-5 text-sm leading-relaxed text-[#1b2b4b]/80">
              {latestMsg.message}
            </div>
          </div>
        )}

        <Link
          to="/help"
          search={{ appId: app.id }}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1b2b4b] p-4 font-bold text-white transition-colors hover:bg-[#253960]"
        >
          <HelpCircle size={20} />
          {en ? "Need help?" : "Kailangan ng tulong?"}
        </Link>
      </div>
    </MobileShell>
  );
}