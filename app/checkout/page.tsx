"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, Banknote, Wallet } from "lucide-react";
import { useAppointments, useUpdateAppointment } from "@/hooks/useApi";
import { Avatar, Spinner } from "@/components/ui";
import type { Appointment } from "@/types";

const AVATAR_COLORS   = ["#378ADD","#1D9E75","#D85A30","#9B59B6","#BA7517","#0F6E56"];
const DISCOUNT_TYPES  = ["$", "%"] as const;

const PAYMENT_METHODS = [
  {
    id:    "card",
    label: "Card",
    sub:   "Visa, Mastercard, tap",
    icon:  CreditCard,
    bg:    "bg-blue-50",
    border:"border-blue-200",
    active:"bg-blue-600 border-blue-600",
    text:  "text-blue-700",
  },
  {
    id:    "cash",
    label: "Cash",
    sub:   "Exact or change",
    icon:  Banknote,
    bg:    "bg-green-50",
    border:"border-green-200",
    active:"bg-green-600 border-green-600",
    text:  "text-green-700",
  },
] as const;

type Method = (typeof PAYMENT_METHODS)[number]["id"];

export default function CheckoutPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: appts = [], isLoading } = useAppointments({ date: today, status: "confirmed" });
  const updateAppt = useUpdateAppointment();

  const [selected, setSelected]           = useState<Appointment | null>(null);
  const [method, setMethod]               = useState<Method>("card");
  const [done, setDone]                   = useState<number[]>([]);
  const [discountType, setDiscountType]   = useState<"$" | "%">("%");
  const [discountValue, setDiscountValue] = useState(0);

  // ── Price calculation ─────────────────────────────────────────────────────
  const servicePrice = selected?.service?.price ?? 0;

  const addOnTotal = (selected?.appointment_addons ?? []).reduce(
    (sum, aa) => sum + aa.unit_price * aa.quantity,
    0
  );

  const subtotal       = servicePrice + addOnTotal;
  const discountAmount = discountType === "%"
    ? Math.round(subtotal * discountValue) / 100
    : Math.min(discountValue, subtotal);
  const total = Math.max(subtotal - discountAmount, 0);

  async function checkout() {
    if (!selected) return;
    await updateAppt.mutateAsync({ id: selected.id, data: { status: "completed", paid: true } });
    setDone((d) => [...d, selected.id]);
    setSelected(null);
    setDiscountValue(0);
    setDiscountType("%");
  }

  function selectAppt(a: Appointment) {
    setSelected(a);
    setDiscountValue(0);
    setDiscountType("%");
  }

  const unpaid         = appts.filter((a) => !done.includes(a.id));
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method)!;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: appointment list ── */}
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
          {unpaid.map((a) => {
            const apptAddOnTotal = (a.appointment_addons ?? []).reduce(
              (sum, aa) => sum + aa.unit_price * aa.quantity, 0
            );
            const apptTotal = (a.service?.price ?? 0) + apptAddOnTotal;
            return (
              <div
                key={a.id}
                onClick={() => selectAppt(a)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors ${
                  selected?.id === a.id ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <Avatar name={a.client?.name ?? "?"} color={AVATAR_COLORS[(a.client_id ?? 0) % AVATAR_COLORS.length]} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{a.client?.name}</p>
                  <p className="text-[12px] text-gray-400 truncate">{a.service?.name} · {a.time}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold">${apptTotal.toFixed(2)}</p>
                  {apptAddOnTotal > 0 && (
                    <p className="text-[11px] text-gray-400">+{(a.appointment_addons ?? []).length} add-on{(a.appointment_addons ?? []).length > 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>
            );
          })}
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

      {/* ── Right: checkout panel ── */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-auto">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <Wallet size={36} strokeWidth={1.2} />
            <p className="text-[14px]">Select an appointment to check out</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full py-8 px-4 flex flex-col gap-5">

            {/* Summary card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  name={selected.client?.name ?? "?"}
                  color={AVATAR_COLORS[selected.client_id % AVATAR_COLORS.length]}
                  size={40}
                />
                <div>
                  <p className="font-semibold">{selected.client?.name}</p>
                  <p className="text-[12px] text-gray-400">
                    {selected.service?.name} · {selected.staff_member?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-[13px]">
                {/* Base service */}
                <div className="flex justify-between">
                  <span className="text-gray-500">{selected.service?.name}</span>
                  <span className="font-medium">${servicePrice.toFixed(2)}</span>
                </div>

                {/* Add-on line items */}
                {(selected.appointment_addons ?? []).map((aa) => (
                  <div key={aa.id} className="flex justify-between text-gray-500">
                    <span className="pl-3 before:content-['·'] before:mr-1.5 before:text-gray-300">
                      {aa.addon?.name}{aa.quantity > 1 ? ` × ${aa.quantity}` : ""}
                    </span>
                    <span>${(aa.unit_price * aa.quantity).toFixed(2)}</span>
                  </div>
                ))}

                {/* Subtotal — only when add-ons exist */}
                {(selected.appointment_addons ?? []).length > 0 && (
                  <div className="flex justify-between text-gray-400 border-t border-dashed border-gray-200 pt-1.5">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Discount */}
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountType === "%" ? `${discountValue}%` : `$${discountValue}`})</span>
                      <span>− ${discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>After discount</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {/* Total */}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-[15px]">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Discount */}
            <div>
              <p className="text-[12px] text-gray-500 mb-2">Discount</p>
              <div className="flex gap-2">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
                  {DISCOUNT_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setDiscountType(t); setDiscountValue(0); }}
                      className={`px-3 py-2 text-[13px] font-medium transition-colors ${
                        discountType === t ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <span className="px-3 text-[13px] text-gray-400 shrink-0">
                    {discountType === "$" ? "$" : "%"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={discountType === "%" ? 100 : subtotal}
                    step={discountType === "%" ? 5 : 1}
                    value={discountValue === 0 ? "" : discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="flex-1 py-2 pr-3 text-[13px] focus:outline-none bg-transparent"
                  />
                </div>
                <div className="flex gap-1">
                  {(discountType === "%" ? [10, 15, 20] : [5, 10]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setDiscountValue(discountValue === v ? 0 : v)}
                      className={`px-2.5 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                        discountValue === v
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {discountType === "%" ? `${v}%` : `$${v}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-[12px] text-gray-500 mb-2">Payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const Icon     = m.icon;
                  const isActive = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? `${m.active} text-white shadow-sm`
                          : `bg-white ${m.border} hover:shadow-sm`
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-white/20" : m.bg}`}>
                        <Icon size={15} strokeWidth={1.8} className={isActive ? "text-white" : m.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold leading-tight ${isActive ? "text-white" : "text-gray-800"}`}>
                          {m.label}
                        </p>
                        <p className={`text-[11px] leading-tight ${isActive ? "text-white/75" : "text-gray-400"}`}>
                          {m.sub}
                        </p>
                      </div>
                      {isActive && <span className="w-2 h-2 rounded-full bg-white/80 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Charge button */}
            <button
              onClick={checkout}
              disabled={updateAppt.isPending}
              className={`w-full py-4 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 ${
                method === "card"
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                  : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
              }`}
            >
              {updateAppt.isPending
                ? "Processing…"
                : `Charge $${total.toFixed(2)} · ${selectedMethod.label}`}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}