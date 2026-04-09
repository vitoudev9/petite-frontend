import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, clientsApi, staffApi, servicesApi } from "@/lib/api";
import type {
  CreateAppointment, UpdateAppointment,
  CreateClient, UpdateClient,
  CreateStaff, UpdateStaff,
  CreateService, UpdateService,
} from "@/types";

// ── Query keys ────────────────────────────────────────────────────────────────

export const QK = {
  appointments: (params?: object) => ["appointments", params ?? {}] as const,
  appointment:  (id: number)      => ["appointments", id] as const,
  clients:                         () => ["clients"] as const,
  client:       (id: number)      => ["clients", id] as const,
  staff:                           () => ["staff"] as const,
  staffMember:  (id: number)      => ["staff", id] as const,
  services:     (cat?: string)    => ["services", cat ?? "all"] as const,
};

// ── Appointments ──────────────────────────────────────────────────────────────

export function useAppointments(params?: {
  date?: string;
  staff_id?: number;
  client_id?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: QK.appointments(params),
    queryFn:  () => appointmentsApi.list(params),
  });
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: QK.appointment(id),
    queryFn:  () => appointmentsApi.get(id),
    enabled:  !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointment) => appointmentsApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointment }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

// ── Clients ───────────────────────────────────────────────────────────────────

export function useClients() {
  return useQuery({ queryKey: QK.clients(), queryFn: clientsApi.list });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: QK.client(id),
    queryFn:  () => clientsApi.get(id),
    enabled:  !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClient) => clientsApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.clients() }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClient }) =>
      clientsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.clients() });
      qc.invalidateQueries({ queryKey: QK.client(id) });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.clients() }),
  });
}

// ── Staff ─────────────────────────────────────────────────────────────────────

export function useStaff() {
  return useQuery({ queryKey: QK.staff(), queryFn: staffApi.list });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaff) => staffApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.staff() }),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaff }) =>
      staffApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.staff() }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.staff() }),
  });
}

// ── Services ──────────────────────────────────────────────────────────────────

export function useServices(category?: string) {
  return useQuery({
    queryKey: QK.services(category),
    queryFn:  () => servicesApi.list(category),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateService) => servicesApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateService }) =>
      servicesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}
