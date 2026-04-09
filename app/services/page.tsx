"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useApi";
import { PageHeader, Modal, Button, FormField, Input, Select, Spinner } from "@/components/ui";
import type { Service } from "@/types";

const CATEGORIES = ["hair", "nails", "color", "facial", "wax"];

const CAT_STYLE: Record<string, string> = {
  hair:   "bg-blue-50 text-blue-700",
  nails:  "bg-pink-50 text-pink-700",
  color:  "bg-green-50 text-green-700",
  facial: "bg-amber-50 text-amber-700",
  wax:    "bg-teal-50 text-teal-700",
};

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [filterCat, setFilterCat] = useState<string>("all");
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<Service | null>(null);

  const [form, setForm] = useState({
    name: "", category: "hair", duration: 60, price: 0, deposit: 0,
  });

  const filtered = filterCat === "all"
    ? services
    : services.filter((s) => s.category === filterCat);

  async function saveNew() {
    await createService.mutateAsync(form);
    setForm({ name:"", category:"hair", duration:60, price:0, deposit:0 });
    setShowNew(false);
  }

  async function saveEdit() {
    if (!editing) return;
    await updateService.mutateAsync({ id: editing.id, data: editing });
    setEditing(null);
  }

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, Service[]>>((acc, cat) => {
    acc[cat] = filtered.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Services"
        actions={
          <Button variant="primary" onClick={() => setShowNew(true)}>
            <Plus size={14} /> Add service
          </Button>
        }
      />

      {/* Category filter tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-white overflow-x-auto shrink-0">
        {["all", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-colors ${
              filterCat === cat
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center pt-10"><Spinner /></div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.filter((c) => filterCat === "all" || c === filterCat).map((cat) => {
              const svcs = grouped[cat];
              if (svcs.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${CAT_STYLE[cat]}`}>
                      {cat}
                    </span>
                    <span className="text-[12px] text-gray-400">{svcs.length} services</span>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {svcs.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[14px]">{svc.name}</p>
                          <p className="text-[12px] text-gray-400">{svc.duration} min</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[14px]">${svc.price}</p>
                          {svc.deposit > 0 && (
                            <p className="text-[11px] text-gray-400">${svc.deposit} deposit</p>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => setEditing({ ...svc })}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => deleteService.mutate(svc.id)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New service modal */}
      {showNew && (
        <Modal title="Add service" onClose={() => setShowNew(false)}>
          <FormField label="Service name"><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Balayage" /></FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Duration (min)"><Input type="number" min={15} step={15} value={form.duration} onChange={(e) => setForm({...form, duration: Number(e.target.value)})} /></FormField>
            <FormField label="Price ($)"><Input type="number" min={0} step={5} value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})} /></FormField>
            <FormField label="Deposit ($)"><Input type="number" min={0} step={5} value={form.deposit} onChange={(e) => setForm({...form, deposit: Number(e.target.value)})} /></FormField>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveNew} disabled={!form.name} className="flex-1">
              {createService.isPending ? "Saving…" : "Add service"}
            </Button>
            <Button variant="default" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Edit service modal */}
      {editing && (
        <Modal title="Edit service" onClose={() => setEditing(null)}>
          <FormField label="Service name"><Input value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})} /></FormField>
          <FormField label="Category">
            <Select value={editing.category} onChange={(e) => setEditing({...editing, category: e.target.value})}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Duration (min)"><Input type="number" min={15} step={15} value={editing.duration} onChange={(e) => setEditing({...editing, duration: Number(e.target.value)})} /></FormField>
            <FormField label="Price ($)"><Input type="number" min={0} value={editing.price} onChange={(e) => setEditing({...editing, price: Number(e.target.value)})} /></FormField>
            <FormField label="Deposit ($)"><Input type="number" min={0} value={editing.deposit} onChange={(e) => setEditing({...editing, deposit: Number(e.target.value)})} /></FormField>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveEdit} className="flex-1">
              {updateService.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
