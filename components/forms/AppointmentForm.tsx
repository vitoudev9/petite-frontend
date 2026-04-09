"use client";

import { useState } from "react";
import { useClients } from "@/hooks/useApi";
import { useStaff } from "@/hooks/useApi";
import { useServices } from "@/hooks/useApi";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/useApi";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui";
import type { Appointment, CreateAppointment } from "@/types";

interface Props {
  initial?: Partial<Appointment>;
  onDone: () => void;
  onCancel: () => void;
}

export default function AppointmentForm({ initial, onDone, onCancel }: Props) {
  const { data: clients = [] } = useClients();
  const { data: staffList = [] } = useStaff();
  const { data: services = [] } = useServices();

  const create = useCreateAppointment();
  const update = useUpdateAppointment();

  const [form, setForm] = useState({
    client_id:  initial?.client_id  ?? (clients[0]?.id ?? 0),
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

  // Auto-fill duration from selected service
  function onServiceChange(id: number) {
    const svc = services.find((s) => s.id === id);
    setForm((prev) => ({ ...prev, service_id: id, duration: svc?.duration ?? prev.duration }));
  }

  async function submit() {
    const payload: CreateAppointment = { ...form };
    if (initial?.id) {
      await update.mutateAsync({ id: initial.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone();
  }

  const isPending = create.isPending || update.isPending;

  return (
    <div className="flex flex-col gap-0">
      <FormField label="Client">
        <Select value={form.client_id} onChange={(e) => set("client_id", Number(e.target.value))}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormField>

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
        <Button variant="primary" onClick={submit} disabled={isPending} className="flex-1">
          {isPending ? "Saving…" : initial?.id ? "Update booking" : "Save booking"}
        </Button>
        <Button variant="default" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
