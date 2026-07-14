import { type LucideIcon, Fuel, GraduationCap, HeartPulse, ShieldCheck, Wrench } from "lucide-react";

export type SubsidyStatus = "pending" | "approved" | "rejected" | "revision";

export type SubsidyProgram = {
  id: string;
  name: string;
  agency: string;
  description: string;
  amount: string;
  date: string;
  time: string;
  venue: string;
  deadline: string;
  icon: LucideIcon;
  color: string;
};

export const subsidyPrograms: SubsidyProgram[] = [
  {
    id: "puv-fuel-2026",
    name: "PUV Fuel Subsidy 2026",
    agency: "Department of Transportation",
    description:
      "Cash assistance for public utility jeepney and UV Express drivers affected by rising fuel prices. Php 6,500 credited directly to your linked account.",
    amount: "₱6,500.00",
    date: "Dec 12, 2026",
    time: "8:00 AM – 4:00 PM",
    venue: "LTFRB Central Office, East Ave., QC",
    deadline: "Dec 15, 2026",
    icon: Fuel,
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "service-contracting-r2",
    name: "Service Contracting Round 2",
    agency: "LTFRB",
    description:
      "Monthly guaranteed income for modern jeepney operators enrolled in the Service Contracting Program.",
    amount: "₱18,000.00",
    date: "Jan 08, 2027",
    time: "9:00 AM",
    venue: "Online submission",
    deadline: "Jan 20, 2027",
    icon: ShieldCheck,
    color: "from-sky-400 to-blue-600",
  },
  {
    id: "puv-health-care",
    name: "PUV Driver Health Care",
    agency: "DOH x PhilHealth",
    description: "Free annual medical check-up and PhilHealth top-up for accredited drivers and one dependent.",
    amount: "Free",
    date: "Feb 02, 2027",
    time: "7:00 AM – 12:00 PM",
    venue: "Barangay Health Centers nationwide",
    deadline: "Jan 28, 2027",
    icon: HeartPulse,
    color: "from-rose-400 to-pink-600",
  },
  {
    id: "training-modernization",
    name: "Driver Skills Modernization",
    agency: "TESDA",
    description: "TESDA-accredited defensive driving & EV familiarization training with allowance.",
    amount: "₱2,500 allowance",
    date: "Feb 18, 2027",
    time: "8:00 AM – 5:00 PM",
    venue: "TESDA Regional Training Centers",
    deadline: "Feb 10, 2027",
    icon: GraduationCap,
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: "unit-repair-grant",
    name: "Unit Repair Assistance",
    agency: "DOTr",
    description: "One-time grant for major engine or body repairs of registered public utility vehicles.",
    amount: "Up to ₱25,000",
    date: "Mar 05, 2027",
    time: "9:00 AM",
    venue: "DOTr Satellite Offices",
    deadline: "Feb 28, 2027",
    icon: Wrench,
    color: "from-violet-400 to-indigo-600",
  },
];

export type MyApplication = {
  id: string;
  programId: string;
  status: SubsidyStatus;
  submitted: string;
  note: string;
  hasGrievance?: boolean;
};

export const myApplications: MyApplication[] = [
  {
    id: "APP-2026-00018",
    programId: "puv-fuel-2026",
    status: "pending",
    submitted: "2 min ago",
    note: "We're reviewing your documents. Expect an update within 24 hours.",
  },
  {
    id: "APP-2026-00011",
    programId: "service-contracting-r2",
    status: "approved",
    submitted: "1 day ago",
    note: "Approved! Funds will be released to your linked eGov PH account.",
  },
  {
    id: "APP-2025-00982",
    programId: "puv-health-care",
    status: "revision",
    submitted: "3 days ago",
    note: "Please re-upload a clearer copy of your driver's license.",
    hasGrievance: true,
  },
];

export const gasStations = [
  { name: "Petron Kamias", brand: "Petron", km: "1.2 km", area: "Kamias, Quezon City", price: "₱58.10", color: "bg-red-100 text-red-700" },
  { name: "Shell Aurora", brand: "Shell", km: "1.8 km", area: "Aurora Blvd, Quezon City", price: "₱58.30", color: "bg-yellow-100 text-yellow-700" },
  { name: "Caltex EDSA", brand: "Caltex", km: "2.1 km", area: "EDSA, Quezon City", price: "₱58.45", color: "bg-blue-100 text-blue-700" },
  { name: "Phoenix Cubao", brand: "Phoenix", km: "2.7 km", area: "Cubao, Quezon City", price: "₱57.95", color: "bg-orange-100 text-orange-700" },
  { name: "Seaoil Katipunan", brand: "Seaoil", km: "3.4 km", area: "Katipunan, Quezon City", price: "₱58.60", color: "bg-cyan-100 text-cyan-700" },
];

export const notifications = [
  { id: "n1", title: "Subsidy application received", body: "We're reviewing your documents.", time: "2 min ago", type: "info" as const },
  { id: "n2", title: "Verification approved", body: "Your driver's license is now verified.", time: "1 day ago", type: "success" as const },
  { id: "n3", title: "New program: Health Care 2027", body: "Applications open Feb 2, 2027.", time: "2 days ago", type: "info" as const },
  { id: "n4", title: "Reminder: PUV Fuel Subsidy deadline", body: "Deadline is Dec 15, 2026.", time: "3 days ago", type: "warning" as const },
  { id: "n5", title: "Grievance update", body: "Your ticket #A-201 is being reviewed.", time: "5 days ago", type: "warning" as const },
];

export const adminApplicants = [
  { id: "APP-2026-00018", name: "Juan Santos", role: "PUJ Driver", city: "Metro Manila", submitted: "Today · 10:24 AM", status: "pending" as SubsidyStatus, docs: 4 },
  { id: "APP-2026-00019", name: "Maria Cruz", role: "Tricycle Driver", city: "Quezon City", submitted: "Today · 09:15 AM", status: "pending" as SubsidyStatus, docs: 4 },
  { id: "APP-2026-00020", name: "Pedro Dela Cruz", role: "PUJ Driver", city: "Caloocan City", submitted: "Yesterday · 4:32 PM", status: "pending" as SubsidyStatus, docs: 4 },
  { id: "APP-2026-00021", name: "Ana Reyes", role: "UV Express", city: "Manila", submitted: "Yesterday · 2:10 PM", status: "approved" as SubsidyStatus, docs: 4 },
  { id: "APP-2026-00022", name: "Luis Ramos", role: "Modern Jeepney", city: "Pasay", submitted: "2d ago", status: "rejected" as SubsidyStatus, docs: 3 },
];

export const helpRequests = [
  { id: "h1", name: "Juan Santos", subject: "Application Issue", time: "2 mins ago", status: "OPEN" as const },
  { id: "h2", name: "Maria Cruz", subject: "Verification Question", time: "1 hour ago", status: "OPEN" as const },
  { id: "h3", name: "Pedro Dela Cruz", subject: "Document Upload Problem", time: "3 hours ago", status: "IN PROGRESS" as const },
  { id: "h4", name: "Ana Reyes", subject: "Account Access", time: "Yesterday", status: "RESOLVED" as const },
];

export const partners = [
  { name: "DOTr", full: "Department of Transportation" },
  { name: "LTFRB", full: "Land Transportation Franchising & Regulatory Board" },
  { name: "LTO", full: "Land Transportation Office" },
  { name: "DOE", full: "Department of Energy" },
  { name: "DOH", full: "Department of Health" },
  { name: "TESDA", full: "Technical Education & Skills Development Authority" },
];