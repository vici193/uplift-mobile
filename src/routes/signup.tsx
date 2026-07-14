import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, User, Car, Shield, ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const steps = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Vehicle", icon: Car },
  { id: 3, label: "Security", icon: Shield },
];

const ADDRESS_DATA: any = {
  "NCR": {
    "Metro Manila": ["Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Pasay", "Caloocan", "Mandaluyong", "San Juan", "Marikina", "Las Piñas", "Muntinlupa", "Parañaque", "Valenzuela", "Malabon", "Navotas", "Pateros"]
  },
  "Region III": {
    "Bulacan": ["Malolos", "Meycauayan", "San Jose del Monte", "Baliuag", "Plaridel", "Santa Maria"],
    "Pampanga": ["San Fernando", "Angeles City", "Mabalacat", "Guagua", "Lubao"],
    "Nueva Ecija": ["Palayan", "Cabanatuan", "San Jose", "Science City of Muñoz"]
  },
  "Region IV-A": {
    "Cavite": ["Imus", "Bacoor", "Dasmariñas", "General Trias", "Tagaytay", "Trece Martires"],
    "Laguna": ["Calamba", "Santa Rosa", "Biñan", "San Pablo", "Cabuyao"],
    "Batangas": ["Batangas City", "Lipa", "Tanauan", "Santo Tomas"]
  }
};

const questions = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite teacher's name?",
  "What was your first vehicle plate number?",
];

function Field({ label, description, ...props }: { label: string, description?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-[#ffffff]">{label}</span>
        {description && <span className="text-[10px] text-[#8c8b88]">{description}</span>}
      </div>
      <input
        {...props}
        className="w-full rounded-2xl border border-[#ffffff]/20 bg-[#ffffff]/5 px-4 py-3.5 text-sm text-[#ffffff] outline-none transition-all placeholder:text-[#8c8b88] focus:border-[#f5a623] focus:bg-[#ffffff]/10 focus:ring-4 focus:ring-[#f5a623]/10"
      />
    </label>
  );
}

function Select({ label, options, value, onChange, placeholder = "Select..." }: { label: string, options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#ffffff]">{label}</span>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-[#ffffff]/20 bg-[#ffffff]/5 px-4 py-3.5 text-sm text-[#ffffff] outline-none transition-all focus:border-[#f5a623] focus:bg-[#ffffff]/10 focus:ring-4 focus:ring-[#f5a623]/10"
      >
        <option value="" className="bg-[#1b2b4b]">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt} className="bg-[#1b2b4b]">{opt}</option>)}
      </select>
    </label>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agree, setAgree] = useState(false);
  
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  const next = () => (step < 3 ? setStep(step + 1) : agree && navigate({ to: "/otp" }));
  const back = () => (step > 1 ? setStep(step - 1) : navigate({ to: "/" }));

  return (
    <MobileShell className="relative flex min-h-screen flex-col overflow-y-auto bg-[#1b2b4b] font-sans text-[#ffffff]">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f5a623] opacity-10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-96 w-96 rounded-full bg-[#ffffff] opacity-5 blur-[120px]" />

      <div className="sticky top-0 z-20 flex items-center gap-4 bg-[#1b2b4b]/90 px-6 pt-8 pb-4 backdrop-blur-md">
        <button onClick={back} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffffff]/10 transition-all hover:bg-[#f5a623] hover:text-[#1b2b4b] active:scale-90">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-wide text-[#ffffff]">CREATE AN ACCOUNT</h1>
          <p className="text-xs font-medium text-[#8c8b88]">Step {step} of 3</p>
        </div>
      </div>

      <div className="relative z-10 px-6 pt-6">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className={cn("flex items-center", i < steps.length - 1 ? "flex-1" : "")}>
              <div className="relative flex flex-col items-center">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300", step >= s.id ? "bg-[#f5a623] text-[#1b2b4b] shadow-[0_0_15px_rgba(245,166,35,0.4)] scale-110" : "border-2 border-[#ffffff]/15 bg-[#1b2b4b] text-[#8c8b88]")}>
                  {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn("absolute -bottom-6 w-max text-[11px] font-bold tracking-wider transition-colors duration-300", step >= s.id ? "text-[#f5a623]" : "text-[#8c8b88]")}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={cn("mx-3 h-[3px] flex-1 rounded-full transition-colors duration-500", step > s.id ? "bg-[#f5a623]" : "bg-[#ffffff]/10")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-20 flex flex-col gap-8 px-6 pb-6">
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Personal Information</h3>
              <Field label="Last name *" placeholder="e.g. Santos" />
              <Field label="First name *" placeholder="e.g. Juan" />
              <Field label="Middle name *" placeholder="e.g. Dela Cruz" />
              <label className="flex items-center gap-2 text-[12px] -mt-2 text-[#ffffff]/70"><input type="checkbox" /> I have no middle name</label>
              <Field label="Extension Name *" placeholder="e.g. Jr" />
              <label className="flex items-center gap-2 text-[12px] -mt-2 text-[#ffffff]/70"><input type="checkbox" /> I have no extension name</label>
              <Select label="Sex *" options={["Male", "Female", "Other"]} value="" onChange={() => {}} />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Date of Birth</h3>
              <div className="grid grid-cols-2 gap-3">
                  <Select label="Month *" options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]} value="" onChange={() => {}} />
                  <Select label="Day *" options={Array.from({length: 31}, (_, i) => String(i+1))} value="" onChange={() => {}} />
              </div>
              <Field label="Year (YYYY) *" placeholder="e.g. 1985" />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Address</h3>
              <Select label="Region *" options={Object.keys(ADDRESS_DATA)} value={region} onChange={(v) => {setRegion(v); setProvince(""); setCity("");}} />
              <Select label="Province *" options={region ? Object.keys(ADDRESS_DATA[region]) : []} value={province} onChange={(v) => {setProvince(v); setCity("");}} placeholder={region ? "Select..." : "Select region first"} />
              <Select label="City / Municipality *" options={(region && province) ? ADDRESS_DATA[region][province] : []} value={city} onChange={setCity} placeholder={province ? "Select..." : "Select province first"} />
              <Field label="Barangay *" placeholder="e.g. Brgy. Poblacion" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider mb-2">Vehicle and Franchise</h3>
            <Select label="Denomination (Vehicle Type) *" options={["PUJ", "UV Express", "Modern Jeep"]} value="" onChange={() => {}} />
            <Field label="Case Number *" placeholder="2020-XXXX" />
            <Field label="Operator's Name *" placeholder="Transport entity or individual name" />
            <Field label="Cooperative Name *" placeholder="e.g. Quezon City TODA Inc." />
            <Field label="Plate Number *" placeholder="ABC 1234" />
            <Field label="Chassis Number *" placeholder="XXXXXXXXXX" />
            <Field label="Driver's License Number *" placeholder="C01-XX-XXXXXX" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Contact</h3>
                <Field label="Mobile Number *" placeholder="09XX XXX XXXX" />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Account Security</h3>
                <Field label="Password *" type="password" placeholder="Create a password" />
                <Field label="Confirm Password *" type="password" placeholder="Re-enter your password" />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Account Recovery</h3>
                <Select label="Security Question 1 *" options={questions} value="" onChange={() => {}} />
                <Field label="Your Answer *" placeholder="Type your answer" />
                <Select label="Security Question 2 *" options={questions} value="" onChange={() => {}} />
                <Field label="Your Answer *" placeholder="Type your answer" />
            </div>

            <div className="space-y-4 pt-4 border-t border-[#ffffff]/10">
                <h3 className="text-sm font-bold text-[#f5a623] uppercase tracking-wider">Terms and Conditions</h3>
                <div className="rounded-2xl bg-[#ffffff]/5 p-4 border border-[#ffffff]/10">
                    <p className="text-[11px] text-[#ffffff]/70 leading-relaxed italic">
                        DATA PRIVACY CONSENT — In accordance with Republic Act No. 10173 (Data Privacy Act of 2012), the information collected in this form shall be used solely for the purpose of processing, validation, and implementation of the Fuel Subsidy Program.
                    </p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-5 w-5 accent-[#f5a623]" />
                    <span className="text-[12px] font-bold text-[#ffffff]">I give my consent to the collection and processing of my personal data.</span>
                </label>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={back} className="flex-1 rounded-full border border-[#ffffff]/40 bg-transparent py-4 text-[15px] font-bold text-[#ffffff] active:scale-95 transition-all">Back</button>
          <button onClick={next} className="flex-1 rounded-full bg-[#f5a623] py-4 text-[15px] font-bold text-[#1b2b4b] active:scale-95 transition-all shadow-lg shadow-[#f5a623]/20">
            {step === 3 ? "Continue to Verification" : "Continue"}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}