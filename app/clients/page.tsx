"use client";

import { useState } from "react";
import { Search, Plus, ChevronDown, ChevronUp, Phone, Mail } from "lucide-react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, useAppointments } from "@/hooks/useApi";
import AppointmentForm from "@/components/forms/AppointmentForm";
import {
  PageHeader, Modal, Avatar, Badge, StatCard, Button,
  FormField, Input, Textarea, Spinner,
} from "@/components/ui";
import type { Client } from "@/types";

const TAG_COLORS: Record<string, string> = {
  VIP:          "bg-purple-50 text-purple-700",
  Regular:      "bg-blue-50 text-blue-700",
  New:          "bg-green-50 text-green-700",
  "Color client": "bg-amber-50 text-amber-700",
};

const AVATAR_COLORS = ["#378ADD","#1D9E75","#D85A30","#9B59B6","#BA7517","#0F6E56"];

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const { data: allAppts = [] }           = useAppointments({});
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<Client | null>(null);
  const [booking, setBooking]     = useState<Client | null>(null);

  // New client form state
  const [form, setForm] = useState({ name:"", phone:"", email:"", notes:"", tags:"" });

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  async function saveNew() {
    await createClient.mutateAsync(form);
    setForm({ name:"", phone:"", email:"", notes:"", tags:"" });
    setShowNew(false);
  }

  async function saveEdit() {
    if (!editing) return;
    await updateClient.mutateAsync({ id: editing.id, data: editing });
    setEditing(null);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Clients"
        actions={
          <>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="pl-7 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-52"
              />
            </div>
            <Button variant="primary" onClick={() => setShowNew(true)}>
              <Plus size={14} /> New client
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center pt-10"><Spinner /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-[13px] py-10">No clients found.</p>
            )}
            {filtered.map((client, idx) => {
              const isOpen = expanded === client.id;
              const clientAppts = allAppts.filter((a) => a.client_id === client.id);
              const avatarColor = AVATAR_COLORS[client.id % AVATAR_COLORS.length];

              return (
                <div key={client.id} className="border-b border-gray-100 last:border-b-0">
                  {/* Row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : client.id)}
                  >
                    <Avatar name={client.name} color={avatarColor} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[14px] truncate">{client.name}</p>
                      <p className="text-[12px] text-gray-400 truncate">{client.phone}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {client.tags_list.map((t) => (
                        <span
                          key={t}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[t] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-[12px] text-gray-400 shrink-0">{client.total_visits} visits</span>
                    {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>

                  {/* Expanded profile */}
                  {isOpen && (
                    <div className="px-4 pb-4 bg-gray-50/60 border-t border-gray-100">
                      <div className="pt-3 grid grid-cols-3 gap-3 mb-4">
                        <StatCard label="Visits" value={client.total_visits} />
                        <StatCard label="Total spend" value={`$${client.total_spend.toFixed(0)}`} />
                        <StatCard label="Email" value={client.email || "—"} />
                      </div>

                      {client.notes && (
                        <div className="mb-4 text-[13px] text-gray-600 bg-white rounded-lg border border-gray-200 px-3 py-2">
                          {client.notes}
                        </div>
                      )}

                      {/* Visit history */}
                      <p className="text-[11px] text-gray-400 mb-2 font-medium uppercase tracking-wide">Visit history</p>
                      {clientAppts.length === 0 ? (
                        <p className="text-[13px] text-gray-400">No appointments yet.</p>
                      ) : (
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden mb-4">
                          {clientAppts.map((a) => (
                            <div key={a.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 text-[13px]">
                              <span className="text-gray-600">{a.date} · {a.time}</span>
                              <span className="font-medium">{a.service?.name}</span>
                              <span className="text-gray-400">{a.staff_member?.name}</span>
                              <Badge label={a.status} variant={a.status} />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => setBooking(client)}>
                          + Book appointment
                        </Button>
                        <Button variant="default" size="sm" onClick={() => setEditing({ ...client })}>
                          Edit profile
                        </Button>
                        <Button
                          variant="danger" size="sm"
                          onClick={() => { deleteClient.mutate(client.id); setExpanded(null); }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New client modal */}
      {showNew && (
        <Modal title="New client" onClose={() => setShowNew(false)}>
          <FormField label="Full name"><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></FormField>
          <FormField label="Phone"><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></FormField>
          <FormField label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></FormField>
          <FormField label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="VIP, Regular…" /></FormField>
          <FormField label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></FormField>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveNew} disabled={!form.name} className="flex-1">
              {createClient.isPending ? "Saving…" : "Save client"}
            </Button>
            <Button variant="default" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Edit client modal */}
      {editing && (
        <Modal title="Edit client" onClose={() => setEditing(null)}>
          <FormField label="Full name"><Input value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})} /></FormField>
          <FormField label="Phone"><Input value={editing.phone} onChange={(e) => setEditing({...editing, phone: e.target.value})} /></FormField>
          <FormField label="Email"><Input value={editing.email} onChange={(e) => setEditing({...editing, email: e.target.value})} /></FormField>
          <FormField label="Tags (comma-separated)"><Input value={editing.tags} onChange={(e) => setEditing({...editing, tags: e.target.value})} /></FormField>
          <FormField label="Notes"><Textarea value={editing.notes} onChange={(e) => setEditing({...editing, notes: e.target.value})} /></FormField>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveEdit} className="flex-1">
              {updateClient.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Quick book from client profile */}
      {booking && (
        <Modal title={`Book for ${booking.name}`} onClose={() => setBooking(null)}>
          <AppointmentForm
            initial={{ client_id: booking.id }}
            onDone={() => setBooking(null)}
            onCancel={() => setBooking(null)}
          />
        </Modal>
      )}
    </div>
  );
}
