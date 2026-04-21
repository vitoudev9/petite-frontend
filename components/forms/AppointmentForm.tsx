"use client";

import { useState, useRef, useEffect } from "react";
import {
  useClients, useStaff, useServices, useServiceAddOns,
  useCreateAppointment, useUpdateAppointment, useCreateClient,
} from "@/hooks/useApi";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui";
import type { Appointment, CreateAppointment, AppointmentAddOnInput } from "@/types";

interface Props {
  initial?: Partial<Appointment>;
  onDone: () => void;
  onCancel: () => void;
}

export default function AppointmentForm({ initial, onDone, onCancel }: Props) {
  const { data: clients = [] }   = useClients();
  const { data: staffList = [] } = useStaff();
  const { data: services = [] }  = useServices();

  const create       = useCreateAppointment();
  const update       = useUpdateAppointment();
  const createClient = useCreateClient();

  // ── Client combobox ──────────────────────────────────────────────────────
  const initialClient = clients.find((c) => c.id === initial?.client_id);
  const [clientInput, setClientInput]   = useState(initialClient?.name ?? "");
  const [clientId, setClientId]         = useState<number | null>(initial?.client_id ?? null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newClientDetails, setNewClientDetails] = useState({ phone: "", email: "", notes: "", tags: "" });
  const comboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node))
        setShowDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered   = clientInput.trim() === "" ? clients : clients.filter((c) => c.name.toLowerCase().includes(clientInput.toLowerCase()));
  const exactMatch = clients.find((c) => c.name.toLowerCase() === clientInput.trim().toLowerCase());
  const isNewClient = clientInput.trim() !== "" && !exactMatch && clientId === null;

  function selectClient(id: number, name: string) {
    setClientId(id);
    setClientInput(name);
    setShowDropdown(false);
    setNewClientDetails({ phone: "", email: "", notes: "", tags: "" });
  }

  function onClientType(val: string) {
    setClientInput(val);
    setClientId(null);
    setShowDropdown(true);
  }

  // ── Appointment form state ───────────────────────────────────────────────
  const [serviceId, setServiceId] = useState(initial?.service_id ?? (services[0]?.id ?? 0));
  const [form, setForm] = useState({
    staff_id:  initial?.staff_id  ?? (staffList[0]?.id ?? 0),
    date:      initial?.date      ?? new Date().toISOString().slice(0, 10),
    time:      initial?.time      ?? "09:00",
    duration:  initial?.duration  ?? 60,
    status:    initial?.status    ?? "confirmed",
    notes:     initial?.notes     ?? "",
    paid:      initial?.paid      ?? false,
  });

  function set(k: string, v: unknown) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function onServiceChange(id: number) {
    const svc = services.find((s) => s.id === id);
    setServiceId(id);
    setForm((prev) => ({ ...prev, duration: svc?.duration ?? prev.duration }));
    setSelectedAddOns({});  // clear add-ons when service changes
  }

  // ── Add-ons ──────────────────────────────────────────────────────────────
  const { data: availableAddOns = [] } = useServiceAddOns(serviceId);

  // selectedAddOns: { [addon_id]: quantity } — 0 or absent = not selected
  const initialAddOns = (initial?.appointment_addons ?? []).reduce<Record<number, number>>(
    (acc, aa) => { acc[aa.addon_id] = aa.quantity; return acc; }, {}
  );
  const [selectedAddOns, setSelectedAddOns] = useState<Record<number, number>>(initialAddOns);

  function toggleAddOn(addonId: number) {
    setSelectedAddOns((prev) => {
      if (prev[addonId]) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      }
      return { ...prev, [addonId]: 1 };
    });
  }

  function setQty(addonId: number, qty: number, max: number | null) {
    const capped = max ? Math.min(qty, max) : qty;
    setSelectedAddOns((prev) => ({ ...prev, [addonId]: Math.max(1, capped) }));
  }

  // Running add-ons total
  const addOnTotal = availableAddOns.reduce((sum, a) => {
    const qty = selectedAddOns[a.id] ?? 0;
    return sum + a.price * qty;
  }, 0);

  const servicePrice = services.find((s) => s.id === serviceId)?.price ?? 0;

  // ── Submit ───────────────────────────────────────────────────────────────
  async function submit() {
    let resolvedClientId = clientId;

    if (initial?.id) {
      resolvedClientId = initial.client_id ?? clientId;
    } else if (!resolvedClientId && clientInput.trim()) {
      const nc = await createClient.mutateAsync({
        name: clientInput.trim(), ...newClientDetails,
      });
      resolvedClientId = nc.id;
    }

    if (!resolvedClientId) return;

    const addOnsPayload: AppointmentAddOnInput[] = Object.entries(selectedAddOns).map(
      ([id, qty]) => ({ addon_id: Number(id), quantity: qty })
    );

    const payload: CreateAppointment = {
      ...form,
      service_id: serviceId,
      client_id: resolvedClientId,
      add_ons: addOnsPayload,
    };

    if (initial?.id) {
      await update.mutateAsync({ id: initial.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone();
  }

  const isPending  = create.isPending || update.isPending || createClient.isPending;
  const canSubmit  = clientInput.trim() !== "" && form.staff_id && serviceId;

  return (
    <div className="flex flex-col gap-0">

      {/* Client */}
      <FormField label="Client">
        {initial?.id ? (
          <div className="px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            {initialClient?.name ?? clientInput}
          </div>
        ) : (
          <div ref={comboRef} className="relative">
            <Input
              value={clientInput}
              onChange={(e) => onClientType(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search or enter new client name…"
              autoComplete="off"
            />
            {showDropdown && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-h-48 overflow-y-auto">
                {filtered.map((c) => (
                  <div key={c.id} onMouseDown={() => selectClient(c.id, c.name)}
                    className="px-3 py-2 text-[13px] hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-[11px] text-gray-400">{c.phone}</span>
                  </div>
                ))}
                {clientInput.trim() !== "" && !exactMatch && (
                  <div onMouseDown={() => { setClientId(null); setShowDropdown(false); }}
                    className="px-3 py-2 text-[13px] text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100 flex items-center gap-1.5">
                    <span className="font-medium">+ Create new client</span>
                    <span className="text-gray-500">"{clientInput.trim()}"</span>
                  </div>
                )}
                {filtered.length === 0 && !clientInput.trim() && (
                  <div className="px-3 py-2 text-[13px] text-gray-400">No clients yet</div>
                )}
              </div>
            )}
            <div className="mt-1 h-4">
              {clientId    && <p className="text-[11px] text-green-600">Existing client selected</p>}
              {isNewClient && <p className="text-[11px] text-blue-600">New client — fill in details below</p>}
            </div>
          </div>
        )}
      </FormField>

      {/* New client detail fields */}
      {isNewClient && !initial?.id && (
        <div className="mb-3 p-3 rounded-lg border border-blue-100 bg-blue-50 flex flex-col gap-0">
          <p className="text-[11px] font-medium text-blue-600 mb-2 uppercase tracking-wide">New client details</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone">
              <Input value={newClientDetails.phone} onChange={(e) => setNewClientDetails((p) => ({ ...p, phone: e.target.value }))} placeholder="+855 12 345 678" />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={newClientDetails.email} onChange={(e) => setNewClientDetails((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
            </FormField>
          </div>
          <FormField label="Tags (comma-separated)">
            <Input value={newClientDetails.tags} onChange={(e) => setNewClientDetails((p) => ({ ...p, tags: e.target.value }))} placeholder="New, VIP…" />
          </FormField>
          <FormField label="Notes">
            <Textarea value={newClientDetails.notes} onChange={(e) => setNewClientDetails((p) => ({ ...p, notes: e.target.value }))} placeholder="Allergies, preferences…" />
          </FormField>
        </div>
      )}

      {/* Service */}
      <FormField label="Service">
        <Select value={serviceId} onChange={(e) => onServiceChange(Number(e.target.value))}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — ${s.price} · {s.duration}min</option>
          ))}
        </Select>
      </FormField>

      {/* Add-ons for selected service */}
      {availableAddOns.length > 0 && (
        <div className="mb-3">
          <p className="text-[12px] text-gray-500 mb-1.5">Add-ons</p>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            {availableAddOns.map((addon) => {
              const selected = addon.id in selectedAddOns;
              const qty      = selectedAddOns[addon.id] ?? 1;
              return (
                <div key={addon.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleAddOn(addon.id)}
                    className="cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{addon.name}</p>
                    <p className="text-[11px] text-gray-400">
                      ${addon.price.toFixed(2)}{addon.allow_quantity ? " each" : ""}
                    </p>
                  </div>
                  {selected && addon.allow_quantity && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQty(addon.id, qty - 1, addon.max_quantity)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-[14px] leading-none"
                      >−</button>
                      <input
                        type="number"
                        min={1}
                        max={addon.max_quantity ?? undefined}
                        value={qty}
                        onChange={(e) => setQty(addon.id, Number(e.target.value), addon.max_quantity)}
                        className="w-12 text-center text-[13px] border border-gray-200 rounded px-1 py-0.5 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(addon.id, qty + 1, addon.max_quantity)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-[14px] leading-none"
                      >+</button>
                      <span className="text-[12px] text-gray-500 min-w-[48px] text-right">
                        ${(addon.price * qty).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selected && !addon.allow_quantity && (
                    <span className="text-[12px] text-gray-500 shrink-0">${addon.price.toFixed(2)}</span>
                  )}
                </div>
              );
            })}
          </div>
          {Object.keys(selectedAddOns).length > 0 && (
            <div className="flex justify-between text-[12px] text-gray-500 mt-1.5 px-1">
              <span>Service total</span>
              <span className="font-medium text-gray-800">${(servicePrice + addOnTotal).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Staff */}
      <FormField label="Staff">
        <Select value={form.staff_id} onChange={(e) => set("staff_id", Number(e.target.value))}>
          {staffList.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Date">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </FormField>
        <FormField label="Time">
          <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Duration (min)">
          <Input type="number" min={15} step={15} value={form.duration} onChange={(e) => set("duration", Number(e.target.value))} />
        </FormField>
        <FormField label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-show</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Notes">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes..." />
      </FormField>

      <label className="flex items-center gap-2 text-[13px] text-gray-600 mb-4 cursor-pointer">
        <input type="checkbox" checked={form.paid} onChange={(e) => set("paid", e.target.checked)} />
        Mark as paid
      </label>

      <div className="flex gap-2 pt-1">
        <Button variant="primary" onClick={submit} disabled={isPending || !canSubmit} className="flex-1">
          {isPending ? "Saving…" : initial?.id ? "Update booking" : "Save booking"}
        </Button>
        <Button variant="default" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}