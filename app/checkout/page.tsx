"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useAppointments, useUpdateAppointment } from "@/hooks/useApi";
import { PageHeader, Badge, Avatar, Button, Spinner } from "@/components/ui";
import type { Appointment } from "@/types";

const AVATAR_COLORS = ["#378ADD","#1D9E75","#D85A30","#9B59B6","#BA7517","#0F6E56"];
const TIP_PCTS = [0, 10, 15, 20];

export default function CheckoutPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: appts = [], isLoading } = useAppointments({ date: today, status: "confirmed" });
  const updateAppt = useUpdateAppointment();

  const [selected, setSelected]   = useState<Appointment | null>(null);
  const [tipPct, setTipPct]       = useState(0);
  const [method, setMethod]       = useState<"card" | "cash">("card");
  const [done, setDone]           = useState<number[]>([]);

  const price    = selected?.service?.price ?? 0;
  const tip      = Math.round(price * tipPct) / 100;
  const total    = price + tip;

  async function checkout() {
    if (!selected) return;
    await updateAppt.mutateAsync({ id: selected.id, data: { status: "completed", paid: true } });
    setDone((d) => [...d, selected.id]);
    setSelected(null);
    setTipPct(0);
  }

  const unpaid = appts.filter((a) => !done.includes(a.id));

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: appointment list */}
      <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[13px] font-semibold">Today's appointments</p>
          <p className="text-[12px] text-gray-400">{unpaid.length} awaiting checkout</p>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading && <div className="flex justify-center pt-8"><Spinner /></div>}
          {!isLoading && unpaid.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <CheckCircle size={32} strokeWidth={1.2} />
              <p className="text-[13px]">All checked out!</p>
            </div>
          )}
          {unpaid.map((a) => (
            <div
              key={a.id}
              onClick={() => { setSelected(a); setTipPct(0); }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors ${
                selected?.id === a.id ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <Avatar name={a.client?.name ?? "?"} color={AVATAR_COLORS[(a.client_id ?? 0) % AVATAR_COLORS.length]} size={34} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{a.client?.name}</p>
                <p className="text-[12px] text-gray-400 truncate">{a.service?.name} · {a.time}</p>
              </div>
              <p className="text-[13px] font-semibold shrink-0">${a.service?.price}</p>
            </div>
          ))}
          {/* Completed */}
          {done.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">Checked out</p>
              {appts.filter((a) => done.includes(a.id)).map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-1.5 text-gray-400">
                  <CheckCircle size={13} className="text-green-500" />
                  <span className="text-[12px]">{a.client?.name} — {a.service?.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: checkout panel */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-auto">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <p className="text-[14px]">Select an appointment to check out</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full py-8 px-4 flex flex-col gap-5">

            {/* Summary card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={selected.client?.name ?? "?"} color={AVATAR_COLORS[(selected.client_id) % AVATAR_COLORS.length]} size={40} />
                <div>
                  <p className="font-semibold">{selected.client?.name}</p>
                  <p className="text-[12px] text-gray-400">{selected.service?.name} · {selected.staff_member?.name}</p>
                </div>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">{selected.service?.name}</span>
                  <span className="font-medium">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tip ({tipPct}%)</span>
                  <span className="font-medium">${tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-[15px]">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tip selector */}
            <div>
              <p className="text-[12px] text-gray-500 mb-2">Add tip</p>
              <div className="grid grid-cols-4 gap-2">
                {TIP_PCTS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPct(pct)}
                    className={`py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                      tipPct === pct
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pct === 0 ? "No tip" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-[12px] text-gray-500 mb-2">Payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {(["card", "cash"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-2.5 rounded-lg text-[13px] font-medium border capitalize transition-colors ${
                      method === m
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={checkout}
              disabled={updateAppt.isPending}
              className="w-full py-3 text-[14px] justify-center"
            >
              {updateAppt.isPending ? "Processing…" : `Charge $${total.toFixed(2)} · ${method}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
