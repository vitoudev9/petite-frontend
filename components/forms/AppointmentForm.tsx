"use client";

import { useState, useRef, useEffect } from "react";
import { useClients, useStaff, useServices, useCreateAppointment, useUpdateAppointment, useCreateClient } from "@/hooks/useApi";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui";
import type { Appointment, CreateAppointment } from "@/types";

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

  // ── Client combobox state ──────────────────────────────────────────────────
  const initialClient = clients.find((c) => c.id === initial?.client_id);
  const [clientInput, setClientInput]   = useState(initialClient?.name ?? "");
  const [clientId, setClientId]         = useState<number | null>(initial?.client_id ?? null);
  const [showDropdown, setShowDropdown] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // New client extra fields — only used when isNewClient is true
  const [newClientDetails, setNewClientDetails] = useState({
    phone: "", email: "", notes: "", tags: "",
  });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = clientInput.trim() === ""
    ? clients
    : clients.filter((c) => c.name.toLowerCase().includes(clientInput.toLowerCase()));

  const exactMatch = clients.find(
    (c) => c.name.toLowerCase() === clientInput.trim().toLowerCase()
  );

  const isNewClient = clientInput.trim() !== "" && !exactMatch && clientId === null;

  function selectClient(id: number, name: string) {
    setClientId(id);
    setClientInput(name);
    setShowDropdown(false);
    // Clear new client fields when switching to an existing client
    setNewClientDetails({ phone: "", email: "", notes: "", tags: "" });
  }

  function onClientType(val: string) {
    setClientInput(val);
    setClientId(null);
    setShowDropdown(true);
  }

  function setDetail(k: keyof typeof newClientDetails, v: string) {
    setNewClientDetails((prev) => ({ ...prev, [k]: v }));
  }

  // ── Appointment form state ─────────────────────────────────────────────────
  const [form, setForm] = useState({
    staff_id:   initial?.staff_id   ?? (staffList[0]?.id ?? 0),
    service_id: initial?.service_id ?? (services[0]?.id ?? 0),
    date:       initial?.date  ?? new Date().toISOString().slice(0, 10),
    time:       initial?.time  ?? "09:00",
    duration:   initial?.duration ?? 60,
    status:     initial?.status ?? "confirmed",
    notes:      initial?.notes  ?? "",
    paid:       initial?.paid   ?? false,
  });

  function set(k: string, v: unknown) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function onServiceChange(id: number) {
    const svc = services.find((s) => s.id === id);
    setForm((prev) => ({ ...prev, service_id: id, duration: svc?.duration ?? prev.duration }));
  }

  async function submit() {
    let resolvedClientId = clientId;

    if (initial?.id) {
      resolvedClientId = initial.client_id ?? clientId;
    } else if (!resolvedClientId && clientInput.trim()) {
      const newClient = await createClient.mutateAsync({
        name:  clientInput.trim(),
        phone: newClientDetails.phone,
        email: newClientDetails.email,
        notes: newClientDetails.notes,
        tags:  newClientDetails.tags,
      });
      resolvedClientId = newClient.id;
    }

    if (!resolvedClientId) return;

    const payload: CreateAppointment = { ...form, client_id: resolvedClientId };

    if (initial?.id) {
      await update.mutateAsync({ id: initial.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone();
  }

  const isPending = create.isPending || update.isPending || createClient.isPending;
  const canSubmit = clientInput.trim() !== "" && form.staff_id && form.service_id;

  return (
    <div className="flex flex-col gap-0">

      {/* ── Client field ── */}
      <FormField label="Client">
        {initial?.id ? (
          // Edit mode — read-only
          <div className="px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            {initialClient?.name ?? clientInput}
          </div>
        ) : (
          // New booking — combobox
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
                  <div
                    key={c.id}
                    onMouseDown={() => selectClient(c.id, c.name)}
                    className="px-3 py-2 text-[13px] hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] text-gray-400">{c.phone}</span>
                  </div>
                ))}
                {clientInput.trim() !== "" && !exactMatch && (
                  <div
                    onMouseDown={() => { setClientId(null); setShowDropdown(false); }}
                    className="px-3 py-2 text-[13px] text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100 flex items-center gap-1.5"
                  >
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
              {clientId && <p className="text-[11px] text-green-600">Existing client selected</p>}
              {isNewClient && <p className="text-[11px] text-blue-600">New client — fill in details below</p>}
            </div>
          </div>
        )}
      </FormField>

      {/* ── New client extra fields — only shown for new clients ── */}
      {isNewClient && !initial?.id && (
        <div className="mb-3 p-3 rounded-lg border border-blue-100 bg-blue-50 flex flex-col gap-0">
          <p className="text-[11px] font-medium text-blue-600 mb-2 uppercase tracking-wide">New client details</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone">
              <Input
                value={newClientDetails.phone}
                onChange={(e) => setDetail("phone", e.target.value)}
                placeholder="+855 12 345 678"
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={newClientDetails.email}
                onChange={(e) => setDetail("email", e.target.value)}
                placeholder="email@example.com"
              />
            </FormField>
          </div>
          <FormField label="Tags (comma-separated)">
            <Input
              value={newClientDetails.tags}
              onChange={(e) => setDetail("tags", e.target.value)}
              placeholder="New, VIP…"
            />
          </FormField>
          <FormField label="Notes">
            <Textarea
              value={newClientDetails.notes}
              onChange={(e) => setDetail("notes", e.target.value)}
              placeholder="Allergies, preferences…"
            />
          </FormField>
        </div>
      )}

      <FormField label="Service">
        <Select value={form.service_id} onChange={(e) => onServiceChange(Number(e.target.value))}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — ${s.price} · {s.duration}min</option>
          ))}
        </Select>
      </FormField>

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
          <Input
            type="number" min={15} step={15} value={form.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
          />
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