"use client";

import { useState } from "react";
import { Plus, Link, Unlink } from "lucide-react";
import {
  useServices, useCreateService, useUpdateService, useDeleteService,
  useAddOns, useCreateAddOn, useUpdateAddOn, useDeleteAddOn,
  useServiceAddOns, useAttachAddOn, useDetachAddOn,
} from "@/hooks/useApi";
import { PageHeader, Modal, Button, FormField, Input, Select, Spinner } from "@/components/ui";
import type { Service, AddOn } from "@/types";

const CATEGORIES = ["hair", "nails", "color", "facial", "wax"];

const CAT_STYLE: Record<string, string> = {
  hair:   "bg-blue-50 text-blue-700",
  nails:  "bg-pink-50 text-pink-700",
  color:  "bg-green-50 text-green-700",
  facial: "bg-amber-50 text-amber-700",
  wax:    "bg-teal-50 text-teal-700",
};

function ServiceAddonManager({ service, allAddOns }: { service: Service; allAddOns: AddOn[] }) {
  const { data: attached = [] } = useServiceAddOns(service.id);
  const attach = useAttachAddOn();
  const detach = useDetachAddOn();

  const attachedIds = new Set(attached.map((a) => a.id));
  const unattached  = allAddOns.filter((a) => !attachedIds.has(a.id));

  return (
    <div className="mt-2 pt-3 border-t border-gray-100">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
        Add-ons for this service
      </p>
      {attached.length === 0 && (
        <p className="text-[12px] text-gray-400 mb-2">No add-ons attached yet.</p>
      )}
      {attached.map((addon) => (
        <div key={addon.id} className="flex items-center gap-2 mb-1.5">
          <span className="flex-1 text-[13px] font-medium">{addon.name}</span>
          <span className="text-[12px] text-gray-400">
            ${addon.price.toFixed(2)}{addon.allow_quantity ? " each" : " flat"}
          </span>
          <button
            onClick={() => detach.mutate({ serviceId: service.id, addonId: addon.id })}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Detach from service"
          >
            <Unlink size={13} />
          </button>
        </div>
      ))}
      {unattached.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] text-gray-400 mb-1.5">Attach an existing add-on:</p>
          <div className="flex flex-wrap gap-1.5">
            {unattached.map((addon) => (
              <button
                key={addon.id}
                onClick={() => attach.mutate({ serviceId: service.id, addonId: addon.id })}
                className="flex items-center gap-1 px-2.5 py-1 text-[12px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
              >
                <Link size={11} /> {addon.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {allAddOns.length === 0 && (
        <p className="text-[12px] text-gray-400 mt-1">
          No add-ons exist yet — create some in the Add-ons tab first.
        </p>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const { data: services = [], isLoading: loadingServices } = useServices();
  const { data: allAddOns = [], isLoading: loadingAddOns }  = useAddOns();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const createAddOn   = useCreateAddOn();
  const updateAddOn   = useUpdateAddOn();
  const deleteAddOn   = useDeleteAddOn();

  const [tab, setTab]             = useState<"services" | "addons">("services");
  const [filterCat, setFilterCat] = useState("all");
  const [expandedSvc, setExpandedSvc] = useState<number | null>(null);

  const [showNewSvc, setShowNewSvc]   = useState(false);
  const [editingSvc, setEditingSvc]   = useState<Service | null>(null);
  const [svcForm, setSvcForm]         = useState({ name: "", category: "hair", duration: 60, price: 0, deposit: 0 });

  const [showNewAddon, setShowNewAddon] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddOn | null>(null);
  const [addonForm, setAddonForm]       = useState({ name: "", price: 0, allow_quantity: false, max_quantity: "" });

  const filtered = filterCat === "all" ? services : services.filter((s) => s.category === filterCat);
  const grouped  = CATEGORIES.reduce<Record<string, Service[]>>((acc, cat) => {
    acc[cat] = filtered.filter((s) => s.category === cat);
    return acc;
  }, {});

  async function saveNewSvc() {
    await createService.mutateAsync(svcForm);
    setSvcForm({ name: "", category: "hair", duration: 60, price: 0, deposit: 0 });
    setShowNewSvc(false);
  }

  async function saveEditSvc() {
    if (!editingSvc) return;
    await updateService.mutateAsync({ id: editingSvc.id, data: editingSvc });
    setEditingSvc(null);
  }

  async function saveNewAddon() {
    await createAddOn.mutateAsync({
      name:           addonForm.name,
      price:          addonForm.price,
      allow_quantity: addonForm.allow_quantity,
      max_quantity:   addonForm.max_quantity ? Number(addonForm.max_quantity) : null,
    });
    setAddonForm({ name: "", price: 0, allow_quantity: false, max_quantity: "" });
    setShowNewAddon(false);
  }

  async function saveEditAddon() {
    if (!editingAddon) return;
    await updateAddOn.mutateAsync({ id: editingAddon.id, data: editingAddon });
    setEditingAddon(null);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Services"
        actions={
          tab === "services" ? (
            <Button variant="primary" onClick={() => setShowNewSvc(true)}>
              <Plus size={14} /> Add service
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowNewAddon(true)}>
              <Plus size={14} /> Add add-on
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-gray-100 bg-white shrink-0">
        {(["services", "addons"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              tab === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "addons" ? "Add-ons" : "Services"}
          </button>
        ))}
      </div>

      {/* Services tab */}
      {tab === "services" && (
        <>
          <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-white overflow-x-auto shrink-0">
            {["all", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-colors ${
                  filterCat === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto px-6 py-4">
            {loadingServices ? (
              <div className="flex justify-center pt-10"><Spinner /></div>
            ) : (
              <div className="space-y-6">
                {CATEGORIES.filter((c) => filterCat === "all" || c === filterCat).map((cat) => {
                  const svcs = grouped[cat];
                  if (!svcs || svcs.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${CAT_STYLE[cat]}`}>{cat}</span>
                        <span className="text-[12px] text-gray-400">{svcs.length} services</span>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {svcs.map((svc) => (
                          <div key={svc.id} className="border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center gap-4 px-4 py-3">
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => setExpandedSvc(expandedSvc === svc.id ? null : svc.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-[14px]">{svc.name}</p>
                                  <span className="text-[11px] text-gray-400">{expandedSvc === svc.id ? "▲" : "▼"}</span>
                                </div>
                                <p className="text-[12px] text-gray-400">{svc.duration} min</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[14px]">${svc.price}</p>
                                {svc.deposit > 0 && <p className="text-[11px] text-gray-400">${svc.deposit} deposit</p>}
                              </div>
                              <div className="flex gap-1.5">
                                <Button variant="ghost" size="sm" onClick={() => setEditingSvc({ ...svc })}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => deleteService.mutate(svc.id)}>Remove</Button>
                              </div>
                            </div>
                            {expandedSvc === svc.id && (
                              <div className="px-4 pb-4">
                                <ServiceAddonManager service={svc} allAddOns={allAddOns} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add-ons tab */}
      {tab === "addons" && (
        <div className="flex-1 overflow-auto px-6 py-4">
          {loadingAddOns ? (
            <div className="flex justify-center pt-10"><Spinner /></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {allAddOns.length === 0 && (
                <p className="text-center text-[13px] text-gray-400 py-10">
                  No add-ons yet. Click "Add add-on" to create one.
                </p>
              )}
              {allAddOns.map((addon) => (
                <div key={addon.id} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-[14px]">{addon.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] text-gray-400">
                        ${addon.price.toFixed(2)} {addon.allow_quantity ? "per unit" : "flat"}
                      </span>
                      {addon.allow_quantity && (
                        <span className="text-[11px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                          qty · {addon.max_quantity ? `max ${addon.max_quantity}` : "unlimited"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setEditingAddon({ ...addon })}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => deleteAddOn.mutate(addon.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New service modal */}
      {showNewSvc && (
        <Modal title="Add service" onClose={() => setShowNewSvc(false)}>
          <FormField label="Service name"><Input value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} placeholder="e.g. Balayage" /></FormField>
          <FormField label="Category">
            <Select value={svcForm.category} onChange={(e) => setSvcForm({ ...svcForm, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Duration (min)"><Input type="number" min={15} step={15} value={svcForm.duration} onChange={(e) => setSvcForm({ ...svcForm, duration: Number(e.target.value) })} /></FormField>
            <FormField label="Price ($)"><Input type="number" min={0} step={5} value={svcForm.price} onChange={(e) => setSvcForm({ ...svcForm, price: Number(e.target.value) })} /></FormField>
            <FormField label="Deposit ($)"><Input type="number" min={0} step={5} value={svcForm.deposit} onChange={(e) => setSvcForm({ ...svcForm, deposit: Number(e.target.value) })} /></FormField>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveNewSvc} disabled={!svcForm.name} className="flex-1">{createService.isPending ? "Saving…" : "Add service"}</Button>
            <Button variant="default" onClick={() => setShowNewSvc(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Edit service modal */}
      {editingSvc && (
        <Modal title="Edit service" onClose={() => setEditingSvc(null)}>
          <FormField label="Service name"><Input value={editingSvc.name} onChange={(e) => setEditingSvc({ ...editingSvc, name: e.target.value })} /></FormField>
          <FormField label="Category">
            <Select value={editingSvc.category} onChange={(e) => setEditingSvc({ ...editingSvc, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Duration (min)"><Input type="number" min={15} step={15} value={editingSvc.duration} onChange={(e) => setEditingSvc({ ...editingSvc, duration: Number(e.target.value) })} /></FormField>
            <FormField label="Price ($)"><Input type="number" min={0} value={editingSvc.price} onChange={(e) => setEditingSvc({ ...editingSvc, price: Number(e.target.value) })} /></FormField>
            <FormField label="Deposit ($)"><Input type="number" min={0} value={editingSvc.deposit} onChange={(e) => setEditingSvc({ ...editingSvc, deposit: Number(e.target.value) })} /></FormField>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveEditSvc} className="flex-1">{updateService.isPending ? "Saving…" : "Save changes"}</Button>
            <Button variant="default" onClick={() => setEditingSvc(null)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* New add-on modal */}
      {showNewAddon && (
        <Modal title="Add add-on" onClose={() => setShowNewAddon(false)}>
          <FormField label="Name"><Input value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} placeholder="e.g. Custom color, Nail extension" /></FormField>
          <FormField label="Unit price ($)"><Input type="number" min={0} step={0.5} value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: Number(e.target.value) })} /></FormField>
          <label className="flex items-center gap-2 text-[13px] mb-3 cursor-pointer">
            <input type="checkbox" checked={addonForm.allow_quantity} onChange={(e) => setAddonForm({ ...addonForm, allow_quantity: e.target.checked, max_quantity: "" })} />
            Allow quantity (e.g. "$1 per nail extension")
          </label>
          {addonForm.allow_quantity && (
            <FormField label="Max quantity (blank = no limit)">
              <Input type="number" min={1} value={addonForm.max_quantity} onChange={(e) => setAddonForm({ ...addonForm, max_quantity: e.target.value })} placeholder="e.g. 20" />
            </FormField>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveNewAddon} disabled={!addonForm.name} className="flex-1">{createAddOn.isPending ? "Saving…" : "Add add-on"}</Button>
            <Button variant="default" onClick={() => setShowNewAddon(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Edit add-on modal */}
      {editingAddon && (
        <Modal title="Edit add-on" onClose={() => setEditingAddon(null)}>
          <FormField label="Name"><Input value={editingAddon.name} onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })} /></FormField>
          <FormField label="Unit price ($)"><Input type="number" min={0} step={0.5} value={editingAddon.price} onChange={(e) => setEditingAddon({ ...editingAddon, price: Number(e.target.value) })} /></FormField>
          <label className="flex items-center gap-2 text-[13px] mb-3 cursor-pointer">
            <input type="checkbox" checked={editingAddon.allow_quantity} onChange={(e) => setEditingAddon({ ...editingAddon, allow_quantity: e.target.checked, max_quantity: e.target.checked ? editingAddon.max_quantity : null })} />
            Allow quantity
          </label>
          {editingAddon.allow_quantity && (
            <FormField label="Max quantity (blank = no limit)">
              <Input type="number" min={1} value={editingAddon.max_quantity ?? ""} onChange={(e) => setEditingAddon({ ...editingAddon, max_quantity: e.target.value ? Number(e.target.value) : null })} placeholder="e.g. 20" />
            </FormField>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="primary" onClick={saveEditAddon} className="flex-1">{updateAddOn.isPending ? "Saving…" : "Save changes"}</Button>
            <Button variant="default" onClick={() => setEditingAddon(null)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}