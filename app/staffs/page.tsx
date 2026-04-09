"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useApi";
import {
  PageHeader, Modal, Avatar, Badge, Button,
  FormField, Input, Spinner,
} from "@/components/ui";
import type { Staff } from "@/types";

const ROLE_COLORS = ["#378ADD","#D4537E","#1D9E75","#BA7517","#9B59B6","#0F6E56"];

export default function StaffPage() {
  const { data: staffList = [], isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [showNew, setShowNew]   = useState(false);
  const [editing, setEditing]   = useState<Staff | null>(null);
  const [form, setForm] = useState({
    name: "", role: "", color: "#378ADD", hours: "9am–6pm",
    available: true, specialties: "",
  });

  async function saveNew() {
    await createStaff.mutateAsync(form);
    setForm({ name:"", role:"", color:"#378ADD", hours:"9am–6pm", available:true, specialties:"" });
    setShowNew(false);
  }

  async function saveEdit() {
    if (!editing) return;
    await updateStaff.mutateAsync({ id: editing.id, data: editing });
    setEditing(null);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Staff"
        actions={
          <Button variant="primary" onClick={() => setShowNew(true)}>
            <Plus size={14} /> Add staff
          </Button>
        }
      />

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center pt-10"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffList.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} color={s.color} size={44} />
                  <div className="flex-1">
                    <p className="font-semibold text-[14px]">{s.name}</p>
                    <p className="text-[12px] text-gray-400">{s.role}</p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      s.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s.available ? "Available" : "Off"}
                  </span>
                </div>

                <div className="text-[12px] text-gray-500">
                  <span className="font-medium text-gray-700">Hours: </span>{s.hours}
                </div>

                {s.specialties_list.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.specialties_list.map((sp) => (
                      <span key={sp} className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {sp}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <Button variant="default" size="sm" onClick={() => setEditing({ ...s })}>
                    Edit
                  </Button>
                  <Button
                    variant="default" size="sm"
                    onClick={() => updateStaff.mutate({ id: s.id, data: { available: !s.available } })}
                  >
                    {s.available ? "Mark off" : "Mark available"}
                  </Button>
                  <Button
                    variant="danger" size="sm"
                    onClick={() => deleteStaff.mutate(s.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New staff modal */}
      {showNew && (
        <Modal title="Add staff member" onClose={() => setShowNew(false)}>
          <FormField label="Full name"><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></FormField>
          <FormField label="Role (e.g. Colorist)"><Input value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} /></FormField>
          <FormField label="Working hours"><Input value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})} placeholder="9am–6pm" /></FormField>
          <FormField label="Specialties (comma-separated)"><Input value={form.specialties} onChange={(e) => setForm({...form, specialties: e.target.value})} placeholder="Haircut, Balayage…" /></FormField>
          <FormField label="Color">
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
              <span className="text-[12px] text-gray-400">{form.color}</span>
            </div>
          </FormField>
          <label className="flex items-center gap-2 text-[13px] mb-4 cursor-pointer">
            <input type="checkbox" checked={form.available} onChange={(e) => setForm({...form, available: e.target.checked})} />
            Available today
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={saveNew} disabled={!form.name} className="flex-1">
              {createStaff.isPending ? "Saving…" : "Add staff member"}
            </Button>
            <Button variant="default" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Edit staff modal */}
      {editing && (
        <Modal title="Edit staff member" onClose={() => setEditing(null)}>
          <FormField label="Full name"><Input value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})} /></FormField>
          <FormField label="Role"><Input value={editing.role} onChange={(e) => setEditing({...editing, role: e.target.value})} /></FormField>
          <FormField label="Working hours"><Input value={editing.hours} onChange={(e) => setEditing({...editing, hours: e.target.value})} /></FormField>
          <FormField label="Specialties (comma-separated)"><Input value={editing.specialties} onChange={(e) => setEditing({...editing, specialties: e.target.value})} /></FormField>
          <FormField label="Color">
            <div className="flex items-center gap-2">
              <input type="color" value={editing.color} onChange={(e) => setEditing({...editing, color: e.target.value})} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
              <span className="text-[12px] text-gray-400">{editing.color}</span>
            </div>
          </FormField>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveEdit} className="flex-1">
              {updateStaff.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
