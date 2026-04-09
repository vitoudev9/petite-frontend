import axios from "axios";
import type {
  Appointment, Client, Staff, Service,
  CreateAppointment, UpdateAppointment,
  CreateClient, UpdateClient,
  CreateStaff, UpdateStaff,
  CreateService, UpdateService,
} from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Appointments ─────────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: (params?: {
    date?: string;
    staff_id?: number;
    client_id?: number;
    status?: string;
  }) => api.get<Appointment[]>("/appointments", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),

  create: (data: CreateAppointment) =>
    api.post<Appointment>("/appointments", data).then((r) => r.data),

  update: (id: number, data: UpdateAppointment) =>
    api.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/appointments/${id}`),
};

// ── Clients ───────────────────────────────────────────────────────────────────

export const clientsApi = {
  list: () => api.get<Client[]>("/clients").then((r) => r.data),

  get: (id: number) =>
    api.get<Client>(`/clients/${id}`).then((r) => r.data),

  create: (data: CreateClient) =>
    api.post<Client>("/clients", data).then((r) => r.data),

  update: (id: number, data: UpdateClient) =>
    api.patch<Client>(`/clients/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/clients/${id}`),
};

// ── Staff ─────────────────────────────────────────────────────────────────────

export const staffApi = {
  list: () => api.get<Staff[]>("/staffs").then((r) => r.data),

  get: (id: number) =>
    api.get<Staff>(`/staffs/${id}`).then((r) => r.data),

  create: (data: CreateStaff) =>
    api.post<Staff>("/staffs", data).then((r) => r.data),

  update: (id: number, data: UpdateStaff) =>
    api.patch<Staff>(`/staffs/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/staffs/${id}`),
};

// ── Services ──────────────────────────────────────────────────────────────────

export const servicesApi = {
  list: (category?: string) =>
    api.get<Service[]>("/services", { params: category ? { category } : {} }).then((r) => r.data),

  get: (id: number) =>
    api.get<Service>(`/services/${id}`).then((r) => r.data),

  create: (data: CreateService) =>
    api.post<Service>("/services", data).then((r) => r.data),

  update: (id: number, data: UpdateService) =>
    api.patch<Service>(`/services/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/services/${id}`),
};
