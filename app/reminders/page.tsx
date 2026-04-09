"use client";

import { useState } from "react";
import { BellRing, MessageSquare, Mail } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";

interface ReminderRule {
  id: string;
  label: string;
  description: string;
  channel: "sms" | "email";
  timing: string;
  enabled: boolean;
}

const DEFAULT_RULES: ReminderRule[] = [
  { id:"r1", label:"Booking confirmation", description:"Sent immediately after a booking is created", channel:"sms",   timing:"Immediate",    enabled:true  },
  { id:"r2", label:"24-hour reminder",     description:"Sent the day before the appointment",         channel:"sms",   timing:"24h before",   enabled:true  },
  { id:"r3", label:"2-hour reminder",      description:"Final reminder on the day of appointment",    channel:"sms",   timing:"2h before",    enabled:false },
  { id:"r4", label:"Booking confirmation", description:"Full booking details via email",              channel:"email", timing:"Immediate",    enabled:true  },
  { id:"r5", label:"Follow-up",            description:"Thank you + rebooking prompt",                channel:"email", timing:"24h after",    enabled:false },
];

export default function RemindersPage() {
  const [rules, setRules] = useState<ReminderRule[]>(DEFAULT_RULES);
  const [deposit, setDeposit]         = useState(true);
  const [depositAmount, setDepositAmt] = useState(20);
  const [cancelHours, setCancelHours]  = useState(24);
  const [noShowFee, setNoShowFee]      = useState(false);
  const [noShowPct, setNoShowPct]      = useState(50);
  const [saved, setSaved]             = useState(false);

  function toggle(id: string) {
    setRules((rs) => rs.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const smsRules   = rules.filter((r) => r.channel === "sms");
  const emailRules = rules.filter((r) => r.channel === "email");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Reminders & no-show protection"
        actions={
          <Button variant="primary" onClick={save}>
            {saved ? "Saved ✓" : "Save settings"}
          </Button>
        }
      />

      <div className="flex-1 overflow-auto px-6 py-5 space-y-6">

        {/* SMS reminders */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <MessageSquare size={14} className="text-gray-400" />
            <h2 className="text-[13px] font-semibold">SMS reminders</h2>
          </div>
          {smsRules.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-[13px] font-medium">{r.label}</p>
                <p className="text-[12px] text-gray-400">{r.description}</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{r.timing}</span>
              <button
                onClick={() => toggle(r.id)}
                className={`relative w-8 h-[18px] rounded-full transition-colors ${r.enabled ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${r.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
        </section>

        {/* Email reminders */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Mail size={14} className="text-gray-400" />
            <h2 className="text-[13px] font-semibold">Email reminders</h2>
          </div>
          {emailRules.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-[13px] font-medium">{r.label}</p>
                <p className="text-[12px] text-gray-400">{r.description}</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{r.timing}</span>
              <button
                onClick={() => toggle(r.id)}
                className={`relative w-8 h-[18px] rounded-full transition-colors ${r.enabled ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${r.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
        </section>

        {/* No-show protection */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <BellRing size={14} className="text-gray-400" />
            <h2 className="text-[13px] font-semibold">No-show protection</h2>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium">Require deposit</p>
                <p className="text-[12px] text-gray-400">Collect a deposit when booking is made</p>
              </div>
              <button
                onClick={() => setDeposit((v) => !v)}
                className={`relative w-8 h-[18px] rounded-full transition-colors ${deposit ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${deposit ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            {deposit && (
              <div className="flex items-center gap-3 pl-4 text-[13px]">
                <span className="text-gray-500">Default deposit amount</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <span className="px-2 py-1.5 bg-gray-50 text-gray-400 text-[12px]">$</span>
                  <input
                    type="number" value={depositAmount} min={0}
                    onChange={(e) => setDepositAmt(Number(e.target.value))}
                    className="w-16 px-2 py-1.5 text-[13px] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-[13px]">
              <span className="text-gray-500">Free cancellation window</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <input
                  type="number" value={cancelHours} min={1}
                  onChange={(e) => setCancelHours(Number(e.target.value))}
                  className="w-14 px-2 py-1.5 text-[13px] focus:outline-none"
                />
                <span className="px-2 py-1.5 bg-gray-50 text-gray-400 text-[12px]">hours</span>
              </div>
              <span className="text-gray-400 text-[12px]">before appointment</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium">Charge no-show fee</p>
                <p className="text-[12px] text-gray-400">Automatically charge a fee for no-shows</p>
              </div>
              <button
                onClick={() => setNoShowFee((v) => !v)}
                className={`relative w-8 h-[18px] rounded-full transition-colors ${noShowFee ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${noShowFee ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            {noShowFee && (
              <div className="flex items-center gap-3 pl-4 text-[13px]">
                <span className="text-gray-500">No-show fee</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input
                    type="number" value={noShowPct} min={0} max={100}
                    onChange={(e) => setNoShowPct(Number(e.target.value))}
                    className="w-14 px-2 py-1.5 text-[13px] focus:outline-none"
                  />
                  <span className="px-2 py-1.5 bg-gray-50 text-gray-400 text-[12px]">% of service</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
